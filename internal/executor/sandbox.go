package executor

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// Sandbox manages a temporary working directory for Python execution.
type Sandbox struct {
	Dir    string
	venvOK bool
}

// NewSandbox creates a sandbox in the given directory.
func NewSandbox(dir string) (*Sandbox, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("create sandbox dir: %w", err)
	}
	return &Sandbox{Dir: dir}, nil
}

// BaseDeps are Python packages pre-installed into every sandbox venv.
var BaseDeps = []string{
	"requests",
	"beautifulsoup4",
	"lxml",
}

// SetupVenv creates a Python virtual environment if one doesn't exist,
// and installs base scraping dependencies.
func (s *Sandbox) SetupVenv() error {
	venvPath := filepath.Join(s.Dir, ".venv")
	if _, err := os.Stat(venvPath); err == nil {
		s.venvOK = true
		return nil // venv already exists
	}

	// Try to create venv
	pythonBin := "python3"
	if _, err := exec.LookPath(pythonBin); err != nil {
		pythonBin = "python"
	}

	cmd := exec.Command(pythonBin, "-m", "venv", venvPath)
	if out, err := cmd.CombinedOutput(); err != nil {
		// venv creation failed, that's OK - we'll use system Python
		fmt.Fprintf(os.Stderr, "venv creation failed: %s\n", string(out))
		return nil
	}

	s.venvOK = true

	// Install base dependencies
	if err := s.InstallDeps(BaseDeps); err != nil {
		fmt.Fprintf(os.Stderr, "base deps install failed: %v\n", err)
		// Non-fatal — continue without them
	}

	return nil
}

// PythonBin returns the path to the Python binary (venv or system).
func (s *Sandbox) PythonBin() string {
	if s.venvOK {
		venvPython := filepath.Join(s.Dir, ".venv", "bin", "python3")
		if _, err := os.Stat(venvPython); err == nil {
			return venvPython
		}
	}

	if path, err := exec.LookPath("python3"); err == nil {
		return path
	}
	return "python"
}

// InstallDeps installs Python dependencies.
func (s *Sandbox) InstallDeps(deps []string) error {
	if len(deps) == 0 {
		return nil
	}

	args := []string{"-m", "pip", "install", "-q"}
	args = append(args, deps...)

	cmd := exec.Command(s.PythonBin(), args...)
	cmd.Dir = s.Dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

// Cleanup removes the sandbox directory.
func (s *Sandbox) Cleanup() error {
	return os.RemoveAll(s.Dir)
}
