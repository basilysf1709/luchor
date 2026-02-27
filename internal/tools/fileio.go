package tools

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/iqbalyusuf/luchor/internal/agent"
	"github.com/iqbalyusuf/luchor/internal/llm"
	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

// WriteCode writes code to a file in the output directory.
type WriteCode struct {
	Definition llm.ToolDef
	Handler    agent.ToolHandler
	outputDir  string
}

// NewWriteCode creates a new WriteCode tool.
func NewWriteCode(outputDir string) *WriteCode {
	t := &WriteCode{outputDir: outputDir}
	t.Definition = llm.ToolDef{
		Name:        "write_code",
		Description: "Write Python code to a file. The file will be created in the output directory.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"filename": map[string]any{
					"type":        "string",
					"description": "The filename (e.g., scraper.py)",
				},
				"code": map[string]any{
					"type":        "string",
					"description": "The Python code to write",
				},
			},
			"required": []string{"filename", "code"},
		},
	}
	t.Handler = t.handle
	return t
}

func (t *WriteCode) handle(_ context.Context, input json.RawMessage) (string, error) {
	var params struct {
		Filename string `json:"filename"`
		Code     string `json:"code"`
	}
	if err := json.Unmarshal(input, &params); err != nil {
		return "", fmt.Errorf("parse write_code input: %w", err)
	}

	// Sanitize filename - prevent path traversal
	safeName := filepath.Base(params.Filename)
	if safeName == "." || safeName == ".." {
		return "", fmt.Errorf("invalid filename: %s", params.Filename)
	}

	if err := os.MkdirAll(t.outputDir, 0o755); err != nil {
		return "", fmt.Errorf("create output dir: %w", err)
	}

	filePath := filepath.Join(t.outputDir, safeName)
	if err := os.WriteFile(filePath, []byte(params.Code), 0o644); err != nil {
		return "", fmt.Errorf("write file: %w", err)
	}

	return fmt.Sprintf("Code written to %s (%d bytes)", filePath, len(params.Code)), nil
}

// ReadFile reads a file from the output directory.
type ReadFile struct {
	Definition llm.ToolDef
	Handler    agent.ToolHandler
}

// NewReadFile creates a new ReadFile tool.
func NewReadFile() *ReadFile {
	t := &ReadFile{}
	t.Definition = llm.ToolDef{
		Name:        "read_file",
		Description: "Read the contents of a file. Returns the file content as text.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"file_path": map[string]any{
					"type":        "string",
					"description": "Path to the file to read",
				},
			},
			"required": []string{"file_path"},
		},
	}
	t.Handler = t.handle
	return t
}

func (t *ReadFile) handle(_ context.Context, input json.RawMessage) (string, error) {
	var params struct {
		FilePath string `json:"file_path"`
	}
	if err := json.Unmarshal(input, &params); err != nil {
		return "", fmt.Errorf("parse read_file input: %w", err)
	}

	data, err := os.ReadFile(params.FilePath)
	if err != nil {
		return "", fmt.Errorf("read file: %w", err)
	}

	content := string(data)
	if len(content) > 100000 {
		content = content[:100000] + "\n... [truncated]"
	}

	return content, nil
}

// CacheStore stores data in the artifact cache.
type CacheStore struct {
	Definition llm.ToolDef
	Handler    agent.ToolHandler
	cache      *ohcache.Cache
}

// NewCacheStore creates a new CacheStore tool.
func NewCacheStore(cache *ohcache.Cache) *CacheStore {
	t := &CacheStore{cache: cache}
	t.Definition = llm.ToolDef{
		Name:        "cache_store",
		Description: "Store data in the artifact cache. Returns a cache ID that can be referenced later.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"label": map[string]any{
					"type":        "string",
					"description": "A label describing the cached content",
				},
				"content": map[string]any{
					"type":        "string",
					"description": "The content to cache",
				},
				"mime_type": map[string]any{
					"type":        "string",
					"description": "MIME type of the content (e.g., text/html, text/plain)",
				},
			},
			"required": []string{"label", "content"},
		},
	}
	t.Handler = t.handle
	return t
}

func (t *CacheStore) handle(_ context.Context, input json.RawMessage) (string, error) {
	var params struct {
		Label    string `json:"label"`
		Content  string `json:"content"`
		MimeType string `json:"mime_type"`
	}
	if err := json.Unmarshal(input, &params); err != nil {
		return "", fmt.Errorf("parse cache_store input: %w", err)
	}

	mimeType := params.MimeType
	if mimeType == "" {
		mimeType = "text/plain"
	}

	id, err := t.cache.Store(params.Label, mimeType, []byte(params.Content))
	if err != nil {
		return "", fmt.Errorf("store in cache: %w", err)
	}

	return fmt.Sprintf("Stored in cache with ID: %s (label: %s, %d bytes)", id, params.Label, len(params.Content)), nil
}

// CacheRetrieve retrieves data from the artifact cache.
type CacheRetrieve struct {
	Definition llm.ToolDef
	Handler    agent.ToolHandler
	cache      *ohcache.Cache
}

// NewCacheRetrieve creates a new CacheRetrieve tool.
func NewCacheRetrieve(cache *ohcache.Cache) *CacheRetrieve {
	t := &CacheRetrieve{cache: cache}
	t.Definition = llm.ToolDef{
		Name:        "cache_retrieve",
		Description: "Retrieve previously cached data by its cache ID.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"cache_id": map[string]any{
					"type":        "string",
					"description": "The cache ID to retrieve",
				},
			},
			"required": []string{"cache_id"},
		},
	}
	t.Handler = t.handle
	return t
}

func (t *CacheRetrieve) handle(_ context.Context, input json.RawMessage) (string, error) {
	var params struct {
		CacheID string `json:"cache_id"`
	}
	if err := json.Unmarshal(input, &params); err != nil {
		return "", fmt.Errorf("parse cache_retrieve input: %w", err)
	}

	data, entry, err := t.cache.Retrieve(params.CacheID)
	if err != nil {
		return "", err
	}

	content := string(data)
	if len(content) > 100000 {
		content = content[:100000] + "\n... [truncated]"
	}

	return fmt.Sprintf("Cache entry: %s (type: %s, %d bytes)\n\n%s", entry.Label, entry.MimeType, entry.Size, content), nil
}
