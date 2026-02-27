package ohcache

import "time"

// AgentID identifies a specific agent in the system.
type AgentID string

const (
	AgentMGR        AgentID = "mgr"
	AgentPlan       AgentID = "plan"
	AgentWeb        AgentID = "web"
	AgentTool       AgentID = "tool"
	AgentBlueprint  AgentID = "blueprint"
	AgentEngineering AgentID = "engineering"
	AgentTest       AgentID = "test"
	AgentValidation AgentID = "validation"
	AgentUser       AgentID = "user" // represents user input
)

// AllAgents returns all non-user agent IDs.
func AllAgents() []AgentID {
	return []AgentID{
		AgentMGR, AgentPlan, AgentWeb, AgentTool,
		AgentBlueprint, AgentEngineering, AgentTest, AgentValidation,
	}
}

// Message represents a single message in the hypergraph.
type Message struct {
	ID         string    `json:"id"`
	Sender     AgentID   `json:"sender"`
	Recipients []AgentID `json:"recipients"`
	Role       string    `json:"role"` // "user", "assistant", or "tool_result"
	Content    string    `json:"content"`
	CacheRefs  []string  `json:"cache_refs,omitempty"` // references to cached artifacts
	Timestamp  time.Time `json:"timestamp"`
}

// Hyperedge groups a message with its routing info.
type Hyperedge struct {
	Message Message
	Index   int // position in the append-only log
}
