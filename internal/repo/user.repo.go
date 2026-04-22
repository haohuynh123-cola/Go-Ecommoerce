package repo

import (
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

func (u UserRepository) FindUserByEmail(email string) (bool, error) {
	var count int64

	err := u.db.Get(&count, "SELECT id FROM users Where email = ? LIMIT 1", email)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

func (u UserRepository) CreateUser(user *domain.User) (*domain.User, error) {
	query := `INSERT INTO users(name,email,password) VALUES(?,?,?)`

	result, err := u.db.Exec(
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
