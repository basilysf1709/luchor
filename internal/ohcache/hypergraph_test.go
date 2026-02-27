package ohcache

import (
	"testing"
)

func TestHypergraphAddAndRetrieve(t *testing.T) {
	hg := NewHypergraph()

	// Add a message from user to plan and mgr
	id := hg.AddMessage(AgentUser, []AgentID{AgentPlan, AgentMGR}, "user", "Collect papers", nil)
	if id == "" {
		t.Fatal("expected non-empty message ID")
	}

	if hg.Len() != 1 {
		t.Fatalf("expected 1 message, got %d", hg.Len())
	}

	// Plan should see it
	planMsgs := hg.MessagesFor(AgentPlan)
	if len(planMsgs) != 1 {
		t.Fatalf("plan expected 1 message, got %d", len(planMsgs))
	}
	if planMsgs[0].Content != "Collect papers" {
		t.Fatalf("unexpected content: %s", planMsgs[0].Content)
	}

	// MGR should see it
	mgrMsgs := hg.MessagesFor(AgentMGR)
	if len(mgrMsgs) != 1 {
		t.Fatalf("mgr expected 1 message, got %d", len(mgrMsgs))
	}

	// Web should NOT see it
	webMsgs := hg.MessagesFor(AgentWeb)
	if len(webMsgs) != 0 {
		t.Fatalf("web expected 0 messages, got %d", len(webMsgs))
	}
}

func TestHypergraphRouting(t *testing.T) {
	hg := NewHypergraph()

	// Simulate the plan -> web, tool, blueprint, mgr routing
	hg.AddMessage(AgentUser, []AgentID{AgentPlan, AgentMGR}, "user", "instruction", nil)
	hg.AddMessage(AgentPlan, []AgentID{AgentWeb, AgentTool, AgentBlueprint, AgentMGR}, "assistant", "plan output", nil)

	// Web should see plan output
	webMsgs := hg.MessagesFor(AgentWeb)
	if len(webMsgs) != 1 {
		t.Fatalf("web expected 1 message, got %d", len(webMsgs))
	}
	if webMsgs[0].Content != "plan output" {
		t.Fatalf("unexpected content: %s", webMsgs[0].Content)
	}

	// MGR should see both messages
	mgrMsgs := hg.MessagesFor(AgentMGR)
	if len(mgrMsgs) != 2 {
		t.Fatalf("mgr expected 2 messages, got %d", len(mgrMsgs))
	}

	// Blueprint should see plan output
	bpMsgs := hg.MessagesFor(AgentBlueprint)
	if len(bpMsgs) != 1 {
		t.Fatalf("blueprint expected 1 message, got %d", len(bpMsgs))
	}
}

func TestHypergraphChronological(t *testing.T) {
	hg := NewHypergraph()

	hg.AddMessage(AgentUser, []AgentID{AgentMGR}, "user", "first", nil)
	hg.AddMessage(AgentPlan, []AgentID{AgentMGR}, "assistant", "second", nil)
	hg.AddMessage(AgentWeb, []AgentID{AgentMGR}, "assistant", "third", nil)

	msgs := hg.MessagesFor(AgentMGR)
	if len(msgs) != 3 {
		t.Fatalf("expected 3 messages, got %d", len(msgs))
	}
	if msgs[0].Content != "first" || msgs[1].Content != "second" || msgs[2].Content != "third" {
		t.Fatal("messages not in chronological order")
	}
}
