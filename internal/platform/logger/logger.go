// Package logger wires up the application logger using uber-go/zap.
//
// Output strategy:
//   - stdout (console encoder, colour, human-readable)
//   - rotating file (JSON encoder, structured, machine-parseable)
//
// File rotation is handled by lestrrat-go/file-rotatelogs:
//   - one file per `RotationHours` window (24 by default → one file per day)
//   - files older than `MaxAgeDays` are deleted automatically
//   - the configured `FilePath` is kept as a symlink pointing at the
//     current file so `tail -f logs/app.log` always follows today's log
//
// The configured `Level` is a real minimum: setting `error` drops Info/Warn
// entries instead of merely re-labelling them.
package logger

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	rotatelogs "github.com/lestrrat-go/file-rotatelogs"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"haohuynh123-cola/ecommce/internal/platform/config"
)

const (
	defaultMaxAgeDays    = 7
	defaultRotationHours = 24
	logDirPerm           = 0o755
)

// InitLogger builds the application logger and installs it as the global zap
// logger. After this call:
//   - any package can use `zap.L().Info(...)` / `zap.S().Infof(...)`
//   - legacy `log.Printf` callsites are bridged through zap (Info level)
//   - logs land on stdout AND in the rotated file at logs/app.<date>.log
func InitLogger(cfg *config.LogConfig) *zap.Logger {
	level := parseLevel(cfg.Level)

	cores := []zapcore.Core{
		zapcore.NewCore(consoleEncoder(), zapcore.AddSync(os.Stdout), level),
	}

	fileWriter, fileErr := buildRotatingFile(cfg)
	if fileWriter != nil {
		cores = append(cores, zapcore.NewCore(jsonEncoder(), zapcore.AddSync(fileWriter), level))
	}

	logger := zap.New(zapcore.NewTee(cores...), zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	if fileErr != nil {
		logger.Warn("file logging disabled, stdout-only",
			zap.String("path", cfg.FilePath),
			zap.Error(fileErr))
	}

	zap.ReplaceGlobals(logger)
	// Bridge stdlib `log` package onto zap so legacy callsites
	// (log.Printf / log.Fatal) flow through the same handler.
	zap.RedirectStdLog(logger)

	return logger
}

func parseLevel(raw string) zapcore.Level {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "debug":
		return zapcore.DebugLevel
	case "warn", "warning":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	default:
		return zapcore.InfoLevel
	}
}

func consoleEncoder() zapcore.Encoder {
	cfg := zap.NewDevelopmentEncoderConfig()
	cfg.EncodeTime = zapcore.TimeEncoderOfLayout("2006-01-02 15:04:05.000")
	cfg.EncodeLevel = zapcore.CapitalColorLevelEncoder
	return zapcore.NewConsoleEncoder(cfg)
}

func jsonEncoder() zapcore.Encoder {
	cfg := zap.NewProductionEncoderConfig()
	cfg.TimeKey = "time"
	cfg.EncodeTime = zapcore.ISO8601TimeEncoder
	cfg.MessageKey = "msg"
	cfg.LevelKey = "level"
	cfg.CallerKey = "caller"
	cfg.StacktraceKey = "stack"
	return zapcore.NewJSONEncoder(cfg)
}

// buildRotatingFile sets up a date-based rotating writer. Returns nil when
// FilePath is blank, an error when the directory or rotator can't be created.
func buildRotatingFile(cfg *config.LogConfig) (*rotatelogs.RotateLogs, error) {
	if cfg.FilePath == "" {
		return nil, nil
	}

	dir := filepath.Dir(cfg.FilePath)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, logDirPerm); err != nil {
			return nil, fmt.Errorf("create log dir %q: %w", dir, err)
		}
	}

	ext := filepath.Ext(cfg.FilePath)
	base := strings.TrimSuffix(filepath.Base(cfg.FilePath), ext)
	pattern := filepath.Join(dir, base+".%Y-%m-%d"+ext)

	maxAge := time.Duration(orDefault(cfg.MaxAgeDays, defaultMaxAgeDays)) * 24 * time.Hour
	rotation := time.Duration(orDefault(cfg.RotationHours, defaultRotationHours)) * time.Hour

	opts := []rotatelogs.Option{
		rotatelogs.WithMaxAge(maxAge),
		rotatelogs.WithRotationTime(rotation),
	}
	// Symlinks are POSIX-only; including the option on Windows would error.
	if symlinksSupported() {
		opts = append(opts, rotatelogs.WithLinkName(cfg.FilePath))
	}

	r, err := rotatelogs.New(pattern, opts...)
	if err != nil {
		return nil, fmt.Errorf("init rotating log: %w", err)
	}
	return r, nil
}

func orDefault(v, def int) int {
	if v <= 0 {
		return def
	}
	return v
}

// symlinksSupported reports whether the host filesystem can create the
// "current" symlink. We treat anything other than Windows as supporting it.
func symlinksSupported() bool {
	return os.PathSeparator == '/'
}
