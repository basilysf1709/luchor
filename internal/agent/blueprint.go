package agent

import (
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// NewBlueprintAgent creates the Blueprint Agent.
func NewBlueprintAgent(client *llm.Client, tools ToolRegistry, toolDefs []llm.ToolDef) Agent {
	return &baseAgent{
		id:           ohcache.AgentBlueprint,
		recipients:   []ohcache.AgentID{ohcache.AgentEngineering, ohcache.AgentValidation, ohcache.AgentMGR},
		client:       client,
		systemPrompt: llm.SystemPrompts["blueprint"],
		respondTool:  ohcache.BlueprintOutputSchema(),
		agentTools:   toolDefs,
		toolHandlers: tools,
	}
}
