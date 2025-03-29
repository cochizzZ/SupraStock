import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';
import lapicito from '../../assets/lapicito.svg';
import EditProduct from '../EditProduct/EditProduct';
import defaultImage from '../../assets/404.jpg';
import Swal from "sweetalert2";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'unavailable'

  const fetchInfo = async () => {
    await fetch('http://localhost:4000/fullproducts')
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (productId) => {
    const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:4000/removeproduct`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: productId }),
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    title: "¡Eliminado!",
                    text: "El producto ha sido eliminado correctamente.",
                    icon: "success",
                    confirmButtonColor: "#3085d6",
                });

                // Actualizar la lista de productos después de eliminar
                await fetchInfo();
            } else {
                Swal.fire({
                    title: "Error",
                    text: data.message || "No se pudo eliminar el producto.",
                    icon: "error",
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            Swal.fire({
                title: "Error",
                text: "Hubo un problema al eliminar el producto.",
                icon: "error",
                confirmButtonColor: "#d33",
            });
        }
    }
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

  const filteredProducts = allproducts.filter((product) =>
    activeTab === 'available' ? product.available : !product.available
  );

  return (
    <div className='list-product'>
      <h1>Lista de Productos</h1>
      <div className="tabs">
        <button
          className={activeTab === 'available' ? 'active' : ''}
          onClick={() => setActiveTab('available')}
        >
          Productos Disponibles
        </button>
        <button
          className={activeTab === 'unavailable' ? 'active' : ''}
          onClick={() => setActiveTab('unavailable')}
        >
          Productos No Disponibles
        </button>
      </div>
      <div className="listproduct-format-main">
        <p>Productos</p>
        <p>Nombre</p>
        <p>Precio</p>
        <p>Precio oferta</p>
        <p>Categoria</p>
        <p>Stock</p>
        <p>Tallas</p> {/* Nuevo campo agregado */}
        <p>Editar</p>
        <p>Eliminar</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {filteredProducts.map((product, index) => {
          return (
            <React.Fragment key={index}>
              <div className="listproduct-format-main listproduct-format" id={product.id}>
                <img src={product.image} alt="" className="listproduct-product-icon" onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultImage;
                                    }} />
                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <p>{product.stock}</p>
                <p className="listproduct-sizes">
                  {product.sizes && Object.entries(product.sizes).map(([size, quantity]) => (
                    <span key={size}>{size}: {quantity} unidades</span>
                  ))}
                </p> {/* Mostrar las tallas y cantidades */}
                <button className="edit-button" onClick={() => handleEdit(product)}>
                  <img className="edit-image" src={lapicito} alt="Editar" />
                </button>
                <img
                  onClick={() => { remove_product(product.id); }}
                  className='listproduct-remove-icon'
                  src={cross_icon}
                  alt="Eliminar"
                />
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