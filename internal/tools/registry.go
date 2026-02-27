package tools

import (
	"github.com/iqbalyusuf/luchor/internal/agent"
	"github.com/iqbalyusuf/luchor/internal/executor"
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// Registry builds tool sets for each agent.
type Registry struct {
	cache   *ohcache.Cache
	sandbox *executor.Sandbox
}

// NewRegistry creates a tool registry.
func NewRegistry(cache *ohcache.Cache, sandbox *executor.Sandbox) *Registry {
	return &Registry{
		cache:   cache,
		sandbox: sandbox,
	}
}

// WebAgentTools returns tools and definitions for the Web Agent.
func (r *Registry) WebAgentTools() (agent.ToolRegistry, []llm.ToolDef) {
	handlers := agent.ToolRegistry{
		"fetch_url":   NewFetchURL().Handler,
		"parse_html":  NewParseHTML().Handler,
		"cache_store": NewCacheStore(r.cache).Handler,
	}
	defs := []llm.ToolDef{
		NewFetchURL().Definition,
		NewParseHTML().Definition,
		NewCacheStore(r.cache).Definition,
	}
	return handlers, defs
}

// ToolAgentTools returns tools and definitions for the Tool Agent.
func (r *Registry) ToolAgentTools() (agent.ToolRegistry, []llm.ToolDef) {
	handlers := agent.ToolRegistry{
		"google_search":  NewGoogleSearch().Handler,
		"clean_html":     NewCleanHTML().Handler,
		"cache_retrieve": NewCacheRetrieve(r.cache).Handler,
	}
	defs := []llm.ToolDef{
		NewGoogleSearch().Definition,
		NewCleanHTML().Definition,
		NewCacheRetrieve(r.cache).Definition,
	}
	return handlers, defs
}

// BlueprintAgentTools returns tools and definitions for the Blueprint Agent.
func (r *Registry) BlueprintAgentTools() (agent.ToolRegistry, []llm.ToolDef) {
	handlers := agent.ToolRegistry{
		"cache_retrieve": NewCacheRetrieve(r.cache).Handler,
	}
	defs := []llm.ToolDef{
		NewCacheRetrieve(r.cache).Definition,
	}
	return handlers, defs
}

// EngineeringAgentTools returns tools and definitions for the Engineering Agent.
func (r *Registry) EngineeringAgentTools() (agent.ToolRegistry, []llm.ToolDef) {
	writeCode := NewWriteCode(r.sandbox.Dir)
	handlers := agent.ToolRegistry{
		"cache_retrieve": NewCacheRetrieve(r.cache).Handler,
		"write_code":     writeCode.Handler,
	}
	defs := []llm.ToolDef{
		NewCacheRetrieve(r.cache).Definition,
		writeCode.Definition,
	}
	return handlers, defs
}

// TestAgentTools returns tools and definitions for the Test Agent.
func (r *Registry) TestAgentTools() (agent.ToolRegistry, []llm.ToolDef) {
	exec := NewExecutePython(r.sandbox)
	handlers := agent.ToolRegistry{
		"execute_python": exec.Handler,
		"cache_retrieve": NewCacheRetrieve(r.cache).Handler,
		"cache_store":    NewCacheStore(r.cache).Handler,
	}
	defs := []llm.ToolDef{
		exec.Definition,
		NewCacheRetrieve(r.cache).Definition,
		NewCacheStore(r.cache).Definition,
	}
	return handlers, defs
}

// ValidationAgentTools returns tools and definitions for the Validation Agent.
func (r *Registry) ValidationAgentTools() (agent.ToolRegistry, []llm.ToolDef) {
	exec := NewExecutePython(r.sandbox)
	readFile := NewReadFile()
	handlers := agent.ToolRegistry{
		"execute_python": exec.Handler,
		"cache_retrieve": NewCacheRetrieve(r.cache).Handler,
		"read_file":      readFile.Handler,
	}
	defs := []llm.ToolDef{
		exec.Definition,
		NewCacheRetrieve(r.cache).Definition,
		readFile.Definition,
	}
	return handlers, defs
}
