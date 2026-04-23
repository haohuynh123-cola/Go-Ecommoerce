package repo

import (
	"context"
	"database/sql"
	"haohuynh123-cola/ecommce/internal/domain"

	"github.com/jmoiron/sqlx"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) domain.IUserRepository {
	return &UserRepository{
		db: db,
	}
}

func (u UserRepository) FindUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User

	err := u.db.GetContext(ctx, &user, "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1", email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func (u UserRepository) CreateUser(ctx context.Context, user *domain.User) (*domain.User, error) {
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

func (u UserRepository) FindUserByID(ctx context.Context, id int64) (*domain.MeResult, error) {
	var user domain.MeResult

	err := u.db.GetContext(ctx, &user, "SELECT id, name, email FROM users WHERE id = ? LIMIT 1", id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}
