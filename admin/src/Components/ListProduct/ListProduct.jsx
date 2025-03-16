import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';
import lapicito from '../../assets/lapicito.svg';
import EditProduct from '../EditProduct/EditProduct';

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchInfo = async () => {
    await fetch('http://localhost:4000/allproducts')
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    await fetch('http://localhost:4000/removeproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id }),
    });
    await fetchInfo();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = (updatedProduct) => {
    setAllProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setEditingProduct(null);
  };

  return (
    <div className='list-product'>
      <h1>Lista de Productos</h1>
      <div className="listproduct-format-main">
        <p>Productos</p>
        <p>Nombre</p>
        <p>Precio</p>
        <p>Precio oferta</p>
        <p>Categoria</p>
        <p>Stock</p>
        <p>Editar</p>
        <p>Eliminar</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => {
          return (
            <React.Fragment key={index}>
              <div className="listproduct-format-main listproduct-format" id={product.id}>
                <img src={product.image} alt="" className="listproduct-product-icon" />
                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <p>{product.stock}</p>
                <button class="edit-button" onClick={() => handleEdit(product)}><img class="edit-image" src={lapicito}></img></button>
                <img onClick={() => { remove_product(product.id) }} className='listproduct-remove-icon' src={cross_icon} alt="" />
              </div>
              <hr />
            </React.Fragment>
          );
        })}
      </div>
      {editingProduct && (
        <EditProduct product={editingProduct} onUpdate={handleUpdate} />
      )}
    </div>
  );
};

export default ListProduct;