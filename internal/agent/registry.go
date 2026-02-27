package agent

import "github.com/iqbalyusuf/luchor/internal/ohcache"

// Registry maps AgentIDs to Agent implementations.
type Registry struct {
	agents map[ohcache.AgentID]Agent
}

// NewRegistry creates an agent registry.
func NewRegistry() *Registry {
	return &Registry{
		agents: make(map[ohcache.AgentID]Agent),
	}
}

// Register adds an agent to the registry.
func (r *Registry) Register(a Agent) {
	r.agents[a.ID()] = a
}

// Get returns an agent by ID.
func (r *Registry) Get(id ohcache.AgentID) (Agent, bool) {
	a, ok := r.agents[id]
	return a, ok
}
