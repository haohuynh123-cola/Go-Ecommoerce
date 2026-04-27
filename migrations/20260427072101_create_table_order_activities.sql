-- +goose Up
CREATE TABLE order_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_activities_order_id ON order_activities(order_id);

-- +goose Down
DROP TABLE IF EXISTS order_activities;