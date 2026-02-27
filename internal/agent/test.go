package agent

import (
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// NewTestAgent creates the Test Agent that runs and debugs Python code.
func NewTestAgent(client *llm.Client, tools ToolRegistry, toolDefs []llm.ToolDef) Agent {
	return &baseAgent{
		id:           ohcache.AgentTest,
		recipients:   []ohcache.AgentID{ohcache.AgentEngineering, ohcache.AgentMGR},
		client:       client,
		systemPrompt: llm.SystemPrompts["test"],
		respondTool:  ohcache.TestOutputSchema(),
		agentTools:   toolDefs,
		toolHandlers: tools,
	}
}
