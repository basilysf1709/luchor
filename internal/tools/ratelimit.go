package tools

import (
	"sync"
	"time"
)

// RateLimiter provides simple rate limiting for web fetches.
type RateLimiter struct {
	mu          sync.Mutex
	minInterval time.Duration
	lastRequest time.Time
}

// NewRateLimiter creates a rate limiter with the given minimum interval between requests.
func NewRateLimiter(minInterval time.Duration) *RateLimiter {
	return &RateLimiter{
		minInterval: minInterval,
	}
}

// Wait blocks until it's safe to make the next request.
func (rl *RateLimiter) Wait() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(rl.lastRequest)
	if elapsed < rl.minInterval {
		time.Sleep(rl.minInterval - elapsed)
	}
	rl.lastRequest = time.Now()
}
