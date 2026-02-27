package tools

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/iqbalyusuf/luchor/internal/agent"
	"github.com/iqbalyusuf/luchor/internal/llm"
)

// CleanHTML cleans HTML content to extract readable text.
type CleanHTML struct {
	Definition llm.ToolDef
	Handler    agent.ToolHandler
}

// NewCleanHTML creates a new CleanHTML tool.
func NewCleanHTML() *CleanHTML {
	t := &CleanHTML{}
	t.Definition = llm.ToolDef{
		Name:        "clean_html",
		Description: "Clean HTML content by removing scripts, styles, and navigation. Returns readable text content.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"html": map[string]any{
					"type":        "string",
					"description": "The HTML content to clean",
				},
			},
			"required": []string{"html"},
		},
	}
	t.Handler = t.handle
	return t
}

func (t *CleanHTML) handle(_ context.Context, input json.RawMessage) (string, error) {
	var params struct {
		HTML string `json:"html"`
	}
	if err := json.Unmarshal(input, &params); err != nil {
		return "", fmt.Errorf("parse clean_html input: %w", err)
	}

	// Remove script and style tags and their contents
	html := params.HTML
	html = removeTagWithContent(html, "script")
	html = removeTagWithContent(html, "style")
	html = removeTagWithContent(html, "nav")
	html = removeTagWithContent(html, "header")
	html = removeTagWithContent(html, "footer")

	// Strip remaining tags
	text := stripHTMLTags(html)
	text = collapseWhitespace(text)

	if len(text) > 50000 {
		text = text[:50000] + "\n... [truncated]"
	}

	return text, nil
}

// removeTagWithContent removes a tag and everything between opening and closing tags.
// This is a simple implementation that handles basic cases.
func removeTagWithContent(html, tag string) string {
	result := html
	openTag := "<" + tag
	closeTag := "</" + tag + ">"

	for {
		start := findCaseInsensitive(result, openTag)
		if start == -1 {
			break
		}
		end := findCaseInsensitive(result[start:], closeTag)
		if end == -1 {
			// No closing tag, remove to end of opening tag
			tagEnd := findCaseInsensitive(result[start:], ">")
			if tagEnd == -1 {
				break
			}
			result = result[:start] + result[start+tagEnd+1:]
		} else {
			result = result[:start] + result[start+end+len(closeTag):]
		}
	}
	return result
}

func findCaseInsensitive(s, substr string) int {
	sLower := toLower(s)
	substrLower := toLower(substr)
	for i := 0; i <= len(sLower)-len(substrLower); i++ {
		if sLower[i:i+len(substrLower)] == substrLower {
			return i
		}
	}
	return -1
}

func toLower(s string) string {
	b := make([]byte, len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' {
			b[i] = c + 32
		} else {
			b[i] = c
		}
	}
	return string(b)
}
