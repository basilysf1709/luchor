package tools

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/iqbalyusuf/luchor/internal/agent"
	"github.com/iqbalyusuf/luchor/internal/executor"
	"github.com/iqbalyusuf/luchor/internal/llm"
)

// ExecutePython runs Python code in a sandboxed subprocess with venv.
type ExecutePython struct {
	Definition llm.ToolDef
	Handler    agent.ToolHandler
	sandbox    *executor.Sandbox
}

// NewExecutePython creates a new ExecutePython tool backed by a sandbox venv.
func NewExecutePython(sandbox *executor.Sandbox) *ExecutePython {
	t := &ExecutePython{sandbox: sandbox}
	t.Definition = llm.ToolDef{
		Name:        "execute_python",
		Description: "Execute a Python script. You can either provide inline code or a filename of a previously written script. The environment has requests, beautifulsoup4, and lxml pre-installed. Returns stdout, stderr, and exit code.",
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"code": map[string]any{
					"type":        "string",
					"description": "Inline Python code to execute (optional if filename is provided)",
				},
				"filename": map[string]any{
					"type":        "string",
					"description": "Filename of a previously written script in the output directory (optional if code is provided)",
				},
				"timeout_seconds": map[string]any{
					"type":        "integer",
					"description": "Timeout in seconds (default 120, max 300)",
				},
			},
		},
	}
	t.Handler = t.handle
	return t
}

func (t *ExecutePython) handle(ctx context.Context, input json.RawMessage) (string, error) {
	var params struct {
		Code           string `json:"code"`
		Filename       string `json:"filename"`
		TimeoutSeconds int    `json:"timeout_seconds"`
	}
	if err := json.Unmarshal(input, &params); err != nil {
		return "", fmt.Errorf("parse execute_python input: %w", err)
	}

	if params.Code == "" && params.Filename == "" {
		return "", fmt.Errorf("either 'code' or 'filename' must be provided")
	}

	timeout := time.Duration(params.TimeoutSeconds) * time.Second
	if timeout <= 0 || timeout > 300*time.Second {
		timeout = 120 * time.Second
	}

	if err := os.MkdirAll(t.sandbox.Dir, 0o755); err != nil {
		return "", fmt.Errorf("create output dir: %w", err)
	}

	// Install any extra deps declared in the code via "# pip:" comments
	if params.Code != "" {
		t.installInlineDeps(ctx, params.Code)
	}

	var scriptPath string
	if params.Code != "" {
		scriptPath = filepath.Join(t.sandbox.Dir, "_temp_script.py")
		if err := os.WriteFile(scriptPath, []byte(params.Code), 0o644); err != nil {
			return "", fmt.Errorf("write temp script: %w", err)
		}
		defer os.Remove(scriptPath)
	} else {
		safeName := filepath.Base(params.Filename)
		scriptPath = filepath.Join(t.sandbox.Dir, safeName)
		if _, err := os.Stat(scriptPath); os.IsNotExist(err) {
			return "", fmt.Errorf("script not found: %s", scriptPath)
		}
	}

	execCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	pythonBin := t.sandbox.PythonBin()
	cmd := exec.CommandContext(execCtx, pythonBin, scriptPath)
	cmd.Dir = t.sandbox.Dir

	var stdout, stderr strings.Builder
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	exitCode := 0
	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			exitCode = exitError.ExitCode()
		} else if execCtx.Err() == context.DeadlineExceeded {
			return fmt.Sprintf("Exit code: -1\n\n--- STDOUT ---\n%s\n--- STDERR ---\nExecution timed out after %s",
				truncateOutput(stdout.String(), 50000), timeout), nil
		} else {
			return "", fmt.Errorf("execute python: %w", err)
		}
	}

	result := fmt.Sprintf("Exit code: %d\n\n--- STDOUT ---\n%s\n--- STDERR ---\n%s",
		exitCode,
		truncateOutput(stdout.String(), 50000),
		truncateOutput(stderr.String(), 10000),
	)

	return result, nil
}

// installInlineDeps extracts "# pip: pkg1 pkg2" from code and installs them.
func (t *ExecutePython) installInlineDeps(ctx context.Context, code string) {
	for _, line := range strings.Split(code, "\n") {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "# pip:") {
			deps := strings.Fields(strings.TrimPrefix(trimmed, "# pip:"))
			if len(deps) > 0 {
				_ = t.sandbox.InstallDeps(deps) // best effort
			}
		}
	}
}

func truncateOutput(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max] + "\n... [truncated]"
}
