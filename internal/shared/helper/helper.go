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

func JoinConditions(conditions []string, separator string) string {
	result := ""
	for i, condition := range conditions {
		if i > 0 {
			result += separator
		}
		result += condition
	}
	return result
}
