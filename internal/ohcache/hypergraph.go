package ohcache

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

// Hypergraph is an append-only log of directed hyperedges (messages).
// Each message has one sender and N recipients.
type Hypergraph struct {
	mu    sync.RWMutex
	edges []Hyperedge
}

// NewHypergraph creates an empty hypergraph.
func NewHypergraph() *Hypergraph {
	return &Hypergraph{}
}

// AddMessage appends a message to the hypergraph and returns its ID.
func (hg *Hypergraph) AddMessage(sender AgentID, recipients []AgentID, role, content string, cacheRefs []string) string {
	hg.mu.Lock()
	defer hg.mu.Unlock()

	msg := Message{
		ID:         uuid.New().String(),
		Sender:     sender,
		Recipients: recipients,
		Role:       role,
		Content:    content,
		CacheRefs:  cacheRefs,
		Timestamp:  time.Now(),
	}

	hg.edges = append(hg.edges, Hyperedge{
		Message: msg,
		Index:   len(hg.edges),
	})

	return msg.ID
}

// MessagesFor returns all messages where agentID is in the recipients list,
// in chronological order.
func (hg *Hypergraph) MessagesFor(agentID AgentID) []Message {
	hg.mu.RLock()
	defer hg.mu.RUnlock()

	var msgs []Message
	for _, edge := range hg.edges {
		for _, r := range edge.Message.Recipients {
			if r == agentID {
				msgs = append(msgs, edge.Message)
				break
			}
		}
	}
	return msgs
}

// AllMessages returns all messages in order.
func (hg *Hypergraph) AllMessages() []Message {
	hg.mu.RLock()
	defer hg.mu.RUnlock()

	msgs := make([]Message, len(hg.edges))
	for i, edge := range hg.edges {
		msgs[i] = edge.Message
	}
	return msgs
}

// Len returns the number of messages.
func (hg *Hypergraph) Len() int {
	hg.mu.RLock()
	defer hg.mu.RUnlock()
	return len(hg.edges)
}
