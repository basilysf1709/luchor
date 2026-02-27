package ohcache

import (
	"os"
	"testing"
)

func TestCacheStoreAndRetrieve(t *testing.T) {
	dir := t.TempDir()
	cache, err := NewCache(dir)
	if err != nil {
		t.Fatal(err)
	}

	data := []byte("<html><body>Hello</body></html>")
	id, err := cache.Store("test page", "text/html", data)
	if err != nil {
		t.Fatal(err)
	}

	if id == "" {
		t.Fatal("expected non-empty cache ID")
	}

	// Retrieve
	got, entry, err := cache.Retrieve(id)
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != string(data) {
		t.Fatalf("data mismatch: got %q", string(got))
	}
	if entry.Label != "test page" {
		t.Fatalf("label mismatch: got %q", entry.Label)
	}
	if entry.MimeType != "text/html" {
		t.Fatalf("mime type mismatch: got %q", entry.MimeType)
	}
}

func TestCacheRetrieveNotFound(t *testing.T) {
	dir := t.TempDir()
	cache, err := NewCache(dir)
	if err != nil {
		t.Fatal(err)
	}

	_, _, err = cache.Retrieve("nonexistent")
	if err == nil {
		t.Fatal("expected error for nonexistent cache entry")
	}
}

func TestCacheFileExtension(t *testing.T) {
	dir := t.TempDir()
	cache, err := NewCache(dir)
	if err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		mime string
		ext  string
	}{
		{"text/html", ".html"},
		{"text/plain", ".txt"},
		{"application/json", ".json"},
		{"text/x-python", ".py"},
		{"text/csv", ".csv"},
		{"application/octet-stream", ".bin"},
	}

	for _, tt := range tests {
		id, err := cache.Store("test", tt.mime, []byte("data"))
		if err != nil {
			t.Fatal(err)
		}
		entry, ok := cache.Get(id)
		if !ok {
			t.Fatal("expected entry")
		}
		// Check that file exists
		if _, err := os.Stat(entry.FilePath); err != nil {
			t.Fatalf("file not found: %s", entry.FilePath)
		}
	}
}

func TestCacheList(t *testing.T) {
	dir := t.TempDir()
	cache, err := NewCache(dir)
	if err != nil {
		t.Fatal(err)
	}

	cache.Store("a", "text/plain", []byte("aaa"))
	cache.Store("b", "text/plain", []byte("bbb"))

	entries := cache.List()
	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
}
