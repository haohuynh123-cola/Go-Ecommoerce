package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

// googleTokenInfoURL is Google's public endpoint for validating ID tokens.
// It checks the signature, expiry, and returns the decoded JWT payload.
// Reference: https://developers.google.com/identity/sign-in/web/backend-auth
const googleTokenInfoURL = "https://oauth2.googleapis.com/tokeninfo"

// GooglePayload is the subset of the Google ID token claims we rely on.
// Note: Google returns the numeric `exp` and `email_verified` claims as
// strings via the tokeninfo endpoint, so we keep them typed as `string`
// and parse them ourselves.
type GooglePayload struct {
	Aud           string `json:"aud"`
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Exp           string `json:"exp"`
}

// IsEmailVerified reports whether Google considers the user's email verified.
func (p *GooglePayload) IsEmailVerified() bool {
	return p.EmailVerified == "true"
}

// IsExpired reports whether the ID token has already expired.
func (p *GooglePayload) IsExpired(now time.Time) bool {
	exp, err := strconv.ParseInt(p.Exp, 10, 64)
	if err != nil {
		return true
	}
	return now.Unix() >= exp
}

// verifyGoogleIDToken validates the given Google-issued ID token by calling
// Google's tokeninfo endpoint. Returns the decoded payload on success.
func verifyGoogleIDToken(ctx context.Context, idToken string) (*GooglePayload, error) {
	if idToken == "" {
		return nil, fmt.Errorf("empty id token")
	}

	endpoint := googleTokenInfoURL + "?" + url.Values{"id_token": {idToken}}.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("build google tokeninfo request: %w", err)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("call google tokeninfo: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google tokeninfo returned status %d", resp.StatusCode)
	}

	var payload GooglePayload
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode google tokeninfo response: %w", err)
	}

	return &payload, nil
}
