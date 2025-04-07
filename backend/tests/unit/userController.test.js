const { updateUserData, getUser, resetPassword, checkEmail } = require("../../controllers/userController");
const Users = require("../../models/Users");
const bcrypt = require("bcryptjs");
const { validatePassword } = require("../../utils/validatePassword");
const { getColombiaTime } = require("../../utils/timezone");

jest.mock("../../models/Users");
jest.mock("bcryptjs");
jest.mock("../../utils/validatePassword");
jest.mock("../../utils/timezone");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  res.send = jest.fn(); // Agregamos el mock para send
  return res;
};

describe("userController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 🛠️ Pruebas para updateUserData
  describe("updateUserData", () => {
    it("debería actualizar los datos del usuario correctamente", async () => {
      const req = {
        params: { id: "123" },
        body: { name: "Updated Name", email: "updated@example.com", role: "admin", active: true },
      };
      const res = mockResponse();

      Users.findById.mockResolvedValue({ _id: "123" });
      Users.findByIdAndUpdate.mockResolvedValue({ name: "Updated Name", email: "updated@example.com" });

      await updateUserData(req, res);

      expect(Users.findById).toHaveBeenCalledWith("123");
      expect(Users.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        { name: "Updated Name", email: "updated@example.com", role: "admin", active: true },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Usuario actualizado",
        user: { name: "Updated Name", email: "updated@example.com" },
      });
    });

    it("debería retornar 404 si el usuario no existe", async () => {
      const req = { params: { id: "123" }, body: {} };
      const res = mockResponse();

      Users.findById.mockResolvedValue(null);

      await updateUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Usuario no encontrado",
      });
    });

    it("debería manejar errores al actualizar los datos del usuario", async () => {
      const req = { params: { id: "123" }, body: {} };
      const res = mockResponse();

      Users.findById.mockRejectedValue(new Error("Database error"));

      await updateUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error del servidor",
      });
    });
  });

  // 👤 Pruebas para getUser
  describe("getUser", () => {
    it("debería retornar los datos del usuario si existe", async () => {
      const req = { params: { id: "123" } };
      const res = mockResponse();

      Users.findById.mockResolvedValue({ name: "Test User" });

      await getUser(req, res);

      expect(Users.findById).toHaveBeenCalledWith("123");
      expect(res.json).toHaveBeenCalledWith({ name: "Test User" });
    });

    it("debería retornar 404 si el usuario no existe", async () => {
      const req = { params: { id: "123" } };
      const res = mockResponse();

      Users.findById.mockResolvedValue(null);

      await getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("User not found");
    });

    it("debería manejar errores al obtener los datos del usuario", async () => {
      const req = { params: { id: "123" } };
      const res = mockResponse();

      Users.findById.mockRejectedValue(new Error("Database error"));

      await getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(new Error("Database error"));
    });
  });

  // 📧 Pruebas para checkEmail
  describe("checkEmail", () => {
    it("debería retornar éxito si el correo está disponible", async () => {
      const req = { body: { email: "available@example.com" } };
      const res = mockResponse();

      Users.findOne.mockResolvedValue(null);

      await checkEmail(req, res);

      expect(Users.findOne).toHaveBeenCalledWith({ email: "available@example.com" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "El correo está disponible.",
      });
    });

    it("debería retornar 200 si el correo ya está registrado", async () => {
      const req = { body: { email: "registered@example.com" } };
      const res = mockResponse();

      Users.findOne.mockResolvedValue({ email: "registered@example.com" });

      await checkEmail(req, res);

      expect(Users.findOne).toHaveBeenCalledWith({ email: "registered@example.com" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "El correo ya está registrado.",
      });
    });

    it("debería manejar errores al verificar el correo", async () => {
      const req = { body: { email: "test@example.com" } };
      const res = mockResponse();

      Users.findOne.mockRejectedValue(new Error("Database error"));

      await checkEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error interno del servidor.",
      });
    });
  });
});