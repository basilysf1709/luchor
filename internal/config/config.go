package config

import (
	"fmt"
	"os"
	"path/filepath"
)

type Config struct {
	APIKey    string
	Model     string
	OutputDir string
	CacheDir  string
	MaxTurns  int
}

func Load() (*Config, error) {
	apiKey := os.Getenv("ANTHROPIC_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("ANTHROPIC_API_KEY environment variable is not set")
	}

	model := os.Getenv("LUCHOR_MODEL")
	if model == "" {
		model = "claude-sonnet-4-5"
	}

	outputDir := os.Getenv("LUCHOR_OUTPUT_DIR")
	if outputDir == "" {
		outputDir = "output"
	}

	cacheDir := os.Getenv("LUCHOR_CACHE_DIR")
	if cacheDir == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			cacheDir = ".luchor_cache"
		} else {
			cacheDir = filepath.Join(home, ".luchor", "cache")
		}
	}

	maxTurns := 30

	return &Config{
		APIKey:    apiKey,
		Model:     model,
		OutputDir: outputDir,
		CacheDir:  cacheDir,
		MaxTurns:  maxTurns,
	}, nil
}
