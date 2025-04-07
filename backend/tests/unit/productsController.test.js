const { 
    allProducts, 
    removeProduct, 
    addProduct, 
    fullProducts, 
    newCollections, 
    popularinWomen, 
    updateProduct, 
    productDetails 
} = require("../../controllers/productsController");
const Product = require("../../models/Product");

jest.mock("../../models/Product");

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    res.send = jest.fn();
    return res;
};

describe("productsController", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("allProducts", () => {
        it("debería retornar todos los productos disponibles", async () => {
            const req = {};
            const res = mockResponse();
            const mockProducts = [{ id: 1, name: "Product 1", available: true }];

            Product.find.mockResolvedValue(mockProducts);

            await allProducts(req, res);

            expect(Product.find).toHaveBeenCalledWith({ available: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockProducts);
        });

        it("debería manejar errores internos", async () => {
            const req = {};
            const res = mockResponse();

            Product.find.mockRejectedValue(new Error("Database error"));

            await allProducts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "Database error" });
        });
    });

    describe("removeProduct", () => {
        it("debería marcar un producto como no disponible", async () => {
            const req = { body: { id: 1, name: "Product 1" } };
            const res = mockResponse();
            const mockProduct = { id: 1, available: true, save: jest.fn() };

            Product.findOne.mockResolvedValue(mockProduct);

            await removeProduct(req, res);

            expect(Product.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(mockProduct.available).toBe(false);
            expect(mockProduct.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Producto actualizado a no disponible",
                name: "Product 1",
            });
        });

        it("debería retornar 404 si el producto no existe", async () => {
            const req = { body: { id: 1 } };
            const res = mockResponse();

            Product.findOne.mockResolvedValue(null);

            await removeProduct(req, res);

            expect(Product.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Producto no encontrado",
            });
        });

        it("debería manejar errores internos", async () => {
            const req = { body: { id: 1 } };
            const res = mockResponse();

            Product.findOne.mockRejectedValue(new Error("Database error"));

            await removeProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Error interno del servidor",
            });
        });
    });

    describe("addProduct", () => {
        it("debería agregar un nuevo producto", async () => {
            const req = {
                body: {
                    name: "New Product",
                    image: "image.jpg",
                    category: "category",
                    new_price: 100,
                    old_price: 120,
                    description: "Description",
                    stock: 10,
                    sizes: { S: 2, M: 3, L: 5 },
                },
            };
            const res = mockResponse();
            const mockProducts = [{ id: 1 }];
            const mockProduct = { save: jest.fn() };

            Product.find.mockResolvedValue(mockProducts);
            Product.mockImplementation(() => mockProduct);

            await addProduct(req, res);

            expect(Product.find).toHaveBeenCalled();
            expect(mockProduct.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Producto agregado correctamente",
            });
        });

        it("debería retornar 400 si faltan campos obligatorios", async () => {
            const req = { body: { name: "New Product" } }; // Faltan campos
            const res = mockResponse();

            await addProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Todos los campos (name, image, category, new_price, stock, sizes) son obligatorios.",
            });
        });

        it("debería manejar errores internos", async () => {
            const req = { body: { name: "New Product" } };
            const res = mockResponse();

            Product.find.mockRejectedValue(new Error("Database error"));

            await addProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Error interno del servidor",
            });
        });
    });
});