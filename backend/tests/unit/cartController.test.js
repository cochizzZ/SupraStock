const { addToCart, removeFromCart, getCart, clearCart, updateCart } = require("../../controllers/cartController");
const Product = require("../../models/Product");
const Users = require("../../models/Users");
const mongoose = require("mongoose");

jest.mock("../../models/Product");
jest.mock("../../models/Users");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res;
};

describe("cartController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 🛒 Pruebas para addToCart
  describe("addToCart", () => {
    it("debería retornar 400 si faltan datos obligatorios", async () => {
      const req = { body: { size: "M", quantity: 1 } }; // Falta itemId
      const res = mockResponse();

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "ID del producto, talla y cantidad son obligatorios.",
      });
    });

    it("debería retornar 400 si la cantidad no es un número entero positivo", async () => {
      const req = { body: { itemId: "123", size: "M", quantity: -1 } };
      const res = mockResponse();

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "La cantidad debe ser un número entero positivo.",
      });
    });

    it("debería retornar 400 si la talla contiene caracteres especiales", async () => {
      const req = { body: { itemId: "123", size: "M@", quantity: 1 } };
      const res = mockResponse();

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "La talla no puede contener caracteres especiales.",
      });
    });

    it("debería retornar 404 si el producto no existe", async () => {
      const req = { body: { itemId: "123", size: "M", quantity: 1 } };
      const res = mockResponse();

      Product.findOne.mockResolvedValue(null); // Producto no encontrado

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Producto no encontrado.",
      });
    });

    it("debería agregar un producto al carrito correctamente", async () => {
      const req = { body: { itemId: "123", size: "M", quantity: 1 }, user: { id: "user123" } };
      const res = { json: jest.fn() };

      Product.findOne.mockResolvedValue({
        _id: "product123",
        sizes: new Map([["M", 10]]), // Talla M con 10 unidades disponibles
      });

      Users.findById.mockResolvedValue({
        _id: "user123",
        cartData: [],
        save: jest.fn().mockResolvedValue(),
      });

      await addToCart(req, res);

      expect(Users.findById).toHaveBeenCalledWith("user123");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Producto agregado al carrito",
        cart: [{ product_id: "product123", size: "M", quantity: 1 }],
      });
    });
  });

  // 🗑️ Pruebas para removeFromCart
  describe("removeFromCart", () => {
    it("debería retornar 400 si faltan datos obligatorios", async () => {
      const req = { body: { size: "M" } }; // Falta itemId
      const res = mockResponse();

      await removeFromCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "ID del producto y talla son obligatorios.",
      });
    });

    it("debería eliminar un producto del carrito correctamente", async () => {
      const req = { body: { itemId: "product123", size: "M" }, user: { id: "user123" } };
      const res = mockResponse();

      Users.findById.mockResolvedValue({
        _id: "user123",
        cartData: [{ product_id: "product123", size: "M", quantity: 1 }],
        save: jest.fn().mockResolvedValue(),
      });

      await removeFromCart(req, res);

      expect(Users.findById).toHaveBeenCalledWith("user123");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Producto eliminado del carrito",
        cart: [],
      });
    });
  });

  // 📦 Pruebas para getCart
  describe("getCart", () => {
    it("debería retornar 404 si el usuario no existe", async () => {
      const req = { user: { id: "user123" } };
      const res = mockResponse();

      Users.findById.mockResolvedValue(null); // Usuario no encontrado

      await getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Usuario no encontrado",
      });
    });

    it("debería retornar el carrito del usuario correctamente", async () => {
      const req = { user: { id: "user123" } };
      const res = mockResponse();

      const user = await Users.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }

      const populatedUser = await user.populate("cartData.product_id");

      Users.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue({
          _id: "user123",
          cartData: [
            {
              product_id: { name: "Product 1", image: "image.jpg", new_price: 100 },
              size: "M",
              quantity: 1,
            },
          ],
        }),
      }));

      await getCart(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        cart: [
          {
            product_id: { name: "Product 1", image: "image.jpg", new_price: 100 },
            size: "M",
            quantity: 1,
          },
        ],
      });
    });
  });

  // 🧹 Pruebas para clearCart
  describe("clearCart", () => {
    it("debería retornar 404 si el usuario no existe", async () => {
      const req = { user: { id: "user123" } };
      const res = mockResponse();

      Users.findById.mockResolvedValue(null); // Usuario no encontrado

      await clearCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Usuario no encontrado",
      });
    });

    it("debería limpiar el carrito correctamente", async () => {
      const req = { user: { id: "user123" } };
      const res = { json: jest.fn() };

      Users.findById.mockResolvedValue({
        _id: "user123",
        cartData: [{ product_id: "product123", size: "M", quantity: 1 }],
        save: jest.fn().mockResolvedValue(),
      });

      await clearCart(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Carrito limpiado correctamente",
      });
    });
  });

  // ♻️ Pruebas para updateCart
  describe("updateCart", () => {
    it("debería retornar 400 si faltan datos obligatorios", async () => {
      const req = { body: { size: "M", quantity: 1 } }; // Falta itemId
      const res = mockResponse();

      await updateCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "ID del producto, talla y cantidad son obligatorios y deben ser válidos.",
      });
    });

    it("debería actualizar la cantidad de un producto correctamente", async () => {
      const validProductId = new mongoose.Types.ObjectId().toString();
      const req = { body: { itemId: validProductId, size: "M", quantity: 2 }, user: { id: "user123" } };
      const res = mockResponse();

      // Mock del producto con tallas y cantidades
      Product.findById.mockResolvedValue({
        _id: validProductId,
        sizes: new Map([["M", 5]]), // Talla "M" con 5 unidades disponibles
      });

      // Mock del usuario con un carrito existente
      Users.findById.mockResolvedValue({
        _id: "user123",
        cartData: [{ product_id: validProductId, size: "M", quantity: 1 }],
        save: jest.fn().mockResolvedValue(),
      });

      await updateCart(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Carrito actualizado correctamente.",
        cart: [{ product_id: validProductId, size: "M", quantity: 2 }],
      });
    });
  });
});