package agent

import (
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// NewEngineeringAgent creates the Engineering Agent that generates Python code.
func NewEngineeringAgent(client *llm.Client, tools ToolRegistry, toolDefs []llm.ToolDef) Agent {
	return &baseAgent{
		id:           ohcache.AgentEngineering,
		recipients:   []ohcache.AgentID{ohcache.AgentTest, ohcache.AgentMGR},
		client:       client,
		systemPrompt: llm.SystemPrompts["engineering"],
		respondTool:  ohcache.EngineeringOutputSchema(),
		agentTools:   toolDefs,
		toolHandlers: tools,
	}
}
