package llm

import (
	"testing"
)

func TestBuildConversationBasic(t *testing.T) {
	msgs := []MessageInfo{
		{Role: "user", Content: "Hello"},
		{Role: "assistant", Content: "Hi there"},
		{Role: "user", Content: "How are you?"},
	}

	params := BuildConversation(msgs)
	if len(params) != 3 {
		t.Fatalf("expected 3 params, got %d", len(params))
	}
	if params[0].Role != "user" {
		t.Fatalf("expected first role user, got %s", params[0].Role)
	}
	if params[1].Role != "assistant" {
		t.Fatalf("expected second role assistant, got %s", params[1].Role)
	}
}

func TestBuildConversationMergesSameRole(t *testing.T) {
	msgs := []MessageInfo{
		{Role: "user", Content: "First"},
		{Role: "user", Content: "Second"},
		{Role: "assistant", Content: "Response"},
	}

	params := BuildConversation(msgs)
	if len(params) != 2 {
		t.Fatalf("expected 2 params (merged user), got %d", len(params))
	}
	text := extractTextFromParam(params[0])
	if text != "First\n\nSecond" {
		t.Fatalf("unexpected merged text: %q", text)
	}
}

func TestBuildConversationPrependsUser(t *testing.T) {
	msgs := []MessageInfo{
		{Role: "assistant", Content: "I start"},
	}

	params := BuildConversation(msgs)
	if len(params) != 2 {
		t.Fatalf("expected 2 params (prepended user), got %d", len(params))
	}
	if params[0].Role != "user" {
		t.Fatalf("expected first role user, got %s", params[0].Role)
	}
}

func TestBuildConversationEmpty(t *testing.T) {
	params := BuildConversation(nil)
	if params != nil {
		t.Fatalf("expected nil for empty input, got %v", params)
	}
}

func TestBuildConversationToolResult(t *testing.T) {
	msgs := []MessageInfo{
		{Role: "user", Content: "Do something"},
		{Role: "assistant", Content: "Using tool"},
		{Role: "tool_result", Content: "Tool output"},
	}

	params := BuildConversation(msgs)
	if len(params) != 3 {
		t.Fatalf("expected 3 params, got %d", len(params))
	}
	// tool_result should become user role
	if params[2].Role != "user" {
		t.Fatalf("expected tool_result to become user, got %s", params[2].Role)
	}
}
