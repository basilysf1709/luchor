package agent

import (
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// NewWebAgent creates the Web Agent with browsing tools.
func NewWebAgent(client *llm.Client, tools ToolRegistry, toolDefs []llm.ToolDef) Agent {
	return &baseAgent{
		id:           ohcache.AgentWeb,
		recipients:   []ohcache.AgentID{ohcache.AgentBlueprint, ohcache.AgentMGR},
		client:       client,
		systemPrompt: llm.SystemPrompts["web"],
		respondTool:  ohcache.WebOutputSchema(),
		agentTools:   toolDefs,
		toolHandlers: tools,
	}
}
