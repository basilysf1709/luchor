package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/iqbalyusuf/luchor/internal/config"
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// Manager orchestrates the multi-agent pipeline.
type Manager struct {
	client   *llm.Client
	hg       *ohcache.Hypergraph
	cache    *ohcache.Cache
	cfg      *config.Config
	registry *Registry

	// Track completed agent runs for the MGR summary
	agentLog []agentLogEntry
}

type agentLogEntry struct {
	AgentID ohcache.AgentID
	Summary string
	Error   string
}

// NewManager creates a new Manager with all dependencies.
func NewManager(client *llm.Client, hg *ohcache.Hypergraph, cache *ohcache.Cache, cfg *config.Config) *Manager {
	return &Manager{
		client: client,
		hg:     hg,
		cache:  cache,
		cfg:    cfg,
	}
}

// SetRegistry sets the agent registry (called after all agents are created).
func (m *Manager) SetRegistry(r *Registry) {
	m.registry = r
}

// ManagerDecision is the parsed output from the MGR agent.
type ManagerDecision struct {
	NextAgent      string `json:"next_agent"`
	Reason         string `json:"reason"`
	Phase          string `json:"phase"`
	IsComplete     bool   `json:"is_complete"`
	MessageToAgent string `json:"message_to_agent"`
}

// Run executes the full pipeline for the given instruction.
func (m *Manager) Run(ctx context.Context, instruction string) (string, error) {
	startTime := time.Now()

	// Add the user instruction to the hypergraph, addressed to Plan and MGR
	m.hg.AddMessage(ohcache.AgentUser, []ohcache.AgentID{ohcache.AgentPlan, ohcache.AgentMGR},
		"user", instruction, nil)

	// Phase 1: Always start with Plan Agent
	slog.Info("--- Phase: PLANNING ---")
	slog.Info("running agent", "agent", "plan", "step", "1/research")
	if err := m.runAgent(ctx, ohcache.AgentPlan); err != nil {
		return "", fmt.Errorf("plan agent failed: %w", err)
	}

	// Phase 2: LLM-based manager decides next steps
	consecutiveErrors := 0
	maxConsecutiveErrors := 3

	for turn := 0; turn < m.cfg.MaxTurns; turn++ {
		decision, err := m.getManagerDecision(ctx, instruction, turn)
		if err != nil {
			consecutiveErrors++
			slog.Error("manager decision failed", "turn", turn, "error", err,
				"consecutive_errors", consecutiveErrors)
			if consecutiveErrors >= maxConsecutiveErrors {
				return "", fmt.Errorf("manager failed %d consecutive times, aborting: %w",
					maxConsecutiveErrors, err)
			}
			continue
		}
		consecutiveErrors = 0

		phase := decision.Phase
		if phase == "" {
			phase = "unknown"
		}

		slog.Info("--- Manager Decision ---",
			"turn", fmt.Sprintf("%d/%d", turn+1, m.cfg.MaxTurns),
			"next_agent", decision.NextAgent,
			"phase", phase,
			"reason", decision.Reason,
			"is_complete", decision.IsComplete,
			"elapsed", time.Since(startTime).Round(time.Second),
		)

		if decision.IsComplete {
			slog.Info("pipeline complete",
				"total_turns", turn+1,
				"total_messages", m.hg.Len(),
				"elapsed", time.Since(startTime).Round(time.Second),
			)
			return m.buildFinalResult(), nil
		}

		nextID := ohcache.AgentID(decision.NextAgent)
		if _, ok := m.registry.Get(nextID); !ok {
			slog.Warn("manager requested unknown agent, recording error",
				"agent", decision.NextAgent)
			m.agentLog = append(m.agentLog, agentLogEntry{
				AgentID: ohcache.AgentID(decision.NextAgent),
				Error:   fmt.Sprintf("unknown agent %q", decision.NextAgent),
			})
			continue
		}

		// If manager has a message for the next agent, add it to hypergraph
		if decision.MessageToAgent != "" {
			m.hg.AddMessage(ohcache.AgentMGR, []ohcache.AgentID{nextID},
				"user", decision.MessageToAgent, nil)
		}

		slog.Info("running agent", "agent", nextID, "phase", phase)
		agentStart := time.Now()
		if err := m.runAgent(ctx, nextID); err != nil {
			slog.Error("agent failed", "agent", nextID, "error", err,
				"duration", time.Since(agentStart).Round(time.Millisecond))
			// Record failure in hypergraph so other agents can see it
			m.hg.AddMessage(nextID, []ohcache.AgentID{ohcache.AgentMGR},
				"assistant", fmt.Sprintf("ERROR: %v", err), nil)
		} else {
			slog.Info("agent completed", "agent", nextID,
				"duration", time.Since(agentStart).Round(time.Millisecond))
		}
	}

	slog.Warn("max turns reached", "max_turns", m.cfg.MaxTurns,
		"elapsed", time.Since(startTime).Round(time.Second))
	return m.buildFinalResult(), nil
}

