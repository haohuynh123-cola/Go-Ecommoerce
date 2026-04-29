package mailer

import (
	"fmt"
	"haohuynh123-cola/ecommce/internal/platform/config"

	gomail "gopkg.in/mail.v2"
)

func SendEmail(cfgSMTP config.SMTPConfig, email string, otp string) error {
	message := gomail.NewMessage()

	message.SetHeader("From", cfgSMTP.Email)
	message.SetHeader("To", email)
	message.SetHeader("Subject", "Your OTP Code")
	message.SetBody("text/plain", "Your OTP is: "+otp)

	dialer := gomail.NewDialer("smtp.gmail.com", 587, cfgSMTP.Email, cfgSMTP.Password)

	if err := dialer.DialAndSend(message); err != nil {
		return fmt.Errorf("send otp email: %w", err)
	}

	return nil
}
