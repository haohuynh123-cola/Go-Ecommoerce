package domain

import "context"

// Entity
type User struct {
	ID       int64  `db:"id" json:"id"`
	Name     string `db:"name" json:"name"`
	Email    string `db:"email" json:"email"`
	Verify   bool   `db:"verify" json:"verify"`
	Password string `db:"password" json:"password"`
}

type MeResult struct {
	ID     int64  `db:"id" json:"id"`
	Name   string `db:"name" json:"name"`
	Email  string `db:"email" json:"email"`
	Verify bool   `db:"verify" json:"verify"`
}

type UserLogin struct {
	Email    string `db:"email" json:"email"`
	Password string `db:"password" json:"password"`
}

type IUserRepository interface {
	FindUserByEmail(ctx context.Context, email string) (*User, error)
	FindUserByID(ctx context.Context, id int64) (*MeResult, error)
	CreateUser(ctx context.Context, req *User) (*User, error)
}
