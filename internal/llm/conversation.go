package llm

import (
	"github.com/anthropics/anthropic-sdk-go"
)

// MessageInfo represents a message from the hypergraph, used to build Claude API messages.
type MessageInfo struct {
	Role    string // "user" or "assistant"
	Content string
}

// BuildConversation converts a slice of MessageInfo into Claude API MessageParam slices.
// It ensures proper alternation between user and assistant roles.
func BuildConversation(msgs []MessageInfo) []anthropic.MessageParam {
	if len(msgs) == 0 {
		return nil
	}

	var params []anthropic.MessageParam
	var lastRole string

	for _, msg := range msgs {
		role := msg.Role
		if role == "tool_result" {
			role = "user"
		}

		// If same role as last, merge by appending text
		if role == lastRole && len(params) > 0 {
			prevText := extractTextFromParam(params[len(params)-1])
			merged := prevText + "\n\n" + msg.Content

			switch role {
			case "user":
				params[len(params)-1] = anthropic.NewUserMessage(
					anthropic.NewTextBlock(merged),
				)
			case "assistant":
				params[len(params)-1] = anthropic.NewAssistantMessage(
					anthropic.NewTextBlock(merged),
				)
			}
			continue
		}

		switch role {
		case "user":
			params = append(params, anthropic.NewUserMessage(
				anthropic.NewTextBlock(msg.Content),
			))
		case "assistant":
			params = append(params, anthropic.NewAssistantMessage(
				anthropic.NewTextBlock(msg.Content),
			))
		}
		lastRole = role
	}

	// Ensure first message is from user
	if len(params) > 0 && params[0].Role == "assistant" {
		params = append([]anthropic.MessageParam{
			anthropic.NewUserMessage(anthropic.NewTextBlock("Begin.")),
		}, params...)
	}

	return params
}

func extractTextFromParam(msg anthropic.MessageParam) string {
	for _, block := range msg.Content {
		if block.OfText != nil {
			return block.OfText.Text
		}
	}
	return ""
}
