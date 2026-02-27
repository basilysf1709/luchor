package tools

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/iqbalyusuf/luchor/internal/agent"
	"github.com/iqbalyusuf/luchor/internal/llm"
)

// Default rate limiter: 1 request per second for web fetches.
var webRateLimiter = NewRateLimiter(1 * time.Second)

// FetchURL fetches a URL and returns the response body.
type FetchURL struct {
	Definition llm.ToolDef
	Handler    agent.ToolHandler
}

// NewFetchURL creates a new FetchURL tool.
func NewFetchURL() *FetchURL {
	t := &FetchURL{}
	t.Definition = llm.ToolDef{
		Name:        "fetch_url",
		Description: "Fetch the HTML content of a URL. Returns the raw HTML body.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"url": map[string]any{
					"type":        "string",
					"description": "The URL to fetch",
				},
			},
			"required": []string{"url"},
		},
	}
	t.Handler = t.handle
	return t
}

func (t *FetchURL) handle(ctx context.Context, input json.RawMessage) (string, error) {
	var params struct {
		URL string `json:"url"`
	}
	if err := json.Unmarshal(input, &params); err != nil {
		return "", fmt.Errorf("parse fetch_url input: %w", err)
	}

	webRateLimiter.Wait()

	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequestWithContext(ctx, "GET", params.URL, nil)
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("User-Agent", "Luchor/1.0 (data collection bot)")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("fetch URL: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 512*1024)) // 512KB limit
	if err != nil {
		return "", fmt.Errorf("read response: %w", err)
	}

	return fmt.Sprintf("Status: %d\nContent-Length: %d\n\n%s", resp.StatusCode, len(body), string(body)), nil
}

// ParseHTML extracts text and structure from HTML content.
type ParseHTML struct {
	Definition llm.ToolDef
	Handler    agent.ToolHandler
}

// NewParseHTML creates a new ParseHTML tool.
func NewParseHTML() *ParseHTML {
	t := &ParseHTML{}
	t.Definition = llm.ToolDef{
		Name:        "parse_html",
		Description: "Parse HTML content and extract text, links, and structural information. Returns a simplified text representation.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"html": map[string]any{
					"type":        "string",
					"description": "The HTML content to parse",
				},
				"selector": map[string]any{
					"type":        "string",
					"description": "Optional CSS selector to focus on (not implemented yet, returns full text)",
				},
			},
			"required": []string{"html"},
		},
	}
	t.Handler = t.handle
	return t
}

func (t *ParseHTML) handle(_ context.Context, input json.RawMessage) (string, error) {
	var params struct {
		HTML     string `json:"html"`
		Selector string `json:"selector"`
	}
	if err := json.Unmarshal(input, &params); err != nil {
		return "", fmt.Errorf("parse parse_html input: %w", err)
	}

	// Simple HTML-to-text extraction (strip tags)
	text := stripHTMLTags(params.HTML)
	// Collapse whitespace
	text = collapseWhitespace(text)

	if len(text) > 50000 {
		text = text[:50000] + "\n... [truncated]"
	}

	return text, nil
}

func stripHTMLTags(s string) string {
	var b strings.Builder
	inTag := false
	for _, r := range s {
		switch {
		case r == '<':
			inTag = true
		case r == '>':
			inTag = false
			b.WriteByte(' ')
		case !inTag:
			b.WriteRune(r)
		}
	}
	return b.String()
}

func collapseWhitespace(s string) string {
	var b strings.Builder
	prevSpace := false
	for _, r := range s {
		if r == ' ' || r == '\t' || r == '\n' || r == '\r' {
			if !prevSpace {
				b.WriteByte(' ')
				prevSpace = true
			}
		} else {
			b.WriteRune(r)
			prevSpace = false
		}
	}
	return strings.TrimSpace(b.String())
}
