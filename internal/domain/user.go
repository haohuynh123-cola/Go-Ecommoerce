package domain

type User struct {
	ID       int64
	Name     string
	Email    string
	Password string
}

type IUserRepository interface {
	FindUserByEmail(email string) (bool, error)
	CreateUser(req *User) (*User, error)
}
