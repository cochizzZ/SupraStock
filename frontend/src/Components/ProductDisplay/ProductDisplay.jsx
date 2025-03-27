import React, { useState, useContext } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import Swal from "sweetalert2";

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  const categoryMap = {
    men: "Hombre",
    women: "Mujer",
    kid: "Niños",
  };

  const tagsMap = {
    men: ["Deportivo", "Casual"],
    women: ["Elegante", "Moderno"],
    kid: ["Divertido", "Colorido"],
  };

  const categoryDisplay = categoryMap[product.category] || product.category;
  const tagsDisplay = tagsMap[product.category] || [];

  const handleAddToCart = () => {
    if (!selectedSize) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, seleccione una talla.",
      });
      return;
    }

    addToCart(product.id, selectedSize, quantity);
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img">
          <img
            className="productdisplay-main-img"
            src={product.image}
            alt={product.name}
          />
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_dull_icon} alt="star dull" />
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">
            ${product.old_price}
          </div>
          <div className="productdisplay-right-price-new">
            ${product.new_price}
          </div>
        </div>
        <div className="productdisplay-right-description">
          <div>{product.description}</div>
        </div>
        <div className="productdisplay-right-size">
          <h1>Seleccionar talla:</h1>
          <div className="productdisplay-right-sizes">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="" disabled>
                Seleccionar talla
              </option>
              {Object.entries(product.sizes).map(([size, quantity]) => (
                <option key={size} value={size}>
                  {size} ({quantity} disponibles)
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="product-quantity">
          <p>Cantidad:</p>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
        </div>
        <button onClick={handleAddToCart}>Agregar al carrito</button>
        <p className="productdisplay-right-category">
          <span>Categoria: </span>
          {categoryDisplay}
        </p>
        <p className="productdisplay-right-category">
          <span>Tags: </span>
          {tagsDisplay.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;