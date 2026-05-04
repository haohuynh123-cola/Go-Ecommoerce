package comment

import "github.com/google/wire"

var WireSet = wire.NewSet(
	NewCommentRepository,
	NewCommentService,
	NewCommentHandler,
)
