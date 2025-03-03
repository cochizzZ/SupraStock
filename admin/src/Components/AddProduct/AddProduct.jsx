import React from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg'

const AddProduct = () => {
  return (
    <div className="add-product">
      <div className="add-product-itemfield">
        <p>Nombre Producto</p>
        <input type="text" name="name" placeholder="Escribe Aquí" />
      </div>

      <div className="add-product-itemfield">
        <p>Precio</p>
        <input type="number" name="old_price" placeholder="Ingrese el precio" />
      </div>
      <div className="add-product-itemfield">
        <p>precio de oferta</p>
        <input type="number" name="new_price" placeholder="Ingrese el precio" />
      </div>
      <div className="addproduct-itemfield">
        <p>Categoria Producto</p>
        <select name="category" className='add-product-selector'>
            <option value="women">Mujer</option>
            <option value="men">Hombre</option>
            <option value="kid">Niños</option>
        </select>
      </div>
      <div className="add-product-itemfield">
        <label htmlFor="file-input">
            <img src={upload_area} className='addproduct-thumnail-img' />
        </label>
        <input type="file" name='image' id='file-input' hidden />
      </div>
      <button className='addproduct-btn'>AGREGAR</button>
    </div>
  );
};

export default AddProduct;
