package repo

import (
	"context"
	"haohuynh123-cola/ecommce/internal/domain"

	"github.com/jmoiron/sqlx"
)

type Repo struct {
	db *sqlx.DB
}

func NewOrderActivityRepository(db *sqlx.DB) domain.OrderActivityRepository {
	return &Repo{db: db}
}

func (r *Repo) GetOrderActivitiesByOrderID(ctx context.Context, orderID int64) ([]*domain.OrderActivity, error) {
	query := `SELECT order_id, description, activity_type, activity_at FROM order_activities WHERE order_id = ? ORDER BY activity_at DESC`
	rows, err := r.db.QueryxContext(ctx, query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []*domain.OrderActivity
	for rows.Next() {
		var activity domain.OrderActivity
		if err := rows.StructScan(&activity); err != nil {
			return nil, err
		}
		activities = append(activities, &activity)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return activities, nil
}

func (r *Repo) CreateOrderActivity(ctx context.Context, activity *domain.OrderActivity) error {
	query := `INSERT INTO order_activities (order_id, description, activity_type, activity_at) VALUES (?, ?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query, activity.OrderID, activity.Description, activity.ActivityType, activity.ActivityAt)

	if err != nil {
		return err
	}

	return nil
}
