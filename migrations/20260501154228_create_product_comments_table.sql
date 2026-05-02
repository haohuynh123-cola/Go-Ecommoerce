-- +goose Up
CREATE TABLE product_comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_comment_id BIGINT UNSIGNED DEFAULT NULL,
    comment TEXT NOT NULL,
    rating FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES product_comments(id) ON DELETE CASCADE,
    INDEX idx_product_comments_product_id (product_id,parent_comment_id),
    INDEX idx_product_comments_parent_comment_id (parent_comment_id)

);
-- +goose Down
DROP TABLE product_comments;
