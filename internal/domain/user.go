package domain

import "context"

// Entiy
type User struct {
	ID       int64  `db:"id"`
	Name     string `db:"name"`
	Email    string `db:"email"`
	Password string `db:"password"`
}

type MeResult struct {
	ID    int64  `db:"id"`
	Name  string `db:"name"`
	Email string `db:"email"`
}

type UserLogin struct {
	Email    string `db:"email"`
	Password string `db:"password"`
}

type IUserRepository interface {
	FindUserByEmail(ctx context.Context, email string) (*User, error)
	FindUserByID(ctx context.Context, id int64) (*MeResult, error)
	CreateUser(ctx context.Context, req *User) (*User, error)
}
