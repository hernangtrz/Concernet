// Modal.js
import React from "react";
import "../Styles/Modal.css"; // Añadir estilos para el modal

const Modal = ({ mensaje, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{mensaje}</h3>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default Modal;
