package logger

import (
	"log"
	"os"
	"path/filepath"
	"testing"
	"time"

	"go.uber.org/zap"

	"haohuynh123-cola/ecommce/internal/platform/config"
)

func TestInitLogger_WritesToRotatingFile(t *testing.T) {
	dir := t.TempDir()
	cfg := &config.LogConfig{
		Level:         "debug",
		FilePath:      filepath.Join(dir, "app.log"),
		MaxAgeDays:    7,
		RotationHours: 24,
	}

	logger := InitLogger(cfg)
	if logger == nil {
		t.Fatal("InitLogger returned nil")
	}

	zap.L().Info("zap structured info", zap.String("k", "v"))
	zap.L().Error("zap structured error", zap.Int("code", 500))
	log.Printf("legacy stdlib log bridged %d", 42)

	// Ensure the file is flushed and closed.
	_ = logger.Sync()

	// Wait briefly for the rotator to materialise the file (it lazy-opens
	// on first write but the OS may need a tick to flush).
	time.Sleep(50 * time.Millisecond)

	matches, err := filepath.Glob(filepath.Join(dir, "app.*.log"))
	if err != nil {
		t.Fatalf("glob: %v", err)
	}
	if len(matches) == 0 {
		t.Fatalf("no rotated log file produced in %s", dir)
	}

	data, err := os.ReadFile(matches[0])
	if err != nil {
		t.Fatalf("read rotated file: %v", err)
	}
	body := string(data)
	for _, want := range []string{"zap structured info", "zap structured error", "legacy stdlib log bridged 42"} {
		if !contains(body, want) {
			t.Errorf("expected %q in log file, got:\n%s", want, body)
		}
	}
}

func contains(haystack, needle string) bool {
	return len(haystack) >= len(needle) && (func() bool {
		for i := 0; i+len(needle) <= len(haystack); i++ {
			if haystack[i:i+len(needle)] == needle {
				return true
			}
		}
		return false
	})()
}
