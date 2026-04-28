-- +goose Up
ALTER TABLE users ADD COLUMN verify BOOLEAN NOT NULL DEFAULT FALSE;
-- +goose Down
ALTER TABLE users DROP COLUMN verify;
