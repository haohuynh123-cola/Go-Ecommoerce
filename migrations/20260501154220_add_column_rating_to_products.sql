-- +goose Up
ALTER TABLE products ADD COLUMN rating FLOAT NOT NULL DEFAULT 0;

-- +goose Down
ALTER TABLE products DROP COLUMN rating;
