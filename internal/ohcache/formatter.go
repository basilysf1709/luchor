package ohcache

import "github.com/iqbalyusuf/luchor/internal/llm"

// RespondToolName is the tool name used for structured output.
const RespondToolName = "respond"

// PlanOutputSchema returns the JSON schema for Plan Agent structured output.
func PlanOutputSchema() llm.ToolDef {
	return llm.ToolDef{
		Name:        RespondToolName,
		Description: "Submit your structured plan output",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"steps": map[string]any{
					"type": "array",
					"items": map[string]any{
						"type": "object",
						"properties": map[string]any{
							"step_number":  map[string]any{"type": "integer"},
							"description":  map[string]any{"type": "string"},
							"target_urls":  map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
							"agent_needed": map[string]any{"type": "string"},
						},
						"required": []string{"step_number", "description"},
					},
				},
				"data_schema": map[string]any{
					"type":        "object",
					"description": "Expected schema of the output dataset",
				},
				"constraints": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"summary": map[string]any{
					"type":        "string",
					"description": "Brief summary of the plan",
				},
			},
			"required": []string{"steps", "summary"},
		},
	}
}

// WebOutputSchema returns the JSON schema for Web Agent structured output.
func WebOutputSchema() llm.ToolDef {
	return llm.ToolDef{
		Name:        RespondToolName,
		Description: "Submit your web research findings",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"site_structure": map[string]any{
					"type":        "string",
					"description": "Description of the site structure and navigation",
				},
				"data_locations": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"pagination_info": map[string]any{
					"type":        "string",
					"description": "How pagination works on the target site",
				},
				"cache_refs": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"summary": map[string]any{"type": "string"},
			},
			"required": []string{"summary"},
		},
	}
}

// ToolOutputSchema returns the JSON schema for Tool Agent structured output.
func ToolOutputSchema() llm.ToolDef {
	return llm.ToolDef{
		Name:        RespondToolName,
		Description: "Submit your tool research findings",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"search_results": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"cleaned_content": map[string]any{
					"type":        "string",
					"description": "Cleaned/extracted content from web pages",
				},
				"cache_refs": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"summary": map[string]any{"type": "string"},
			},
			"required": []string{"summary"},
		},
	}
}

// BlueprintOutputSchema returns the JSON schema for Blueprint Agent structured output.
func BlueprintOutputSchema() llm.ToolDef {
	return llm.ToolDef{
		Name:        RespondToolName,
		Description: "Submit your development blueprint",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"approach": map[string]any{
					"type":        "string",
					"description": "scraping, api, or hybrid",
				},
				"data_schema": map[string]any{
					"type":        "object",
					"description": "Detailed schema for output data",
				},
				"code_structure": map[string]any{
					"type":        "string",
					"description": "Description of how the Python code should be structured",
				},
				"dependencies": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"special_handling": map[string]any{
					"type":        "string",
					"description": "Any special cases or edge cases to handle",
				},
				"summary": map[string]any{"type": "string"},
			},
			"required": []string{"approach", "code_structure", "summary"},
		},
	}
}

// EngineeringOutputSchema returns the JSON schema for Engineering Agent structured output.
func EngineeringOutputSchema() llm.ToolDef {
	return llm.ToolDef{
		Name:        RespondToolName,
		Description: "Submit your generated Python code",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"python_code": map[string]any{
					"type":        "string",
					"description": "The complete Python scraper code",
				},
				"dependencies": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"code_cache_ref": map[string]any{
					"type":        "string",
					"description": "Cache reference for the generated code",
				},
				"explanation": map[string]any{
					"type": "string",
				},
			},
			"required": []string{"python_code", "dependencies"},
		},
	}
}

// TestOutputSchema returns the JSON schema for Test Agent structured output.
func TestOutputSchema() llm.ToolDef {
	return llm.ToolDef{
		Name:        RespondToolName,
		Description: "Submit your test execution results",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"exit_code": map[string]any{
					"type": "integer",
				},
				"stdout": map[string]any{"type": "string"},
				"stderr": map[string]any{"type": "string"},
				"success": map[string]any{"type": "boolean"},
				"errors": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"fixed_code": map[string]any{
					"type":        "string",
					"description": "Fixed Python code if errors were found",
				},
				"summary": map[string]any{"type": "string"},
			},
			"required": []string{"success", "summary"},
		},
	}
}

// ValidationOutputSchema returns the JSON schema for Validation Agent structured output.
func ValidationOutputSchema() llm.ToolDef {
	return llm.ToolDef{
		Name:        RespondToolName,
		Description: "Submit your data validation results",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"quality_rating": map[string]any{
					"type":        "string",
					"description": "poor, fair, good, or excellent",
				},
				"row_count": map[string]any{"type": "integer"},
				"column_count": map[string]any{"type": "integer"},
				"issues": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"sample_data": map[string]any{
					"type":        "string",
					"description": "A few sample rows as text",
				},
				"passed": map[string]any{"type": "boolean"},
				"summary": map[string]any{"type": "string"},
			},
			"required": []string{"quality_rating", "passed", "summary"},
		},
	}
}

// ManagerDecisionSchema returns the JSON schema for MGR structured output.
func ManagerDecisionSchema() llm.ToolDef {
	return llm.ToolDef{
		Name:        RespondToolName,
		Description: "Submit your orchestration decision",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"next_agent": map[string]any{
					"type":        "string",
					"description": "The agent ID to run next (plan, web, tool, blueprint, engineering, test, validation)",
				},
				"reason": map[string]any{
					"type":        "string",
					"description": "Why this agent should run next",
				},
				"phase": map[string]any{
					"type":        "string",
					"description": "Current phase: research or development",
				},
				"is_complete": map[string]any{
					"type":        "boolean",
					"description": "True if the entire pipeline is done",
				},
				"message_to_agent": map[string]any{
					"type":        "string",
					"description": "Optional instruction for the next agent",
				},
			},
			"required": []string{"next_agent", "reason", "is_complete"},
		},
	}
}
