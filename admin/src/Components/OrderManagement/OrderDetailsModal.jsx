import React from "react";
import { jsPDF } from "jspdf";
import "./OrderManagement.css";
import ExcelJS from "exceljs"; // Importar exceljs

const OrderDetailsModal = ({
  selectedOrder,
  showFullOrderId,
  showFullUserId,
  toggleOrderIdVisibility,
  toggleUserIdVisibility,
  closeModal,
  translateStatus,
  formatPrice,
}) => {
  if (!selectedOrder) return null;

  const generatePDF = async () => {
    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Detalles de la Orden", 105, 20, { align: "center" });

    // Dibujar una línea debajo del título
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, 25, 200, 25);

    // Información de la venta
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Información de la Venta", 10, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`ID de Orden: ${selectedOrder._id}`, 10, 45);
    doc.text(`Estado: ${translateStatus(selectedOrder.status)}`, 10, 55);
    doc.text(`Fecha: ${new Date(selectedOrder.date).toLocaleString()}`, 10, 65);
    doc.text(`Total: $${formatPrice(selectedOrder.total)}`, 10, 75);

    // Dibujar un rectángulo alrededor de la información de la venta
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(8, 30, 194, 50);

    // Productos
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Productos", 10, 90);

    let y = 100;
    selectedOrder.products.forEach((product, index) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${product.product_id.name}`, 10, y);

      doc.setFont("helvetica", "normal");
      doc.text(`Cantidad: ${product.quantity}`, 10, y + 10);
      doc.text(`Precio: $${formatPrice(product.price)}`, 10, y + 20);

      // Dibujar una línea separadora entre productos
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.line(10, y + 25, 200, y + 25);

      y += 35; // Incrementar la posición vertical
    });

    // Información de contacto
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Información de Contacto", 10, y);

    y += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${selectedOrder.user_id?.name || "N/A"}`, 10, y);
    doc.text(`Correo: ${selectedOrder.user_id?.email || "N/A"}`, 10, y + 10);
    doc.text(`Teléfono: ${selectedOrder.user_id?.phone || "N/A"}`, 10, y + 20);

    // Dibujar un rectángulo alrededor de la información de contacto
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(8, y - 5, 194, 35);

    y += 40;

    // Información de envío
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Información de Envío", 10, y);

    y += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Ciudad: ${selectedOrder.city || "N/A"}`, 10, y);
    doc.text(`Dirección: ${selectedOrder.address || "N/A"}`, 10, y + 10);
    doc.text(`Código Postal: ${selectedOrder.postal_code || "N/A"}`, 10, y + 20);

    // Dibujar un rectángulo alrededor de la información de envío
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(8, y - 5, 194, 35);

    // Guardar el PDF
    const pdfBlob = doc.output("blob");

    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `Orden_${selectedOrder._id}.pdf`,
        types: [
          {
            description: "Archivos PDF",
            accept: { "application/pdf": [".pdf"] },
          },
        ],
      });

      const writableStream = await fileHandle.createWritable();
      await writableStream.write(pdfBlob);
      await writableStream.close();
      console.log("Archivo guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar el archivo:", error);
    }
  };

  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Detalles de la Orden");

    // Estilo para los encabezados
    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4CAF50" } }, // Verde
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // Estilo para las celdas normales
    const cellStyle = {
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // Información de la orden
    worksheet.addRow(["ID de Orden", selectedOrder._id]);
    worksheet.addRow(["Estado", translateStatus(selectedOrder.status)]);
    worksheet.addRow(["Fecha", new Date(selectedOrder.date).toLocaleString()]);
    worksheet.addRow(["Total", `$${formatPrice(selectedOrder.total)}`]);
    worksheet.addRow([]); // Espacio vacío

    // Encabezado de productos
    worksheet.addRow(["Productos"]);
    const productHeader = worksheet.addRow(["#", "Nombre", "Cantidad", "Precio"]);
    productHeader.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Agregar productos
    selectedOrder.products.forEach((product, index) => {
      const row = worksheet.addRow([
        index + 1,
        product.product_id.name,
        product.quantity,
        `$${formatPrice(product.price)}`,
      ]);
      row.eachCell((cell) => {
        cell.style = cellStyle;
      });
    });

    worksheet.addRow([]); // Espacio vacío

    // Información de contacto
    worksheet.addRow(["Información de Contacto"]);
    const contactHeader = worksheet.addRow(["Campo", "Valor"]);
    contactHeader.eachCell((cell) => {
      cell.style = headerStyle;
    });

    const contactData = [
      ["Nombre", selectedOrder.user_id?.name || "N/A"],
      ["Correo", selectedOrder.user_id?.email || "N/A"],
      ["Teléfono", selectedOrder.user_id?.phone || "N/A"],
    ];

    contactData.forEach((contact) => {
      const row = worksheet.addRow(contact);
      row.eachCell((cell) => {
        cell.style = cellStyle;
      });
    });

    worksheet.addRow([]); // Espacio vacío

    // Información de envío
    worksheet.addRow(["Información de Envío"]);
    const shippingHeader = worksheet.addRow(["Campo", "Valor"]);
    shippingHeader.eachCell((cell) => {
      cell.style = headerStyle;
    });

    const shippingData = [
      ["Ciudad", selectedOrder.city || "N/A"],
      ["Dirección", selectedOrder.address || "N/A"],
      ["Código Postal", selectedOrder.postal_code || "N/A"],
    ];

    shippingData.forEach((shipping) => {
      const row = worksheet.addRow(shipping);
      row.eachCell((cell) => {
        cell.style = cellStyle;
      });
    });

    // Ajustar el ancho de las columnas
    worksheet.columns = [
      { width: 10 }, // Columna 1
      { width: 30 }, // Columna 2
      { width: 15 }, // Columna 3
      { width: 20 }, // Columna 4
    ];

    // Convertir el archivo Excel a un buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Usar la File System Access API para guardar el archivo
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `Orden_${selectedOrder._id}.xlsx`,
        types: [
          {
            description: "Archivos Excel",
            accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
          },
        ],
      });

      const writableStream = await fileHandle.createWritable();
      await writableStream.write(buffer);
      await writableStream.close();
      console.log("Archivo Excel guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar el archivo Excel:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>
          &times;
        </span>
        <h2>Detalles de la Orden</h2>
        <div className="order-details">
          <div className="section">
            <h3>Información de la Venta</h3>
            <div className="label">ID de Orden:</div>
            <div className="value">
              {showFullOrderId ? selectedOrder._id : ""}
              <button
                onClick={toggleOrderIdVisibility}
                className="toggle-id-visibility"
              >
                {showFullOrderId ? "Ocultar ID" : "Visualizar ID"}
              </button>
            </div>
            <div className="label">Estado:</div>
            <div className="value status">
              {translateStatus(selectedOrder.status)}
            </div>
            <div className="label">Fecha:</div>
            <div className="value">
              {new Date(selectedOrder.date).toLocaleString()}
            </div>
            <div className="label">Total:</div>
            <div className="value">${formatPrice(selectedOrder.total)}</div>
            <div className="label">Productos:</div>
            <div className="value">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Precio por Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products.map((product) => (
                    <tr key={product.product_id._id}>
                      <td>
                        <img
                          src={product.product_id.image}
                          alt={product.product_id.name}
                          style={{ width: "50px", height: "50px" }}
                        />
                      </td>
                      <td>{product.product_id.name}</td>
                      <td>{product.quantity}</td>
                      <td>${formatPrice(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section">
            <h3>Información de Contacto</h3>
            <div className="label">ID de Usuario:</div>
            <div className="value">
              {showFullUserId ? selectedOrder.user_id._id : ""}
              <button
                onClick={toggleUserIdVisibility}
                className="toggle-id-visibility"
              >
                {showFullUserId ? "Ocultar ID" : "Visualizar ID"}
              </button>
            </div>
            <div className="label">Nombre:</div>
            <div className="value">{selectedOrder.user_id?.name || "N/A"}</div>
            <div className="label">Correo:</div>
            <div className="value">{selectedOrder.user_id?.email || "N/A"}</div>
            <div className="label">Teléfono:</div>
            <div className="value">{selectedOrder.user_id?.phone || "N/A"}</div>
          </div>

          <div className="section">
            <h3>Información de Envío</h3>
            <div className="label">Ciudad:</div>
            <div className="value">{selectedOrder.city || "N/A"}</div>
            <div className="label">Dirección:</div>
            <div className="value">{selectedOrder.address || "N/A"}</div>
            <div className="label">Código Postal:</div>
            <div className="value">{selectedOrder.postal_code || "N/A"}</div>
          </div>
        </div>
        <div className="modal-buttons">
          <button className="generate-pdf" onClick={generatePDF}>
            Generar PDF
          </button>
          <button className="generate-excel" onClick={generateExcel}>
            Generar Excel
          </button>
          <button className="close-modal" onClick={closeModal}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;