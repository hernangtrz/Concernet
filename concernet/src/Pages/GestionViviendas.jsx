import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig"; // Asegúrate de tener configurado Firebase
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import NavBar from "../Components/NavBar";
import "../Styles/GestionViviendas.css"; // Importar los estilos

const GestionViviendas = () => {
  const [viviendas, setViviendas] = useState([]);

  const [newVivienda, setNewVivienda] = useState({
    id: "",
    direccion: "",
    precio: "",
    habitaciones: "",
    enVenta: true,
    imagen: "",
    descripcion: "",
  });
  const [editingVivienda, setEditingVivienda] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [errors, setErrors] = useState({
    direccion: "",
    precio: "",
    habitaciones: "",
    imagen: "",
    descripcion: "",
  });

  useEffect(() => {
    const fetchViviendas = async () => {
      const querySnapshot = await getDocs(collection(db, "viviendas"));
      const viviendasList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setViviendas(viviendasList);
    };

    fetchViviendas();
  }, []);

  // Función para manejar la carga de archivos
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVivienda({ ...newVivienda, imagen: reader.result });
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, imagen: "" })); // Limpia el error si es válido
    } else {
      setErrors((prev) => ({
        ...prev,
        imagen: "Solo se permiten archivos JPG y PNG.",
      }));
    }
  };

  const validateDireccion = () => {
    const direccion = newVivienda.direccion.trim();
    if (direccion.length <= 5 || direccion.length > 20) {
      setErrors((prev) => ({
        ...prev,
        direccion: "La dirección debe tener entre 6 y 20 caracteres.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, direccion: "" }));
    return true;
  };

  const validatePrecio = () => {
    const precioNum = parseFloat(newVivienda.precio);
    if (
      isNaN(precioNum) ||
      precioNum <= 0 ||
      precioNum.toString().length > 10
    ) {
      setErrors((prev) => ({
        ...prev,
        precio: "El precio debe ser un número mayor a 0 y máximo 10 dígitos.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, precio: "" }));
    return true;
  };

  const validateHabitaciones = () => {
    const habitacionesNum = parseInt(newVivienda.habitaciones);
    if (isNaN(habitacionesNum) || habitacionesNum <= 0 || habitacionesNum > 5) {
      setErrors((prev) => ({
        ...prev,
        habitaciones: "El número de habitaciones debe ser entre 1 y 5.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, habitaciones: "" }));
    return true;
  };

  const validateImagen = () => {
    const imagen = newVivienda.imagen;

    const imagenSize = new Blob([imagen]).size / (1024 * 1024); // Tamaño en MB

    if (imagenSize > 5) {
      setErrors((prev) => ({
        ...prev,
        imagen: "El tamaño de la imagen no debe exceder 5 MB.",
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, imagen: "" }));
    return true;
  };

  const validateDescripcion = () => {
    const descripcion = newVivienda.descripcion.trim();
    if (descripcion.length <= 10 || descripcion.length > 200) {
      setErrors((prev) => ({
        ...prev,
        descripcion: "La descripción debe tener entre 11 y 200 caracteres.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, descripcion: "" }));
    return true;
  };

  const handleAddVivienda = async () => {
    const isDireccionValid = validateDireccion();
    const isPrecioValid = validatePrecio();
    const isHabitacionesValid = validateHabitaciones();
    const isImagenValid = validateImagen();
    const isDescripcionValid = validateDescripcion();

    if (
      isDireccionValid &&
      isPrecioValid &&
      isHabitacionesValid &&
      isImagenValid &&
      isDescripcionValid
    ) {
      try {
        const docRef = await addDoc(collection(db, "viviendas"), {
          ...newVivienda,
        });
        setViviendas([...viviendas, { ...newVivienda, id: docRef.id }]);
        setNewVivienda({
          direccion: "",
          precio: "",
          habitaciones: "",
          enVenta: true,
          imagen: "",
          descripcion: "",
        });
        setShowModal(false);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      console.log("Error en los datos del formulario.");
    }
  };

  const handleEditVivienda = (vivienda) => {
    setEditingVivienda(vivienda);
    setShowEditModal(true);
  };

  const handleUpdateVivienda = async () => {
    try {
      const viviendaRef = doc(db, "viviendas", editingVivienda.id);
      await updateDoc(viviendaRef, {
        direccion: editingVivienda.direccion,
        precio: editingVivienda.precio,
        habitaciones: editingVivienda.habitaciones,
        enVenta: editingVivienda.enVenta,
        descripcion: editingVivienda.descripcion,
        imagen: editingVivienda.imagen, // Si se ha modificado la imagen, agregarla aquí
      });
      console.log("Vivienda actualizada");

      // Actualizar la vivienda en el estado
      const updatedViviendas = viviendas.map((vivienda) =>
        vivienda.id === editingVivienda.id ? editingVivienda : vivienda
      );
      setViviendas(updatedViviendas);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error al actualizar la vivienda: ", error);
    }
  };

  const handleDeleteVivienda = async (id) => {
    try {
      const viviendaRef = doc(db, "viviendas", id);
      await deleteDoc(viviendaRef);
      console.log("Vivienda eliminada");

      // Eliminar la vivienda del estado
      const updatedViviendas = viviendas.filter(
        (vivienda) => vivienda.id !== id
      );
      setViviendas(updatedViviendas);
    } catch (error) {
      console.error("Error al eliminar la vivienda: ", error);
    }
  };

  return (
    <div>
      <NavBar />
      <br />
      <br />
      <br />
      <br />
      <div className="container-gestion-viviendas">
        <div className="titulo">
          <h1>Gestión de Viviendas</h1>
        </div>
        <div className="header-viviendas">
          <h2>Lista de Viviendas</h2>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            Agregar Vivienda
          </button>
        </div>

        <table className="vivienda-table">
          <thead>
            <tr>
              <th>Dirección</th>
              <th>Precio</th>
              <th>Habitaciones</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {viviendas.map((vivienda) => (
              <tr key={vivienda.id}>
                <td>{vivienda.direccion}</td>
                <td>{vivienda.precio}</td>
                <td>{vivienda.habitaciones}</td>
                <td>{vivienda.enVenta ? "En Venta" : "En Arriendo"}</td>
                <td>{vivienda.descripcion}</td>
                <td>
                  <img
                    src={vivienda.imagen}
                    alt={vivienda.direccion}
                    style={{ width: "100px", height: "auto" }}
                  />
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditVivienda(vivienda)}
                  >
                    Editar
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteVivienda(vivienda.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal para agregar vivienda */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Agregar Vivienda</h3>

              <label htmlFor="direccion">Dirección</label>
              <input
                id="direccion"
                type="text"
                placeholder="Dirección"
                value={newVivienda.direccion}
                onChange={(e) =>
                  setNewVivienda({ ...newVivienda, direccion: e.target.value })
                }
                onBlur={validateDireccion} // Validar al salir del campo
              />
              {errors.direccion && (
                <p className="error-text">{errors.direccion}</p>
              )}

              <label htmlFor="precio">Precio</label>
              <input
                id="precio"
                type="text"
                placeholder="Precio"
                value={newVivienda.precio}
                onChange={(e) =>
                  setNewVivienda({ ...newVivienda, precio: e.target.value })
                }
                onBlur={validatePrecio} // Validar al salir del campo
              />
              {errors.precio && <p className="error-text">{errors.precio}</p>}

              <label htmlFor="habitaciones">Habitaciones</label>
              <input
                id="habitaciones"
                type="number"
                placeholder="Habitaciones"
                value={newVivienda.habitaciones}
                onChange={(e) =>
                  setNewVivienda({
                    ...newVivienda,
                    habitaciones: e.target.value,
                  })
                }
                onBlur={validateHabitaciones} // Validar al salir del campo
              />
              {errors.habitaciones && (
                <p className="error-text">{errors.habitaciones}</p>
              )}

              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                value={newVivienda.enVenta}
                onChange={(e) =>
                  setNewVivienda({
                    ...newVivienda,
                    enVenta: e.target.value === "true",
                  })
                }
              >
                <option value={true}>En Venta</option>
                <option value={false}>En Arriendo</option>
              </select>

              <label htmlFor="imagen">Imagen</label>
              <input
                id="imagen"
                type="file"
                accept=".jpg, .png"
                onChange={handleFileChange}
              />
              {errors.imagen && <p className="error-text">{errors.imagen}</p>}
              {newVivienda.imagen && (
                <img
                  src={newVivienda.imagen}
                  alt="Vista previa"
                  style={{ width: "100px", height: "auto", marginTop: "10px" }}
                />
              )}
              <br />

              <label htmlFor="descripcion">Descripción</label>
              <input
                id="descripcion"
                type="text"
                placeholder="Descripción"
                value={newVivienda.descripcion}
                onChange={(e) =>
                  setNewVivienda({
                    ...newVivienda,
                    descripcion: e.target.value,
                  })
                }
                onBlur={validateDescripcion} // Validar al salir del campo
              />
              {errors.descripcion && (
                <p className="error-text">{errors.descripcion}</p>
              )}

              <button
                data-testid="add-vivienda-button"
                onClick={handleAddVivienda}
              >
                Agregar
              </button>
              <button onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        )}

        {/* Modal para editar vivienda */}
        {showEditModal && editingVivienda && (
          <div className="modal">
            <div className="modal-content">
              <h3>Editar Vivienda</h3>

              <label htmlFor="direccion">Dirección</label>
              <input
                id="direccion"
                type="text"
                placeholder="Dirección"
                value={editingVivienda.direccion}
                onChange={(e) =>
                  setEditingVivienda({
                    ...editingVivienda,
                    direccion: e.target.value,
                  })
                }
              />

              <label htmlFor="precio">Precio</label>
              <input
                id="precio"
                type="text"
                placeholder="Precio"
                value={editingVivienda.precio}
                onChange={(e) =>
                  setEditingVivienda({
                    ...editingVivienda,
                    precio: e.target.value,
                  })
                }
              />

              <label htmlFor="habitaciones">Habitaciones</label>
              <input
                id="habitaciones"
                type="number"
                placeholder="Habitaciones"
                value={editingVivienda.habitaciones}
                onChange={(e) =>
                  setEditingVivienda({
                    ...editingVivienda,
                    habitaciones: e.target.value,
                  })
                }
              />

              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                value={editingVivienda.enVenta}
                onChange={(e) =>
                  setEditingVivienda({
                    ...editingVivienda,
                    enVenta: e.target.value === "true",
                  })
                }
              >
                <option value={true}>En Venta</option>
                <option value={false}>En Arriendo</option>
              </select>

              <label htmlFor="imagen">Imagen</label>
              <input
                id="imagen"
                type="file"
                accept=".jpg, .png"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (
                    file &&
                    (file.type === "image/jpeg" || file.type === "image/png")
                  ) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setEditingVivienda({
                        ...editingVivienda,
                        imagen: reader.result,
                      });
                    };
                    reader.readAsDataURL(file);
                  } else {
                    alert("Solo se permiten archivos .jpg y .png");
                  }
                }}
              />
              {editingVivienda.imagen && (
                <img
                  src={editingVivienda.imagen}
                  alt="Vista previa"
                  style={{ width: "100px", height: "auto", marginTop: "10px" }}
                />
              )}
              <br />
              <label htmlFor="descripcion">Descripción</label>
              <input
                id="descripcion"
                type="text"
                placeholder="Descripción"
                value={editingVivienda.descripcion}
                onChange={(e) =>
                  setEditingVivienda({
                    ...editingVivienda,
                    descripcion: e.target.value,
                  })
                }
              />

              <button onClick={handleUpdateVivienda}>Actualizar</button>
              <button onClick={() => setShowEditModal(false)}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionViviendas;
