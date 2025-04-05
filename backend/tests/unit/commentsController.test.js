const { getCommentsByProduct, addComment, deleteComment } = require('../../controllers/commentsController');
const Product = require('../../models/Product');
const Comment = require('../../models/Comments');
const Users = require('../../models/Users');

jest.mock('../../models/Product');
jest.mock('../../models/Comments');
jest.mock('../../models/Users');

describe('commentsController', () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    return res;
  };

  describe('getCommentsByProduct', () => {
    it('debería retornar 400 si productId no es válido', async () => {
      const req = { params: { productId: 'abc' } }; // productId no es un número
      const res = mockResponse();

      await getCommentsByProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'El ID del producto debe ser un número válido.',
      });
    });

    it('debería retornar 404 si el producto no existe', async () => {
      const req = { params: { productId: '123' } };
      const res = mockResponse();

      Product.findOne.mockResolvedValue(null); // Producto no encontrado

      await getCommentsByProduct(req, res);

      expect(Product.findOne).toHaveBeenCalledWith({ id: '123' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Producto no encontrado',
      });
    });

    it('debería retornar los comentarios del producto', async () => {
      const req = { params: { productId: '123' } };
      const res = mockResponse();

      Product.findOne.mockResolvedValue({ _id: 'product123' });
      Comment.find.mockResolvedValue([{ text: 'Buen producto', author: 'user123' }]);

      await getCommentsByProduct(req, res);

      expect(Comment.find).toHaveBeenCalledWith({ productId: 'product123' });
      expect(res.json).toHaveBeenCalledWith([{ text: 'Buen producto', author: 'user123' }]);
    });
  });

  describe('addComment', () => {
    it('debería retornar 400 si faltan campos requeridos', async () => {
      const req = { body: { text: 'Buen producto' } }; // Falta productId
      const res = mockResponse();

      await addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'El ID del producto y el texto son obligatorios.',
      });
    });

    it('debería retornar 400 si el texto no es válido', async () => {
      const req = { body: { productId: '123', text: '   ' } }; // Texto vacío
      const res = mockResponse();

      await addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'El texto del comentario no puede estar vacío.',
      });
    });

    it('debería retornar 404 si el producto no existe', async () => {
      const req = { body: { productId: '123', text: 'Buen producto' } };
      const res = mockResponse();

      Product.findOne.mockResolvedValue(null); // Producto no encontrado

      await addComment(req, res);

      expect(Product.findOne).toHaveBeenCalledWith({ id: '123' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Producto no encontrado',
      });
    });

    it('debería crear y guardar un comentario', async () => {
      const req = { body: { productId: '123', text: 'Buen producto' }, user: { id: 'user123' } };
      const res = mockResponse();

      Product.findOne.mockResolvedValue({ _id: 'product123' });
      Users.findById.mockResolvedValue({ name: 'Test User' });
      Comment.prototype.save = jest.fn().mockResolvedValue({
        _id: 'comment123',
        productId: 'product123',
        author: 'Test User',
        text: 'Buen producto',
      });

      await addComment(req, res);

      expect(Comment.prototype.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        comment: expect.objectContaining({ text: 'Buen producto', author: 'Test User' }),
      });
    });
  });

  describe('deleteComment', () => {
    it('debería retornar 403 si el usuario no es admin', async () => {
      const req = { user: { id: 'user123' } };
      const res = mockResponse();

      Users.findById.mockResolvedValue({ role: 'user' }); // Usuario no admin

      await deleteComment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Acceso denegado',
      });
    });

    it('debería retornar 404 si el comentario no existe', async () => {
      const req = { user: { id: 'admin123' }, params: { id: 'comment123' } };
      const res = mockResponse();

      Users.findById.mockResolvedValue({ role: 'admin' });
      Comment.findByIdAndDelete.mockResolvedValue(null); // Comentario no encontrado

      await deleteComment(req, res);

      expect(Comment.findByIdAndDelete).toHaveBeenCalledWith('comment123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Comentario no encontrado',
      });
    });

    it('debería eliminar un comentario correctamente', async () => {
      const req = { user: { id: 'admin123' }, params: { id: 'comment123' } };
      const res = mockResponse();

      Users.findById.mockResolvedValue({ role: 'admin' });
      Comment.findByIdAndDelete.mockResolvedValue({ _id: 'comment123' });

      await deleteComment(req, res);

      expect(Comment.findByIdAndDelete).toHaveBeenCalledWith('comment123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comentario eliminado',
      });
    });
  });
});