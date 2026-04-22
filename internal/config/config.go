package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Database DatabaseConfig `mapstructure:"database"`
}

type DatabaseConfig struct {
	DBHost     string `mapstructure:"host"`
	DBPort     string `mapstructure:"port"`
	DBUser     string `mapstructure:"user"`
	DBPassword string `mapstructure:"password"`
	DBName     string `mapstructure:"database_name"`
}

func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./internal/config")

	err := viper.ReadInConfig()
	if err != nil {

		return nil, err
	}

	viper.AutomaticEnv()

	var cfg Config
	err = viper.Unmarshal(&cfg)

	return &cfg, err
}
