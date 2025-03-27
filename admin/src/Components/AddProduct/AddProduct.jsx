import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";
import Swal from "sweetalert2";

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "",
    new_price: "",
    old_price: "",
    description: "",
    sizes: {}, // Objeto para almacenar tallas y cantidades
  });

  const [sizeInput, setSizeInput] = useState(""); // Estado para el campo de entrada de tallas
  const [sizeStockInput, setSizeStockInput] = useState(""); // Estado para el campo de entrada de cantidad de stock por talla

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const addSizeHandler = () => {
    const newSizeStock = parseInt(sizeStockInput);

    if (sizeInput && sizeStockInput && !productDetails.sizes[sizeInput]) {
      setProductDetails({
        ...productDetails,
        sizes: { ...productDetails.sizes, [sizeInput]: newSizeStock },
      });
      setSizeInput("");
      setSizeStockInput("");
    }
  };

  const removeSizeHandler = (sizeToRemove) => {
    const updatedSizes = { ...productDetails.sizes };
    delete updatedSizes[sizeToRemove];
    setProductDetails({ ...productDetails, sizes: updatedSizes });
  };

  const updateSizeHandler = (size, newQuantity) => {
    const updatedSizes = { ...productDetails.sizes, [size]: parseInt(newQuantity) || 0 };
    setProductDetails({ ...productDetails, sizes: updatedSizes });
  };

  const calculateStock = () => {
    return Object.values(productDetails.sizes).reduce((acc, curr) => acc + parseInt(curr), 0);
  };

  const Add_Product = async () => {
    console.log("Producto antes de enviar:", productDetails);

    // Verificar que todos los campos obligatorios estén llenos
    if (!productDetails.name || !productDetails.category || !productDetails.new_price) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
      });
      return;
    }

    // Calcular el stock automáticamente
    const calculatedStock = calculateStock();

    const product = {
      ...productDetails,
      stock: calculatedStock, // Agregar el stock calculado
    };

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
        product.image = imageResponse.image_url;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Fallo al subir la imagen",
        });
        return;
      }
    }

    // Luego, intenta agregar el producto a la base de datos
    const productResponse = await fetch("http://localhost:4000/addproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    }).then((resp) => resp.json());

    console.log("Respuesta del servidor al agregar producto:", productResponse);

    if (productResponse.success) {
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Producto e imagen agregados correctamente",
      });
      // Limpiar todos los campos del formulario
      setProductDetails({
        name: "",
        image: "",
        category: "",
        new_price: "",
        old_price: "",
        description: "",
        sizes: {},
      });
      setImage(null);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Fallo al agregar el producto",
      });
    }

    console.log("Producto final:", product);
  };

  return (
    <div className="add-product">
      <h2 className="add-product-title">Añadir Productos</h2>
      <div className="add-product-itemfield">
        <p>Nombre del producto</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Escribe aquí"
        />
      </div>

      <div className="add-product-itemfield">
        <p>Descripción del producto</p>
        <input
          value={productDetails.description}
          onChange={changeHandler}
          type="text"
          name="description"
          placeholder="Escribe aquí"
        />
      </div>

      <div className="addproduct-price">
        <div className="add-product-itemfield">
          <p>Precio</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="number"
            name="old_price"
            placeholder="Ingrese el precio"
          />
        </div>

        <div className="add-product-itemfield">
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

      <div className="add-product-itemfield">
        <p>Categoría del producto</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="" disabled>
            Seleccionar
          </option>
          <option value="women">Mujer</option>
          <option value="men">Hombre</option>
          <option value="kid">Niños</option>
        </select>
      </div>

      <div className="add-product-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            alt="Subir imagen"
            className="add-product-thumbnail-img"
          />
        </label>
        <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
      </div>

      <div className="add-product-itemfield">
        <p>Tallas disponibles</p>
        <div className="sizes-input">
          <select
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            className="size-select"
          >
            <option value="" disabled>
              Seleccionar talla
            </option>
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
              {size} -{" "}
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
      </div>

      <div className="add-product-itemfield">
        <p>Stock total: {calculateStock()}</p> {/* Mostrar el stock calculado */}
      </div>

      <button onClick={Add_Product} className="addproduct-btn">
        AGREGAR
      </button>
    </div>
  );
};

export default AddProduct;