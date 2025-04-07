import React, { useState, useEffect } from "react";
import "./EditProduct.css";
import Swal from "sweetalert2";
import defaultImage from '../../assets/404.jpg';

const EditProduct = ({ product, onUpdate, onCancel }) => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    id: product.id,
    name: product.name,
    description: product.description,
    new_price: product.new_price,
    old_price: product.old_price,
    category: product.category,
    image: product.image,
    stock: product.stock,
    sizes: product.sizes || {},
  });

  const [sizeInput, setSizeInput] = useState("");
  const [sizeStockInput, setSizeStockInput] = useState("");

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const calculateStock = (sizes) => {
    return Object.values(sizes).reduce((acc, curr) => acc + parseInt(curr || 0), 0);
  };

  useEffect(() => {
    const updatedStock = calculateStock(productDetails.sizes);
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      stock: updatedStock,
    }));
  }, [productDetails.sizes]);

  const addSizeHandler = () => {
    const newSizeStock = parseInt(sizeStockInput);

    if (sizeInput && sizeStockInput && !productDetails.sizes[sizeInput]) {
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        sizes: { ...prevDetails.sizes, [sizeInput]: newSizeStock },
      }));
      setSizeInput("");
      setSizeStockInput("");
    }
  };

  const removeSizeHandler = (sizeToRemove) => {
    const updatedSizes = { ...productDetails.sizes };
    delete updatedSizes[sizeToRemove];
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      sizes: updatedSizes,
    }));
  };

  const updateSizeHandler = (size, newQuantity) => {
    const updatedSizes = { ...productDetails.sizes, [size]: parseInt(newQuantity) || 0 };
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      sizes: updatedSizes,
    }));
  };

  const updateProduct = async () => {
    if (!productDetails.name || !productDetails.category || !productDetails.new_price) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, complete todos los campos obligatorios.',
      });
      return;
    }

    let updatedProduct = { ...productDetails };

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

      if (imageResponse?.success) {
        updatedProduct.image = imageResponse.image_url;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Fallo al subir la imagen',
        });
        return;
      }
    }

    const productResponse = await fetch('http://localhost:4000/updateproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProduct),
    }).then((resp) => resp.json());

    if (productResponse.success) {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Producto actualizado correctamente',
      });
      onUpdate(productResponse.product);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Fallo al actualizar el producto',
      });
    }
  };

  return (
    <div className="edit-product">
      <h2 className="edit-product-title">Editar Producto</h2>
  
      <div className="section-title">Información del Producto</div>
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
  
      <div className="section-title">Precios</div>
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
  
      <div className="section-title">Stock y Categoría</div>
      <div className="edit-product-itemfield">
        <p>Cantidad en stock</p>
        <input
          value={productDetails.stock}
          readOnly
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
  
      <div className="section-title">Imagen del Producto</div>
      <div className="edit-product-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : productDetails.image}
            alt="Subir imagen"
            className="edit-product-thumbnail-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
        </label>
        <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
      </div>
  
      <div className="section-title">Tallas Disponibles</div>
      <div className="sizes-input">
        <select
          value={sizeInput}
          onChange={(e) => setSizeInput(e.target.value)}
          className="size-select"
        >
          <option value="" disabled>Seleccionar talla</option>
          <option value="Unica">Unica</option>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
        </select>
        <input
          value={sizeStockInput}
          onChange={(e) => setSizeStockInput(e.target.value)}
          type="number"
          placeholder="Cantidad"
        />
        <button onClick={addSizeHandler}>Agregar</button>
      </div>
      <div className="sizes-list">
        {Object.keys(productDetails.sizes).map((size, index) => (
          <div key={index} className="size-item">
            {size} - 
            <input
              type="number"
              value={productDetails.sizes[size]}
              onChange={(e) => updateSizeHandler(size, e.target.value)}
              className="size-quantity-input"
            />
            unidades
            <button onClick={() => removeSizeHandler(size)}>Eliminar</button>
          </div>
        ))}
      </div>
  
      <div className="edit-product-buttons">
        <button onClick={updateProduct} className="editproduct-btn">
          ACTUALIZAR
        </button>
        <button onClick={onCancel} className="cancel-btn">
          CANCELAR
        </button>
      </div>
    </div>
  );
};

export default EditProduct;