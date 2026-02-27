package agent

import (
	"context"
	"encoding/json"

	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// Agent is the interface all agents implement.
type Agent interface {
	// ID returns the agent's unique identifier.
	ID() ohcache.AgentID
	// Recipients returns which agents receive this agent's output.
	Recipients() []ohcache.AgentID
	// Execute runs the agent and returns structured output.
	Execute(ctx context.Context, messages []llm.MessageInfo) (*AgentOutput, error)
}

// AgentOutput is the result from any agent execution.
type AgentOutput struct {
	AgentID    ohcache.AgentID
	RawJSON    json.RawMessage // structured output from the respond tool
	TextOutput string          // any text content alongside tool calls
	Summary    string          // extracted summary for logging
}

// ToolHandler is a function that executes a tool and returns a result string.
type ToolHandler func(ctx context.Context, input json.RawMessage) (string, error)

// ToolRegistry maps tool names to their handlers.
type ToolRegistry map[string]ToolHandler
