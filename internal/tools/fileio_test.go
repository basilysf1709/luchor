package tools

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/iqbalyusuf/luchor/internal/ohcache"
)

func TestWriteCodeAndRead(t *testing.T) {
	dir := t.TempDir()
	writeTool := NewWriteCode(dir)

	// Write a file
	input, _ := json.Marshal(map[string]string{
		"filename": "test.py",
		"code":     "print('hello')",
	})

	result, err := writeTool.Handler(context.Background(), input)
	if err != nil {
		t.Fatal(err)
	}
	if result == "" {
		t.Fatal("expected non-empty result")
	}

	// Verify file exists
	data, err := os.ReadFile(filepath.Join(dir, "test.py"))
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "print('hello')" {
		t.Fatalf("unexpected file content: %s", string(data))
	}

	// Read it back
	readTool := NewReadFile()
	readInput, _ := json.Marshal(map[string]string{
		"file_path": filepath.Join(dir, "test.py"),
	})

	content, err := readTool.Handler(context.Background(), readInput)
	if err != nil {
		t.Fatal(err)
	}
	if content != "print('hello')" {
		t.Fatalf("unexpected read content: %s", content)
	}
}

func TestWriteCodePathTraversal(t *testing.T) {
	dir := t.TempDir()
	writeTool := NewWriteCode(dir)

	input, _ := json.Marshal(map[string]string{
		"filename": "../../../etc/evil.py",
		"code":     "bad stuff",
	})

	result, err := writeTool.Handler(context.Background(), input)
	if err != nil {
		t.Fatal(err)
	}

	// Should write to dir/evil.py, not ../../../etc/evil.py
	if _, err := os.Stat(filepath.Join(dir, "evil.py")); err != nil {
		t.Fatalf("expected file in safe location: %v (result: %s)", err, result)
	}
}

func TestCacheStoreAndRetrieve(t *testing.T) {
	dir := t.TempDir()
	cache, err := ohcache.NewCache(dir)
	if err != nil {
		t.Fatal(err)
	}

	storeTool := NewCacheStore(cache)
	input, _ := json.Marshal(map[string]string{
		"label":     "test data",
		"content":   "Some cached content",
		"mime_type": "text/plain",
	})

	result, err := storeTool.Handler(context.Background(), input)
	if err != nil {
		t.Fatal(err)
	}
	if result == "" {
		t.Fatal("expected non-empty result with cache ID")
	}

	// Extract cache ID from result (format: "Stored in cache with ID: <id> ...")
	entries := cache.List()
	if len(entries) != 1 {
		t.Fatalf("expected 1 cache entry, got %d", len(entries))
	}

	retrieveTool := NewCacheRetrieve(cache)
	retrieveInput, _ := json.Marshal(map[string]string{
		"cache_id": entries[0].ID,
	})

	content, err := retrieveTool.Handler(context.Background(), retrieveInput)
	if err != nil {
		t.Fatal(err)
	}
	if !contains(content, "Some cached content") {
		t.Fatalf("unexpected retrieved content: %s", content)
	}
}
