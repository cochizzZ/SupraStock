import React, { useState, useEffect } from 'react';
import './CommentsBox.css';

const CommentsBox = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ author: '', text: '' });
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    const storedComments = JSON.parse(localStorage.getItem(`comments-${productId}`)) || [];
    setComments(storedComments);
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComment({ ...newComment, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.author && newComment.text) {
      const updatedComments = [...comments, { id: comments.length + 1, ...newComment }];
      setComments(updatedComments);
      localStorage.setItem(`comments-${productId}`, JSON.stringify(updatedComments));
      setNewComment({ author: '', text: '' });
    }
  };

  const handleDelete = (commentId) => {
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    setComments(updatedComments);
    localStorage.setItem(`comments-${productId}`, JSON.stringify(updatedComments));
  };

  return (
    <div className='commentsbox'>
      <div className="commentsbox-header">
        <button
          className={`commentsbox-nav-box ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(true)}
        >
          Comentarios ({comments.length})
        </button>
        <button
          className={`commentsbox-nav-box ${!showComments ? 'active' : ''}`}
          onClick={() => setShowComments(false)}
        >
          Dejar un comentario
        </button>
      </div>
      <div className="commentsbox-content">
        {showComments ? (
          <div className="commentsbox-comments">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <p><strong>{comment.author}</strong></p>
                <p>{comment.text}</p>
                <button onClick={() => handleDelete(comment.id)}>Eliminar</button>
              </div>
            ))}
          </div>
        ) : (
          <form className="commentsbox-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="author"
              placeholder="Your name"
              value={newComment.author}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="text"
              placeholder="Your comment"
              value={newComment.text}
              onChange={handleInputChange}
              required
            ></textarea>
            <button type="submit">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommentsBox;
