package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// baseAgent provides shared logic for all agents.
type baseAgent struct {
	id           ohcache.AgentID
	recipients   []ohcache.AgentID
	client       *llm.Client
	systemPrompt string
	respondTool  llm.ToolDef
	agentTools   []llm.ToolDef
	toolHandlers ToolRegistry
}

func (b *baseAgent) ID() ohcache.AgentID {
	return b.id
}

func (b *baseAgent) Recipients() []ohcache.AgentID {
	return b.recipients
}

// Execute runs the agentic loop: call LLM, handle tool_use, repeat until respond or end_turn.
func (b *baseAgent) Execute(ctx context.Context, messages []llm.MessageInfo) (*AgentOutput, error) {
	slog.Info("agent executing", "agent", b.id)

	// Build all tools: agent-specific tools + the respond tool
	allTools := make([]llm.ToolDef, 0, len(b.agentTools)+1)
	allTools = append(allTools, b.agentTools...)
	allTools = append(allTools, b.respondTool)

	// Force tool use so the agent must call a tool (including respond)
	toolChoice := anthropic.ToolChoiceUnionParam{
		OfAny: &anthropic.ToolChoiceAnyParam{},
	}

	apiMessages := llm.BuildConversation(messages)

	maxIter := 10
	for i := 0; i < maxIter; i++ {
		result, err := b.client.Call(ctx, llm.CallParams{
			SystemPrompt: b.systemPrompt,
			Messages:     apiMessages,
			Tools:        allTools,
			ToolChoice:   &toolChoice,
			MaxTokens:    8192,
		})
		if err != nil {
			return nil, fmt.Errorf("agent %s LLM call: %w", b.id, err)
		}

		// Check for respond tool call (structured output)
		for _, tc := range result.ToolCalls {
			if tc.Name == ohcache.RespondToolName {
				summary := extractSummary(tc.Input)
				return &AgentOutput{
					AgentID:    b.id,
					RawJSON:    tc.Input,
					TextOutput: result.TextContent,
					Summary:    summary,
				}, nil
			}
		}

		// Handle other tool calls
		if len(result.ToolCalls) > 0 {
			// Convert ContentBlockUnion to ContentBlockParamUnion for the assistant message
			contentParams := make([]anthropic.ContentBlockParamUnion, 0, len(result.Content))
			for _, block := range result.Content {
				contentParams = append(contentParams, block.ToParam())
			}
			apiMessages = append(apiMessages, anthropic.NewAssistantMessage(contentParams...))

			// Execute each tool and build results
			var toolResults []anthropic.ContentBlockParamUnion
			for _, tc := range result.ToolCalls {
				handler, ok := b.toolHandlers[tc.Name]
				if !ok {
					toolResults = append(toolResults, anthropic.NewToolResultBlock(
						tc.ID,
						fmt.Sprintf("Error: unknown tool %q", tc.Name),
						true,
					))
					continue
				}

				toolResult, err := handler(ctx, tc.Input)
				if err != nil {
					toolResults = append(toolResults, anthropic.NewToolResultBlock(
						tc.ID,
						fmt.Sprintf("Error: %v", err),
						true,
					))
					continue
				}

				toolResults = append(toolResults, anthropic.NewToolResultBlock(
					tc.ID,
					toolResult,
					false,
				))
			}

			apiMessages = append(apiMessages, anthropic.NewUserMessage(toolResults...))

			// Keep forcing tool use on next iteration
			toolChoice = anthropic.ToolChoiceUnionParam{
				OfAny: &anthropic.ToolChoiceAnyParam{},
			}
			continue
		}

		// No tool calls and no respond — return text as output
		if result.TextContent != "" {
			return &AgentOutput{
				AgentID:    b.id,
				TextOutput: result.TextContent,
				Summary:    truncate(result.TextContent, 200),
			}, nil
		}

		break
	}

	return nil, fmt.Errorf("agent %s: max iterations reached without structured output", b.id)
}

func extractSummary(raw json.RawMessage) string {
	var obj map[string]any
	if err := json.Unmarshal(raw, &obj); err != nil {
		return ""
	}
	if s, ok := obj["summary"].(string); ok {
		return s
	}
	return ""
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max] + "..."
}
