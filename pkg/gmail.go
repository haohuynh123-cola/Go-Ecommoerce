package pkg

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type EmailRequest struct {
	From struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	} `json:"from"`
	To []struct {
		Email string `json:"email"`
	} `json:"to"`
	Subject  string `json:"subject"`
	Text     string `json:"text"`
	Category string `json:"category"`
}

func SendEmail(token string, email string, otp string) error {
	reqBody := EmailRequest{
		Subject:  "Your OTP Code",
		Text:     "Your OTP is " + otp,
		Category: "Integration Test",
	}

	url := "https://send.api.mailtrap.io/api/send"

	reqBody.From.Email = "hello@demomailtrap.co"
	reqBody.From.Name = "Mailtrap Test"

	reqBody.To = []struct {
		Email string `json:"email"`
	}{
		{Email: email},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
	return nil
}
