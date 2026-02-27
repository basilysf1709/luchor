package llm

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
)

// Client wraps the Anthropic Claude API.
type Client struct {
	api   anthropic.Client
	model string
}

// NewClient creates a new Claude API client.
func NewClient(apiKey, model string) *Client {
	api := anthropic.NewClient(option.WithAPIKey(apiKey))
	return &Client{
		api:   api,
		model: model,
	}
}

// ToolDef defines a tool for the Claude API.
type ToolDef struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	InputSchema map[string]any `json:"input_schema"`
}

// CallParams holds parameters for an LLM call.
type CallParams struct {
	SystemPrompt string
	Messages     []anthropic.MessageParam
	Tools        []ToolDef
	ToolChoice   *anthropic.ToolChoiceUnionParam // nil = auto
	MaxTokens    int64
}

// CallResult holds the result from an LLM call.
type CallResult struct {
	Content    []anthropic.ContentBlockUnion
	StopReason anthropic.StopReason
	Usage      anthropic.Usage

	// Parsed from tool_use blocks if present
	ToolCalls []ToolCall
	// Text from text blocks
	TextContent string
}

// ToolCall represents a single tool invocation from the model.
type ToolCall struct {
	ID    string
	Name  string
	Input json.RawMessage
}

// Call makes a single LLM API call.
func (c *Client) Call(ctx context.Context, params CallParams) (*CallResult, error) {
	maxTokens := params.MaxTokens
	if maxTokens == 0 {
		maxTokens = 4096
	}

	reqParams := anthropic.MessageNewParams{
		Model:     c.modelParam(),
		MaxTokens: maxTokens,
		Messages:  params.Messages,
	}

	if params.SystemPrompt != "" {
		reqParams.System = []anthropic.TextBlockParam{
			{Text: params.SystemPrompt},
		}
	}

	if len(params.Tools) > 0 {
		toolParams := make([]anthropic.ToolUnionParam, 0, len(params.Tools))
		for _, t := range params.Tools {
			// Extract properties and required from the schema map
			properties, _ := t.InputSchema["properties"]
			var required []string
			if reqSlice, ok := t.InputSchema["required"]; ok {
				if rs, ok := reqSlice.([]string); ok {
					required = rs
				}
			}

			toolParams = append(toolParams, anthropic.ToolUnionParam{
				OfTool: &anthropic.ToolParam{
					Name:        t.Name,
					Description: anthropic.String(t.Description),
					InputSchema: anthropic.ToolInputSchemaParam{
						Properties: properties,
						Required:   required,
					},
				},
			})
		}
		reqParams.Tools = toolParams
	}

	if params.ToolChoice != nil {
		reqParams.ToolChoice = *params.ToolChoice
	}

	resp, err := c.api.Messages.New(ctx, reqParams)
	if err != nil {
		return nil, fmt.Errorf("claude API call: %w", err)
	}

	result := &CallResult{
		Content:    resp.Content,
		StopReason: resp.StopReason,
		Usage:      resp.Usage,
	}

	for _, block := range resp.Content {
		switch block.Type {
		case "text":
			result.TextContent += block.Text
		case "tool_use":
			result.ToolCalls = append(result.ToolCalls, ToolCall{
				ID:    block.ID,
				Name:  block.Name,
				Input: json.RawMessage(block.Input),
			})
		}
	}

	return result, nil
}

// Model returns the configured model name.
func (c *Client) Model() string {
	return c.model
}

func (c *Client) modelParam() anthropic.Model {
	return anthropic.Model(c.model)
}
