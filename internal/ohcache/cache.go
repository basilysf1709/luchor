package ohcache

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/google/uuid"
)

// CacheEntry tracks a cached artifact on disk.
type CacheEntry struct {
	ID       string `json:"id"`
	Label    string `json:"label"`
	FilePath string `json:"file_path"`
	MimeType string `json:"mime_type"`
	Size     int64  `json:"size"`
}

// Cache stores large artifacts on disk, referenced by ID.
type Cache struct {
	dir     string
	mu      sync.RWMutex
	entries map[string]*CacheEntry
}

// NewCache creates a cache backed by the given directory.
func NewCache(dir string) (*Cache, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("create cache dir: %w", err)
	}
	return &Cache{
		dir:     dir,
		entries: make(map[string]*CacheEntry),
	}, nil
}

// Store writes data to cache and returns a cache ID.
func (c *Cache) Store(label, mimeType string, data []byte) (string, error) {
	id := uuid.New().String()

	ext := ".bin"
	switch mimeType {
	case "text/html":
		ext = ".html"
	case "text/plain":
		ext = ".txt"
	case "application/json":
		ext = ".json"
	case "text/x-python":
		ext = ".py"
	case "text/csv":
		ext = ".csv"
	}

	filePath := filepath.Join(c.dir, id+ext)
	if err := os.WriteFile(filePath, data, 0o644); err != nil {
		return "", fmt.Errorf("write cache file: %w", err)
	}

	entry := &CacheEntry{
		ID:       id,
		Label:    label,
		FilePath: filePath,
		MimeType: mimeType,
		Size:     int64(len(data)),
	}

	c.mu.Lock()
	c.entries[id] = entry
	c.mu.Unlock()

	return id, nil
}

// Retrieve loads cached data by ID.
func (c *Cache) Retrieve(id string) ([]byte, *CacheEntry, error) {
	c.mu.RLock()
	entry, ok := c.entries[id]
	c.mu.RUnlock()

	if !ok {
		return nil, nil, fmt.Errorf("cache entry not found: %s", id)
	}

	data, err := os.ReadFile(entry.FilePath)
	if err != nil {
		return nil, nil, fmt.Errorf("read cache file: %w", err)
	}

	return data, entry, nil
}

// Get returns the cache entry metadata without loading data.
func (c *Cache) Get(id string) (*CacheEntry, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	entry, ok := c.entries[id]
	return entry, ok
}

// List returns all cache entries.
func (c *Cache) List() []*CacheEntry {
	c.mu.RLock()
	defer c.mu.RUnlock()

	entries := make([]*CacheEntry, 0, len(c.entries))
	for _, e := range c.entries {
		entries = append(entries, e)
	}
	return entries
}
