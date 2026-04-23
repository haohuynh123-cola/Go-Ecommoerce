package domain

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
	FindUserByEmail(email string) (*User, error)
	FindUserByID(id int64) (*MeResult, error)
	CreateUser(req *User) (*User, error)
}
