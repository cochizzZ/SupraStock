import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "",
    new_price: "",
    old_price: "",
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const Add_Product = async () => {
    console.log("Producto antes de enviar:", productDetails);

    let responseData;
    let product = { ...productDetails }; // Se crea una copia del objeto para evitar mutaciones inesperadas

    if (image) {
      let formData = new FormData();
      formData.append("product", image);

      await fetch("http://localhost:4000/upload", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      })
        .then((resp) => resp.json())
        .then((data) => {
          responseData = data;
        });

      if (responseData?.success) {
        product.image = responseData.image_url; 
        await fetch ('http://localhost:4000/addproduct',{
            method:'POST',
            headers:{
                Accept:'application/json',
                'Content-Type':'application/json',
            },
            body:JSON.stringify(product), 
        }).then((resp)=>resp.json()).then((data)=>{
            data.success?alert("Producto Agregado"):alert("Fallo")
        })
      }
    }

    console.log("Producto final:", product);
  };

  return (
    <div className="add-product">
      <div className="add-product-itemfield">
        <p>Nombre del Producto</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
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
          <p>Precio de Oferta</p>
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
        <p>Categoría del Producto</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
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

      <button onClick={Add_Product} className="addproduct-btn">
        AGREGAR
      </button>
    </div>
  );
};

export default AddProduct;
