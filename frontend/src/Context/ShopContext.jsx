import React, { createContext, useEffect, useState } from "react";
import Swal from "sweetalert2";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 301; index++) {
        cart[index] = 0;
    }
    return cart;
};

const ShopContextProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    // Cargar los productos al iniciar
    useEffect(() => {
        fetch("http://localhost:4000/allproducts")
            .then((response) => response.json())
            .then((data) => setAll_Product(data))
            .catch((error) => console.error("Error fetching products:", error));
    }, []);

    // Cargar el carrito del usuario si está autenticado
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);
        }

        if (localStorage.getItem("auth-token")) {
            fetch("http://localhost:4000/getcart", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "auth-token": localStorage.getItem("auth-token"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            })
                .then((response) => response.json())
                .then((data) => setCartItems(data))
                .catch((error) => console.error("Error fetching cart:", error));
        }
    }, []);

    // Función para manejar el login
    const handleLogin = async (email, password) => {
        const response = await fetch("http://localhost:4000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.success) {
            localStorage.setItem("auth-token", data.token);
            localStorage.setItem("userId", data.userId); // Guardar userId en localStorage
            setUserId(data.userId); // Establecer userId en el estado
            window.location.reload(); // Refrescar para aplicar cambios
        } else {
            alert(data.errors);
        }
    };

    // Agregar un producto al carrito
    const addToCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));

        if (localStorage.getItem("auth-token")) {
            fetch("http://localhost:4000/addtocart", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "auth-token": localStorage.getItem("auth-token"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId, quantity: 1 }),
            })
                .then((response) => response.json())
                .then(() => {
                    Swal.fire({
                        title: "Producto agregado!",
                        text: "Se ha agregado el producto al carrito.",
                        icon: "success",
                        confirmButtonColor: "#3085d6",
                        confirmButtonText: "OK",
                    });
                })
                .catch((error) => console.error("Error adding to cart:", error));
        }
    };

    // Eliminar un producto del carrito
    const removeFromCart = (itemId) => {
        setCartItems((prev) => {
            const updatedCount = Math.max((prev[itemId] || 0) - 1, 0);
            return { ...prev, [itemId]: updatedCount };
        });

        if (localStorage.getItem("auth-token")) {
            fetch("http://localhost:4000/removefromcart", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "auth-token": localStorage.getItem("auth-token"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId }),
            })
                .then((response) => response.json())
                .then(() => {
                    Swal.fire({
                        title: "Producto eliminado!",
                        text: "El producto ha sido eliminado del carrito.",
                        icon: "success",
                        confirmButtonColor: "#3085d6",
                        confirmButtonText: "OK",
                    });
                })
                .catch((error) => console.error("Error removing from cart:", error));
        }
    };

    // Actualizar la cantidad de un producto en el carrito
    const updateCart = (itemId, newQuantity) => {
        setCartItems((prevCart) => {
            const prevQuantity = prevCart[itemId] || 0;
            const updatedCart = { ...prevCart };

            if (newQuantity > 0) {
                updatedCart[itemId] = newQuantity;
            } else {
                delete updatedCart[itemId];
            }

            // Alertas dinámicas para agregar o eliminar productos
            if (newQuantity > prevQuantity) {
                Swal.fire({
                    title: "Cantidad actualizada!",
                    text: `Se agregaron ${newQuantity - prevQuantity} unidades del producto.`,
                    icon: "info",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK",
                });
            } else if (newQuantity < prevQuantity) {
                Swal.fire({
                    title: "Cantidad reducida!",
                    text: `Se eliminaron ${prevQuantity - newQuantity} unidades del producto.`,
                    icon: "warning",
                    confirmButtonColor: "#d33",
                    confirmButtonText: "OK",
                });
            }

            return updatedCart;
        });

        if (localStorage.getItem("auth-token")) {
            fetch("http://localhost:4000/updatecart", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "auth-token": localStorage.getItem("auth-token"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId, quantity: newQuantity }),
            })
                .then((response) => response.json())
                .then(() => console.log("Cart updated successfully"))
                .catch((error) => console.error("Error updating cart:", error));
        }
    };

    // Calcular el total del carrito
    const getTotalCartAmount = () => {
        return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
            if (quantity > 0) {
                const itemInfo = all_product.find((product) => product.id === Number(itemId));
                if (itemInfo) {
                    total += itemInfo.new_price * quantity;
                }
            }
            return total;
        }, 0);
    };

    // Obtener el total de productos en el carrito
    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((total, quantity) => total + (quantity > 0 ? quantity : 0), 0);
    };

    // Proveer las funciones al contexto
    const contextValue = {
        userId,
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
        updateCart,
        handleLogin, // Añadir handleLogin al contexto
    };

    return <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
