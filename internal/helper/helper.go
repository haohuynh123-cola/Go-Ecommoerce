package helper

func GetOffset(page, pageSize int) int {
	if page < 1 {
		page = 1
	}
	return (page - 1) * pageSize
}

func GetLimit(pageSize int) int {
	if pageSize < 1 {
		pageSize = 10
	}
	return pageSize
}
