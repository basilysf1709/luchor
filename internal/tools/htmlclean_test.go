package tools

import (
	"context"
	"encoding/json"
	"testing"
)

func TestCleanHTMLRemovesScripts(t *testing.T) {
	tool := NewCleanHTML()

	input, _ := json.Marshal(map[string]string{
		"html": `<html><head><script>alert('hi')</script></head><body><p>Hello World</p></body></html>`,
	})

	result, err := tool.Handler(context.Background(), input)
	if err != nil {
		t.Fatal(err)
	}

	if result == "" {
		t.Fatal("expected non-empty result")
	}

	// Should contain "Hello World" but not "alert"
	if !contains(result, "Hello World") {
		t.Fatalf("expected result to contain 'Hello World', got: %s", result)
	}
	if contains(result, "alert") {
		t.Fatalf("expected scripts to be removed, got: %s", result)
	}
}

func TestCleanHTMLRemovesNav(t *testing.T) {
	tool := NewCleanHTML()

	input, _ := json.Marshal(map[string]string{
		"html": `<html><body><nav>Menu items</nav><main>Content here</main></body></html>`,
	})

	result, err := tool.Handler(context.Background(), input)
	if err != nil {
		t.Fatal(err)
	}

	if contains(result, "Menu items") {
		t.Fatalf("expected nav to be removed, got: %s", result)
	}
	if !contains(result, "Content here") {
		t.Fatalf("expected main content to remain, got: %s", result)
	}
}

func TestParseHTMLBasic(t *testing.T) {
	tool := NewParseHTML()

	input, _ := json.Marshal(map[string]string{
		"html": `<html><body><h1>Title</h1><p>Paragraph text</p></body></html>`,
	})

	result, err := tool.Handler(context.Background(), input)
	if err != nil {
		t.Fatal(err)
	}

	if !contains(result, "Title") || !contains(result, "Paragraph text") {
		t.Fatalf("expected text content, got: %s", result)
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && findCaseInsensitive(s, substr) != -1
}
