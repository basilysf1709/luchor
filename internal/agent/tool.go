package agent

import (
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// NewToolAgent creates the Tool Agent with search and cleanup tools.
func NewToolAgent(client *llm.Client, tools ToolRegistry, toolDefs []llm.ToolDef) Agent {
	return &baseAgent{
		id:           ohcache.AgentTool,
		recipients:   []ohcache.AgentID{ohcache.AgentBlueprint, ohcache.AgentMGR},
		client:       client,
		systemPrompt: llm.SystemPrompts["tool"],
		respondTool:  ohcache.ToolOutputSchema(),
		agentTools:   toolDefs,
		toolHandlers: tools,
	}
}
