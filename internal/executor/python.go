package executor

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// RunResult holds the result of a Python execution.
type RunResult struct {
	ExitCode int
	Stdout   string
	Stderr   string
}

// RunScript executes a Python script file.
func RunScript(ctx context.Context, sandbox *Sandbox, scriptPath string, timeout time.Duration) (*RunResult, error) {
	if timeout <= 0 {
		timeout = 120 * time.Second
	}

	execCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := exec.CommandContext(execCtx, sandbox.PythonBin(), scriptPath)
	cmd.Dir = sandbox.Dir

	var stdout, stderr strings.Builder
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	exitCode := 0
	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			exitCode = exitError.ExitCode()
		} else if execCtx.Err() == context.DeadlineExceeded {
			return &RunResult{
				ExitCode: -1,
				Stderr:   "Execution timed out",
			}, nil
		} else {
			return nil, fmt.Errorf("execute script: %w", err)
		}
	}

	return &RunResult{
		ExitCode: exitCode,
		Stdout:   stdout.String(),
		Stderr:   stderr.String(),
	}, nil
}

// RunCode writes code to a temp file and executes it.
func RunCode(ctx context.Context, sandbox *Sandbox, code string, timeout time.Duration) (*RunResult, error) {
	scriptPath := filepath.Join(sandbox.Dir, "_run_code.py")
	if err := os.WriteFile(scriptPath, []byte(code), 0o644); err != nil {
		return nil, fmt.Errorf("write temp script: %w", err)
	}
	defer os.Remove(scriptPath)

	return RunScript(ctx, sandbox, scriptPath, timeout)
}
