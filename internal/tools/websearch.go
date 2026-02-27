package tools

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/iqbalyusuf/luchor/internal/agent"
	"github.com/iqbalyusuf/luchor/internal/llm"
)

// GoogleSearch performs web searches.
type GoogleSearch struct {
	Definition llm.ToolDef
	Handler    agent.ToolHandler
}

// NewGoogleSearch creates a new GoogleSearch tool.
func NewGoogleSearch() *GoogleSearch {
	t := &GoogleSearch{}
	t.Definition = llm.ToolDef{
		Name:        "google_search",
		Description: "Search the web using Google Custom Search API. Returns titles, URLs, and snippets of search results. Requires GOOGLE_CSE_ID and GOOGLE_API_KEY environment variables.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"query": map[string]any{
					"type":        "string",
					"description": "The search query",
				},
				"num_results": map[string]any{
					"type":        "integer",
					"description": "Number of results to return (max 10)",
				},
			},
			"required": []string{"query"},
		},
	}
	t.Handler = t.handle
	return t
}

func (t *GoogleSearch) handle(ctx context.Context, input json.RawMessage) (string, error) {
	var params struct {
		Query      string `json:"query"`
		NumResults int    `json:"num_results"`
	}
	if err := json.Unmarshal(input, &params); err != nil {
		return "", fmt.Errorf("parse google_search input: %w", err)
	}

	apiKey := os.Getenv("GOOGLE_API_KEY")
	cseID := os.Getenv("GOOGLE_CSE_ID")

	if apiKey == "" || cseID == "" {
		// Fallback: return a message explaining search is unavailable
		return fmt.Sprintf("Web search is not configured (GOOGLE_API_KEY and GOOGLE_CSE_ID required). "+
			"Query was: %q. Please use fetch_url with known URLs instead.", params.Query), nil
	}

	numResults := params.NumResults
	if numResults <= 0 || numResults > 10 {
		numResults = 5
	}

	searchURL := fmt.Sprintf(
		"https://www.googleapis.com/customsearch/v1?key=%s&cx=%s&q=%s&num=%d",
		url.QueryEscape(apiKey),
		url.QueryEscape(cseID),
		url.QueryEscape(params.Query),
		numResults,
	)

	client := &http.Client{Timeout: 15 * time.Second}
	req, err := http.NewRequestWithContext(ctx, "GET", searchURL, nil)
	if err != nil {
		return "", fmt.Errorf("create search request: %w", err)
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("search request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read search response: %w", err)
	}

	if resp.StatusCode != 200 {
		return fmt.Sprintf("Search API error (status %d): %s", resp.StatusCode, string(body)), nil
	}

	var searchResult struct {
		Items []struct {
			Title   string `json:"title"`
			Link    string `json:"link"`
			Snippet string `json:"snippet"`
		} `json:"items"`
	}
	if err := json.Unmarshal(body, &searchResult); err != nil {
		return "", fmt.Errorf("parse search results: %w", err)
	}

	var result string
	for i, item := range searchResult.Items {
		result += fmt.Sprintf("%d. %s\n   URL: %s\n   %s\n\n", i+1, item.Title, item.Link, item.Snippet)
	}

	if result == "" {
		return "No search results found.", nil
	}

	return result, nil
}
