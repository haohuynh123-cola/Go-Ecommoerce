package domain

import "context"

type User struct {
	ID       int64
	Name     string
	Email    string
	Password string
}

type MeResult struct {
	ID    int64
	Name  string
	Email string
}

type UserLogin struct {
	Email    string
	Password string
}

type IUserRepository interface {
	FindUserByEmail(ctx context.Context, email string) (*User, error)
	FindUserByID(ctx context.Context, id int64) (*MeResult, error)
	CreateUser(ctx context.Context, req *User) (*User, error)
}
