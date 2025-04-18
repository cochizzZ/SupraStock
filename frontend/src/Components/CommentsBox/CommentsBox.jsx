import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from "sweetalert2";
import './CommentsBox.css';

const CommentsBox = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ author: '', text: '' });
  const [showComments, setShowComments] = useState(true);
  let userRole = localStorage.getItem('userRole') || 'guest'; // Cambia 'guest' por el rol predeterminado que desees

  useEffect(() => {
    // Obtener el nombre del usuario desde localStorage
    const username = localStorage.getItem('username');
    if (username) {
      setNewComment((prev) => ({ ...prev, author: username }));
    }

    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/comments/${productId}`);
        setComments(response.data);
      } catch (error) {
        console.error("Error al obtener comentarios:", error);
      }
    };
    fetchComments();
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComment({ ...newComment, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar si el usuario está autenticado
    if (!localStorage.getItem('auth-token')) {
        // Mostrar alerta con SweetAlert2
        Swal.fire({
            title: "Debes iniciar sesión",
            text: "Para dejar un comentario, primero debes iniciar sesión.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Iniciar sesión",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                // Redirigir al apartado de inicio de sesión
                window.location.href = "/login";
            }
        });
        return;
    }

    // Continuar con el envío del comentario si el usuario está autenticado
    if (newComment.text) {
        try {
            const token = localStorage.getItem('auth-token'); // Obtener el token del localStorage
            const response = await axios.post(
                'http://localhost:4000/api/comments',
                { productId, text: newComment.text },
                {
                    headers: {
                        'auth-token': token, // Incluir el token en los encabezados
                    },
                }
            );
            setComments([...comments, response.data.comment]);
            setNewComment({ ...newComment, text: '' });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error("Producto no encontrado:", error.response.data.message);
                Swal.fire({
                    title: "Error",
                    text: "El producto no existe. No se puede agregar el comentario.",
                    icon: "error",
                    confirmButtonColor: "#d33",
                });
            } else if (error.response && error.response.status === 401) {
                Swal.fire({
                    title: "Error",
                    text: "Debes iniciar sesión para dejar un comentario.",
                    icon: "error",
                    confirmButtonColor: "#d33",
                });
            } else {
                console.error("Error al agregar comentario:", error);
                Swal.fire({
                    title: "Error",
                    text: "Hubo un problema al agregar el comentario.",
                    icon: "error",
                    confirmButtonColor: "#d33",
                });
            }
        }
    }
};

const handleDelete = async (commentId) => {
  const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este comentario?");
  if (!confirmDelete) return;

  try {
      const token = localStorage.getItem('auth-token'); // Obtén el token del localStorage
      const response = await axios.delete(`http://localhost:4000/api/comments/${commentId}`, {
          headers: {
              'auth-token': token, // Incluye el token en los encabezados
          },
      });

      if (response.status === 200) {
          setComments(comments.filter(comment => comment._id !== commentId));
          alert("Comentario eliminado correctamente.");
      }
  } catch (error) {
      console.error("Error al eliminar comentario:", error);
      alert("No se pudo eliminar el comentario. Verifica tus permisos.");
  }
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
              <div key={comment._id} className="comment">
                <p><strong>{comment.author}</strong></p>
                <p>{comment.text}</p>
                {userRole === 'admin' && (
                  <button onClick={() => handleDelete(comment._id)}>Eliminar</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <form className="commentsbox-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="author"
              placeholder="Tú nombre"
              value={newComment.author}
              readOnly // Hacer el campo de solo lectura
            />
            <textarea
              name="text"
              placeholder="Tú comentario"
              value={newComment.text}
              onChange={handleInputChange}
              required
            ></textarea>
            <button type="submit">Enviar</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommentsBox;
