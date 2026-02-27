package agent

import (
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// NewValidationAgent creates the Validation Agent that checks data quality.
func NewValidationAgent(client *llm.Client, tools ToolRegistry, toolDefs []llm.ToolDef) Agent {
	return &baseAgent{
		id:           ohcache.AgentValidation,
		recipients:   []ohcache.AgentID{ohcache.AgentMGR},
		client:       client,
		systemPrompt: llm.SystemPrompts["validation"],
		respondTool:  ohcache.ValidationOutputSchema(),
		agentTools:   toolDefs,
		toolHandlers: tools,
	}
}
