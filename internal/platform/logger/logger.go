package logger

import (
	"haohuynh123-cola/ecommce/internal/platform/config"
	"log"
	"os"
)

func InitLogger(cfg *config.LogConfig) *log.Logger {
	logger := log.New(os.Stdout, "", log.LstdFlags|log.Lshortfile)

	// Set log level based on configuration
	switch cfg.Level {
	case "debug":
		// No additional prefix for debug level
	case "info":
		logger.SetPrefix("INFO: ")
	case "warn":
		logger.SetPrefix("WARN: ")
	case "error":
		logger.SetPrefix("ERROR: ")
	default:
		logger.SetPrefix("INFO: ") // Default to info level
	}

	//create file root project

	logFile, err := os.OpenFile(cfg.FilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		logger.Printf("Failed to open log file: %v", err)
		return logger
	}

	// Set output to both file and stdout
	logger.SetOutput(logFile)
	return logger
}
