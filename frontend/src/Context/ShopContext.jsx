import React, { createContext, useEffect, useState } from "react";
import Swal from "sweetalert2";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    return [];
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
    const fetchCart = async () => {
        try {
            const response = await fetch("http://localhost:4000/getcart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("auth-token"),
                },
                body: JSON.stringify({}), // Mantener compatibilidad con el backend
            });
    
            const data = await response.json();
    
            if (data.success) {
                setCartItems(data.cart);
            } else {
                console.error("Error al obtener el carrito:", data.message);
            }
        } catch (error) {
            console.error("Error al obtener el carrito:", error);
        }
    };
    
    // Llamar a fetchCart al cargar el contexto
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);
        }
    
        if (localStorage.getItem("auth-token")) {
            fetchCart();
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
    const addToCart = async (productId, quantity) => {
        try {
            const response = await fetch("http://localhost:4000/addtocart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("auth-token"),
                },
                body: JSON.stringify({ itemId: productId, quantity: 1 }),
            });
    
            const data = await response.json();
    
            if (data.success) {
                // Actualizar estado del carrito
                setCartItems((prev) => ({
                    ...prev,
                    [productId]: (prev[productId] || 0) + quantity,
                }));
    
                // Mostrar alerta de éxito
                Swal.fire({
                    title: "Producto agregado!",
                    text: "Se ha agregado el producto al carrito.",
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK",
                });
            } else {
                console.error("Error al agregar al carrito:", data.message);
            }
        } catch (error) {
            console.error("Error al agregar al carrito:", error);
        }
    };
    

    // Eliminar un producto del carrito
    const removeFromCart = async (productId) => {
        try {
            const response = await fetch("http://localhost:4000/removefromcart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("auth-token"),
                },
                body: JSON.stringify({ itemId: productId }),
            });
    
            const data = await response.json();
    
            if (data.success) {
                // Reducir cantidad o eliminar si es 0
                setCartItems((prev) =>
                    prev.map((item) =>
                        item.product_id === productId
                            ? { ...item, quantity: item.quantity - 1 }
                            : item
                    ).filter(item => item.quantity > 0)
                );
    
                Swal.fire({
                    title: "Producto eliminado!",
                    text: "El producto ha sido eliminado del carrito.",
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK",
                });
            } else {
                console.error("Error al eliminar del carrito:", data.message);
            }
        } catch (error) {
            console.error("Error al eliminar del carrito:", error);
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
        return cartItems.reduce((total, item) => {
            if (item.quantity > 0 && item.product_id) {
                total += item.product_id.new_price * item.quantity;
            }
            return total;
        }, 0);
    };

    // Obtener el total de productos en el carrito
    const getTotalCartItems = () => {
        if (!Array.isArray(cartItems)) return 0; // Validar que cartItems sea un array
        return cartItems.reduce((total, item) => total + (item.quantity > 0 ? item.quantity : 0), 0);
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
        handleLogin,
    };

    return <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