// runAgent executes a single agent.
func (m *Manager) runAgent(ctx context.Context, agentID ohcache.AgentID) error {
	ag, ok := m.registry.Get(agentID)
	if !ok {
		return fmt.Errorf("agent not found: %s", agentID)
	}

	// Get messages directed to this agent from the hypergraph
	hgMessages := m.hg.MessagesFor(agentID)

	// Convert to MessageInfo for the conversation builder
	msgInfos := make([]llm.MessageInfo, 0, len(hgMessages))
	for _, msg := range hgMessages {
		role := msg.Role
		content := msg.Content

		// Add cache reference info to content
		if len(msg.CacheRefs) > 0 {
			content += "\n\n[Cache references: " + fmt.Sprintf("%v", msg.CacheRefs) + "]"
		}

		msgInfos = append(msgInfos, llm.MessageInfo{
			Role:    role,
			Content: content,
		})
	}

	output, err := ag.Execute(ctx, msgInfos)
	if err != nil {
		m.agentLog = append(m.agentLog, agentLogEntry{
			AgentID: agentID,
			Error:   err.Error(),
		})
		return err
	}

	// Add agent's output to hypergraph, directed to its recipients
	content := output.TextOutput
	if len(output.RawJSON) > 0 {
		content = string(output.RawJSON)
	}

	m.hg.AddMessage(agentID, ag.Recipients(), "assistant", content, nil)

	m.agentLog = append(m.agentLog, agentLogEntry{
		AgentID: agentID,
		Summary: output.Summary,
	})

	return nil
}

// getManagerDecision builds a clear summary prompt and asks the MGR LLM to decide what to do next.
func (m *Manager) getManagerDecision(ctx context.Context, instruction string, turn int) (*ManagerDecision, error) {
	// Build a single, clear summary prompt for the MGR instead of passing raw hypergraph messages.
	// This prevents the "all assistant messages merge" problem.
	var sb strings.Builder

	sb.WriteString("## Original Instruction\n")
	sb.WriteString(instruction)
	sb.WriteString("\n\n")

	sb.WriteString("## Agents That Have Run So Far\n")
	if len(m.agentLog) == 0 {
		sb.WriteString("(none yet)\n")
	}
	for i, entry := range m.agentLog {
		if entry.Error != "" {
			sb.WriteString(fmt.Sprintf("%d. **%s** — ERROR: %s\n", i+1, entry.AgentID, entry.Error))
		} else {
			sb.WriteString(fmt.Sprintf("%d. **%s** — %s\n", i+1, entry.AgentID, entry.Summary))
		}
	}
	sb.WriteString("\n")

	// Include the latest outputs from the most recent agents (compact)
	sb.WriteString("## Latest Agent Outputs (most recent 3)\n")
	allMsgs := m.hg.AllMessages()
	count := 0
	for i := len(allMsgs) - 1; i >= 0 && count < 3; i-- {
		msg := allMsgs[i]
		if msg.Sender == ohcache.AgentUser || msg.Sender == ohcache.AgentMGR {
			continue
		}
		content := msg.Content
		if len(content) > 2000 {
			content = content[:2000] + "... [truncated]"
		}
		sb.WriteString(fmt.Sprintf("### Output from %s\n%s\n\n", msg.Sender, content))
		count++
	}

	sb.WriteString(fmt.Sprintf("## Current Turn: %d/%d\n\n", turn+1, m.cfg.MaxTurns))
	sb.WriteString("Based on the progress above, decide which agent should run next.\n")
	sb.WriteString("The pipeline flow is: plan → web/tool → blueprint → engineering → test → validation → done.\n")
	sb.WriteString("Do NOT re-run an agent that has already completed successfully unless its output was insufficient.\n")
	sb.WriteString("If the engineering, test, and validation agents have all run successfully, mark is_complete=true.\n")

	respondTool := ohcache.ManagerDecisionSchema()
	toolChoice := anthropic.ToolChoiceUnionParam{
		OfTool: &anthropic.ToolChoiceToolParam{
			Name: ohcache.RespondToolName,
		},
	}

	apiMessages := []anthropic.MessageParam{
		anthropic.NewUserMessage(anthropic.NewTextBlock(sb.String())),
	}

	result, err := m.client.Call(ctx, llm.CallParams{
		SystemPrompt: llm.SystemPrompts["mgr"],
		Messages:     apiMessages,
		Tools:        []llm.ToolDef{respondTool},
		ToolChoice:   &toolChoice,
		MaxTokens:    2048,
	})
	if err != nil {
		return nil, fmt.Errorf("MGR LLM call: %w", err)
	}

	// Find the respond tool call
	for _, tc := range result.ToolCalls {
		if tc.Name == ohcache.RespondToolName {
			var decision ManagerDecision
			if err := json.Unmarshal(tc.Input, &decision); err != nil {
				return nil, fmt.Errorf("parse MGR decision: %w", err)
			}
			return &decision, nil
		}
	}

	return nil, fmt.Errorf("MGR did not produce a decision via respond tool")
}

// buildFinalResult assembles the final output from the hypergraph.
func (m *Manager) buildFinalResult() string {
	// Look for validation output first, then test, then last agent
	valMessages := m.hg.MessagesFor(ohcache.AgentMGR)
	var lastValidation string
	var lastTest string

	for _, msg := range valMessages {
		if msg.Sender == ohcache.AgentValidation {
			lastValidation = msg.Content
		}
		if msg.Sender == ohcache.AgentTest {
			lastTest = msg.Content
		}
	}

	if lastValidation != "" {
		return fmt.Sprintf("Validation Result:\n%s", lastValidation)
	}
	if lastTest != "" {
		return fmt.Sprintf("Test Result:\n%s", lastTest)
	}

	// Return last message content
	all := m.hg.AllMessages()
	if len(all) > 0 {
		last := all[len(all)-1]
		return fmt.Sprintf("Last agent output (%s):\n%s", last.Sender, last.Content)
	}

	return "No output produced"
}
