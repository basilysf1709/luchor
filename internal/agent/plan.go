package agent

import (
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// NewPlanAgent creates the Plan Agent (pure reasoning, no tools besides respond).
func NewPlanAgent(client *llm.Client) Agent {
	return &baseAgent{
		id:           ohcache.AgentPlan,
		recipients:   []ohcache.AgentID{ohcache.AgentWeb, ohcache.AgentTool, ohcache.AgentBlueprint, ohcache.AgentMGR},
		client:       client,
		systemPrompt: llm.SystemPrompts["plan"],
		respondTool:  ohcache.PlanOutputSchema(),
		agentTools:   nil,
		toolHandlers: nil,
	}
}
