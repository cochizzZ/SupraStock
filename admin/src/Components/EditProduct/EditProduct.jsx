import React, { useState } from "react";
import "./EditProduct.css";
import upload_area from "../../assets/upload_area.svg";

const EditProduct = ({ product, onUpdate }) => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    id: product.id,
    name: product.name,
    description: product.description,
    new_price: product.new_price,
    old_price: product.old_price,
    category: product.category,
    image: product.image,
    stock: product.stock, // Añadir el campo de stock
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const updateProduct = async () => {
    console.log("Producto antes de enviar:", productDetails);

    // Verificar que todos los campos obligatorios estén llenos
    if (!productDetails.name || !productDetails.category || !productDetails.new_price) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    let updatedProduct = { ...productDetails }; // Se crea una copia del objeto para evitar mutaciones inesperadas

    // Si hay una imagen, súbela primero
    if (image) {
      let formData = new FormData();
      formData.append("product", image);

      const imageResponse = await fetch("http://localhost:4000/upload", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      }).then((resp) => resp.json());

      console.log("Respuesta del servidor al subir imagen:", imageResponse);

      if (imageResponse?.success) {
        updatedProduct.image = imageResponse.image_url;
      } else {
        alert("Fallo al subir la imagen");
        return;
      }
    }

    // Luego, intenta actualizar el producto en la base de datos
    const productResponse = await fetch('http://localhost:4000/updateproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProduct),
    }).then((resp) => resp.json());

    console.log("Respuesta del servidor al actualizar producto:", productResponse);

    if (productResponse.success) {
      alert("Producto actualizado correctamente");
      onUpdate(productResponse.product);
    } else {
      alert("Fallo al actualizar el producto");
    }
  };

  return (
    <div className="edit-product">
      <h2 className="edit-product-title">Editar Producto</h2>
      <div className="edit-product-itemfield">
        <p>Nombre del producto</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Escribe aquí"
        />
      </div>

      <div className="edit-product-itemfield">
        <p>Descripción del producto</p>
        <input
          value={productDetails.description}
          onChange={changeHandler}
          type="text"
          name="description"
          placeholder="Escribe aquí"
        />
      </div>

      <div className="editproduct-price">
        <div className="edit-product-itemfield">
          <p>Precio</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="number"
            name="old_price"
            placeholder="Ingrese el precio"
          />
        </div>

        <div className="edit-product-itemfield">
          <p>Precio de oferta</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="number"
            name="new_price"
            placeholder="Ingrese el precio"
          />
        </div>
      </div>

      <div className="edit-product-itemfield">
        <p>Cantidad en stock</p> {/* Nuevo campo agregado */}
        <input
          value={productDetails.stock}
          onChange={changeHandler}
          type="number"
          name="stock"
          placeholder="Ingrese la cantidad en stock"
        />
      </div>

      <div className="edit-product-itemfield">
        <p>Categoría del producto</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="edit-product-selector"
        >
          <option value="" disabled>
            Seleccionar
          </option>
          <option value="women">Mujer</option>
          <option value="men">Hombre</option>
          <option value="kid">Niños</option>
        </select>
      </div>

      <div className="edit-product-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : productDetails.image}
            alt="Subir imagen"
            className="edit-product-thumbnail-img"
          />
        </label>
        <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
      </div>

      <button onClick={updateProduct} className="editproduct-btn">
        ACTUALIZAR
      </button>
    </div>
  );
};

export default EditProduct;