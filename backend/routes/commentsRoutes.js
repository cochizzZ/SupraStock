const express = require('express');
const { fetchUser } = require('../middlewares/authMiddleware');
const { getCommentsByProduct, addComment, deleteComment } = require('../controllers/commentsController');

const router = express.Router();

router.get('/api/comments/:productId', getCommentsByProduct);
router.post('/api/comments', fetchUser, addComment);
router.delete('/api/comments/:id', fetchUser, deleteComment);

module.exports = router;