const { verifyAdmin, signup, login } = require("../../controllers/authController");
const Users = require("../../models/Users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const validatePassword = require("../../utils/validatePassword");

jest.mock("../../models/Users");
jest.mock("jsonwebtoken");
jest.mock("bcryptjs");
jest.mock("nodemailer");
jest.mock("../../utils/validatePassword");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res;
};

describe("authController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ 1. Pruebas para verifyAdmin
  describe("verifyAdmin", () => {
    it("debería retornar 401 si no se envía token", async () => {
      const req = { header: jest.fn().mockReturnValue(null) };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await verifyAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        errors: "Autenticación requerida: ingresa un token válido",
      });
    });

    it("debería retornar 401 si el token es inválido", async () => {
      const req = { header: jest.fn().mockReturnValue("invalid-token") };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      jwt.verify.mockImplementation(() => {
        throw new Error("Token inválido");
      });

      await verifyAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        errors: "Autenticación requerida: ingresa un token válido",
      });
    });

    it("debería retornar 403 si el usuario no es admin", async () => {
      const req = { header: jest.fn().mockReturnValue("valid-token") };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      jwt.verify.mockReturnValue({ user: { id: "123" } });
      Users.findById.mockResolvedValue({ role: "user" });

      await verifyAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        errors: "Acceso denegado: no tienes permisos de administrador",
      });
    });

    it("debería retornar 200 si el usuario es admin", async () => {
      const req = { header: jest.fn().mockReturnValue("valid-token") };
      const res = { send: jest.fn() };
      jwt.verify.mockReturnValue({ user: { id: "123" } });
      Users.findById.mockResolvedValue({ role: "admin" });

      await verifyAdmin(req, res);

      expect(res.send).toHaveBeenCalledWith({ success: true });
    });
  });

  // ✅ 2. Pruebas para signup
  describe("signup", () => {
    it("debería retornar 400 si la contraseña no pasa la validación", async () => {
      const req = { body: { password: "123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      validatePassword.mockReturnValue("Contraseña inválida");

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Contraseña inválida",
      });
    });

    it("debería retornar 400 si el correo ya está registrado", async () => {
      const req = { body: { email: "test@example.com", password: "ValidPass1!" } }; // Contraseña válida
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mockear validatePassword para que no devuelva error
      validatePassword.mockReturnValue(null);

      // Mockear Users.findOne para simular que el correo ya está registrado
      Users.findOne.mockResolvedValue(true);

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "El correo ya está registrado.",
      });
    });

    it("debería crear un usuario correctamente si todo es válido", async () => {
      const req = { body: { name: "Test", email: "test@example.com", password: "Valid1!" } };
      const res = { json: jest.fn() };
      validatePassword.mockReturnValue(null);
      Users.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedPassword");
      Users.prototype.save = jest.fn().mockResolvedValue();
      const sendMailMock = jest.fn().mockResolvedValue();
      nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

      await signup(req, res);

      expect(Users.prototype.save).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Cuenta creada. Por favor, verifica tu correo electrónico para activar tu cuenta.",
      });
    });

    it("debería retornar 500 si ocurre un error", async () => {
      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      Users.prototype.save.mockImplementation(() => {
        throw new Error("Error interno");
      });

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error interno del servidor",
      });
    });

    it("debería retornar 400 si el nombre contiene caracteres especiales", async () => {
        const req = { body: { name: "Test@User", email: "test@example.com", password: "ValidPass1!" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        validatePassword.mockReturnValue(null); // Contraseña válida

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "El nombre no puede contener caracteres especiales.",
        });
    });

    it("debería retornar 400 si la contraseña no pasa la validación", async () => {
        const req = { body: { name: "Test User", email: "test@example.com", password: "123" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        validatePassword.mockReturnValue("Contraseña inválida");

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Contraseña inválida",
        });
    });

    it("debería retornar 400 si el correo ya está registrado", async () => {
        const req = { body: { name: "Test User", email: "test@example.com", password: "ValidPass1!" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        validatePassword.mockReturnValue(null); // Contraseña válida
        Users.findOne.mockResolvedValue(true); // Correo ya registrado

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "El correo ya está registrado.",
        });
    });

    it("debería crear un usuario correctamente si todo es válido", async () => {
        const req = { body: { name: "Test User", email: "test@example.com", password: "ValidPass1!" } };
        const res = { json: jest.fn() };

        validatePassword.mockReturnValue(null); // Contraseña válida
        Users.findOne.mockResolvedValue(null); // Correo no registrado
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashedPassword");
        Users.prototype.save = jest.fn().mockResolvedValue();
        const sendMailMock = jest.fn().mockResolvedValue();
        nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

        await signup(req, res);

        expect(Users.prototype.save).toHaveBeenCalled();
        expect(sendMailMock).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Cuenta creada. Por favor, verifica tu correo electrónico para activar tu cuenta.",
        });
    });

    it("debería retornar 500 si ocurre un error al guardar el usuario", async () => {
        const req = { body: { name: "Test User", email: "test@example.com", password: "Password123!" } };
        const res = mockResponse();
      
        jest.spyOn(console, "error").mockImplementation(() => {}); // Mockear console.error
      
        Users.prototype.save = jest.fn().mockRejectedValue(new Error("Error interno"));
      
        await signup(req, res);
      
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Error interno del servidor",
        });
      
        console.error.mockRestore(); // Restaurar console.error
    });

    it("debería retornar 400 si la contraseña no pasa la validación", async () => {
      const req = { body: { name: "Test User", email: "test@example.com", password: "123" } };
      const res = mockResponse();
    
      validatePassword.mockReturnValue("Contraseña inválida");
    
      await signup(req, res);
    
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Contraseña inválida",
      });
    });
  });

  // ✅ 3. Pruebas para login
  describe("login", () => {
    it("debería retornar error si el correo no está registrado", async () => {
      const req = { body: { email: "test@example.com" } };
      const res = { json: jest.fn() };
      Users.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: "ID de correo electrónico incorrecto",
      });
    });

    it("debería retornar error si la contraseña no coincide", async () => {
      const req = { body: { email: "test@example.com", password: "wrongPassword" } };
      const res = { json: jest.fn() };
      Users.findOne.mockResolvedValue({ password: "hashedPassword" });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: "Contraseña incorrecta",
      });
    });

    it("debería retornar error si el usuario está desactivado", async () => {
      const req = { body: { email: "test@example.com", password: "Valid1!" } };
      const res = { json: jest.fn() };
      Users.findOne.mockResolvedValue({ password: "hashedPassword", active: false });
      bcrypt.compare.mockResolvedValue(true);

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: "Usuario desactivado por la administración, comunícate por medio de la sección de contacto",
      });
    });

    it("debería retornar token y datos del usuario si todo está correcto", async () => {
      const req = { body: { email: "test@example.com", password: "Valid1!" } };
      const res = { json: jest.fn() };
      Users.findOne.mockResolvedValue({
        _id: "123",
        password: "hashedPassword",
        active: true,
        role: "user",
        name: "Test User",
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token");

      await login(req, res);  

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: "token",
        userId: "123",
        username: "Test User",
      });
    });
  });
});