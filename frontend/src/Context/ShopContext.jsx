import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 301; index++) {
        cart[index] = 0;
    }
    return cart;
};

const ShopContextProvider = ({ children }) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    useEffect(() => {
        fetch("http://localhost:4000/allproducts")
            .then((response) => response.json())
            .then((data) => setAll_Product(data))
            .catch((error) => console.error("Error fetching products:", error));
    }, []);

    useEffect(() => {
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
                body: JSON.stringify({ itemId }),
            })
                .then((response) => response.json())
                .then((data) => console.log("Item added to cart:", data))
                .catch((error) => console.error("Error adding to cart:", error));
        }
    };

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
                .then((data) => console.log("Item removed from cart:", data))
                .catch((error) => console.error("Error removing from cart:", error));
        }
    };

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

    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((total, quantity) => total + (quantity > 0 ? quantity : 0), 0);
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
    };

    return <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
