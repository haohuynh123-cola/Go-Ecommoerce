package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	Redis    RedisConfig    `mapstructure:"redis"`
	Server   ServerConfig   `mapstructure:"server"`
	Log      LogConfig      `mapstructure:"log"`
	SMTP     SMTPConfig     `mapstructure:"smtp"`
	Mailtrap MailtrapConfig `mapstructure:"mailtrap"`
}

type DatabaseConfig struct {
	DBHost     string `mapstructure:"host"`
	DBPort     string `mapstructure:"port"`
	DBUser     string `mapstructure:"user"`
	DBPassword string `mapstructure:"password"`
	DBName     string `mapstructure:"database_name"`
}

type ServerConfig struct {
	Debug bool `mapstructure:"debug"`
}

type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     string `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

type JWTConfig struct {
	SecretKey string `mapstructure:"secret_key"`
}

type LogConfig struct {
	Level    string `mapstructure:"level"`
	FilePath string `mapstructure:"file_path"`
}

type SMTPConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
}

type MailtrapConfig struct {
	Token string `mapstructure:"token"`
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

func (c *Config) GetJWTSecret() string {
	return c.JWT.SecretKey
}

func (c *Config) GetSMTPConfig() SMTPConfig {
	return c.SMTP
}

func (c *Config) GetMailtrapConfig() MailtrapConfig {
	return c.Mailtrap
}
