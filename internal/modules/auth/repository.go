package auth

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) IUserRepository {
	return &UserRepository{
		db: db,
	}
}

func (u UserRepository) FindUserByEmail(ctx context.Context, email string) (*User, error) {
	var user User

	err := u.db.GetContext(ctx, &user, "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1", email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func (u UserRepository) CreateUser(ctx context.Context, user *User) (*User, error) {
	query := `INSERT INTO users(name,email,password) VALUES(?,?,?)`

	result, err := u.db.ExecContext(
		ctx,
		query,
		user.Name,
		user.Email,
		user.Password,
	)

	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	user.ID = id

	return user, nil
}

func (u UserRepository) FindUserByID(ctx context.Context, id int64) (*MeResult, error) {
	var user MeResult

	err := u.db.GetContext(ctx, &user, "SELECT id, name, email FROM users WHERE id = ? LIMIT 1", id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func (u UserRepository) VerifyUserByEmail(ctx context.Context, email string, verify bool) error {
	query := `UPDATE users SET verify = ? WHERE email = ?`
	_, err := u.db.ExecContext(ctx, query, verify, email)
	return err
}
