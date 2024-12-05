import React, { useState, useEffect } from "react";
import NavBar from "../Components/NavBar";
import "../Styles/GestionResidentes.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
const ResidentManagement = () => {
  const [residents, setResidents] = useState([]);
  const [newResident, setNewResident] = useState({
    firstName: "",
    lastName: "",
    id: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [editingResident, setEditingResident] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [idError, setIdError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [idUniqueError, setIdUniqueError] = useState("");
  const [emailUniqueError, setEmailUniqueError] = useState("");
  const [phoneUniqueError, setPhoneUniqueError] = useState("");

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        // Crear una consulta para obtener solo los usuarios con el rol "residente"
        const q = query(
          collection(db, "usuarios"),
          where("role", "==", "resident")
        );
        const querySnapshot = await getDocs(q); // Realizar la consulta

        // Mapear los datos de los residentes
        const residentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Establecer los residentes obtenidos
        setResidents(residentsData);
      } catch (e) {
        console.error("Error obteniendo residentes: ", e);
      }
    };

    fetchResidents();
  }, []);

  // Validar campos no vacíos
  const validateFields = (resident) => {
    let valid = true;
    if (resident.firstName === "") {
      setFirstNameError("El nombre es obligatorio.");
      valid = false;
    } else {
      setFirstNameError("");
    }

    if (resident.lastName === "") {
      setLastNameError("El apellido es obligatorio.");
      valid = false;
    } else {
      setLastNameError("");
    }

    if (resident.id === "") {
      setIdError("La cédula es obligatoria.");
      valid = false;
    } else {
      setIdError("");
    }

    if (resident.email === "") {
      setEmailError("El correo electrónico es obligatorio.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (resident.phone === "") {
      setPhoneError("El teléfono es obligatorio.");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (resident.address === "") {
      setAddressError("La dirección es obligatoria.");
      valid = false;
    } else {
      setAddressError("");
    }

    if (resident.password === "") {
      setPasswordError("La contraseña es obligatoria.");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  // Validar que la cédula sea única
  const validateUniqueID = (id) => {
    if (residents.some((resident) => resident.id === id)) {
      setIdUniqueError("La cédula ingresada ya está registrada.");
      return false;
    }
    setIdUniqueError("");
    return true;
  };

  // Validar que el correo electrónico sea único
  const validateUniqueEmail = (email) => {
    if (residents.some((resident) => resident.email === email)) {
      setEmailUniqueError("El correo electrónico ya está registrado.");
      return false;
    }
    setEmailUniqueError("");
    return true;
  };

  // Validar que el teléfono sea único
  const validateUniquePhone = (phone) => {
    if (residents.some((resident) => resident.phone === phone)) {
      setPhoneUniqueError("El teléfono ya está registrado.");
      return false;
    }
    setPhoneUniqueError("");
    return true;
  };

  // Función para manejar la creación de un nuevo residente
  const handleAddResident = async () => {
    if (!validateFields(newResident)) {
      return;
    }

    if (!validateUniqueID(newResident.id)) {
      return;
    }

    if (!validateUniqueEmail(newResident.email)) {
      return;
    }

    if (!validateUniquePhone(newResident.phone)) {
      return;
    }

    try {
      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, // Firebase Auth
        newResident.email,
        newResident.password
      );

      // Obtener el usuario creado
      const user = userCredential.user;
      console.log("Usuario creado con ID: ", user.uid);

      // Crear el documento en la colección "usuarios" usando el UID de Firebase como ID de Firestore
      const userDocRef = doc(db, "usuarios", user.uid); // Usamos el UID de Firebase como ID de Firestore
      await setDoc(userDocRef, {
        ...newResident,
        uid: user.uid, // Guardamos el UID del usuario de Firebase
        role: "resident", // Asignamos el rol de residente
      });

      console.log("Usuario agregado con ID: ", user.uid);

      // Agregar el nuevo usuario al estado sin necesidad de recargar la página
      setResidents((prevResidents) => [
        ...prevResidents,
        { id: user.uid, ...newResident }, // Usamos el UID de Firebase como el ID
      ]);

      // Cerrar el modal y limpiar los campos
      setShowModal(false);
      setNewResident({
        firstName: "",
        lastName: "",
        id: "",
        email: "",
        phone: "",
        address: "",
        password: "",
      });
    } catch (e) {
      console.error("Error añadiendo usuario o creando usuario: ", e);
    }
  };

  // Función para manejar la edición de un residente

  const handleEditResident = (user) => {
    setEditingResident(user); // Cambié el nombre a editingUser
    setShowEditModal(true);
  };

  const handleUpdateResident = async () => {
    try {
      // Buscar el usuario por su cédula en lugar de id
      const usersRef = collection(db, "usuarios");
      const q = query(usersRef, where("id", "==", editingResident.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Obtener el primer documento de la consulta
        const docSnap = querySnapshot.docs[0];
        const userRef = doc(db, "usuarios", docSnap.id);

        // Actualizar el documento con los nuevos datos
        await updateDoc(userRef, { ...editingResident });

        // Cerrar el modal de edición
        setShowEditModal(false);
        console.log("Usuario actualizado!");

        // Actualizar la lista de usuarios en el estado
        setResidents((prevResidents) =>
          prevResidents.map((user) =>
            user.id === editingResident.id ? editingResident : user
          )
        );
      } else {
        console.log("No se encontró el usuario con la cédula proporcionada.");
      }
    } catch (e) {
      console.error("Error actualizando usuario: ", e);
    }
  };

  // Función para eliminar residente de Firebase usando su cédula y actualizar el DOM
  const handleDeleteResident = async (cedula) => {
    try {
      // Referencia a la colección de usuarios
      const usersRef = collection(db, "usuarios");

      // Crear una consulta para buscar el documento por cédula
      const q = query(usersRef, where("id", "==", cedula));

      // Obtener los documentos que coincidan con la cédula
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Si el documento existe, obtener el primero (solo debería ser uno, ya que la cédula es única)
        const docSnap = querySnapshot.docs[0];

        // Obtener la referencia al documento
        const userRef = doc(db, "usuarios", docSnap.id);

        // Eliminar el documento de Firestore
        await deleteDoc(userRef);

        // Actualizar el estado de usuarios en el DOM, eliminando el usuario
        setResidents((prevResidents) =>
          prevResidents.filter((user) => user.id !== cedula)
        );

        console.log("Usuario eliminado!");
      } else {
        console.log("No se encontró el usuario con la cédula proporcionada.");
      }
    } catch (e) {
      console.error("Error eliminando usuario de Firebase: ", e);
    }
  };

  return (
    <div>
      <NavBar />
      <br />
      <br />
      <br />
      <br />
      <div className="container-gestion">
        <div className="titulo">
          <h1>Gestión de Residentes</h1>
        </div>

        <div className="header">
          <h2>Lista de Residentes</h2>

          <button
            data-testid="open-add-modal"
            className="add-btn"
            onClick={() => setShowModal(true)}
          >
            Agregar Residente
          </button>
        </div>

        <table className="resident-table" aria-label="Lista de Residentes">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Cédula</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Contraseña</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((resident, index) => (
              <tr key={index}>
                <td>{resident.firstName}</td>
                <td>{resident.lastName}</td>
                <td>{resident.id}</td>
                <td>{resident.email}</td>
                <td>{resident.phone}</td>
                <td>{resident.address}</td>
                <td>{resident.password}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditResident(resident)}
                  >
                    Editar
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteResident(resident.id)} // Cambié 'index' por 'resident.id'
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal para añadir residentes */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Agregar Residente</h3>
              <input
                type="text"
                placeholder="Nombre"
                value={newResident.firstName}
                onChange={(e) =>
                  setNewResident({ ...newResident, firstName: e.target.value })
                }
              />
              {firstNameError && (
                <div className="error-message">{firstNameError}</div>
              )}

              <input
                type="text"
                placeholder="Apellido"
                value={newResident.lastName}
                onChange={(e) =>
                  setNewResident({ ...newResident, lastName: e.target.value })
                }
              />
              {lastNameError && (
                <div className="error-message">{lastNameError}</div>
              )}

              <input
                type="text"
                placeholder="Cédula"
                value={newResident.id}
                onChange={(e) =>
                  setNewResident({ ...newResident, id: e.target.value })
                }
              />
              {idError && <div className="error-message">{idError}</div>}
              {idUniqueError && (
                <div className="error-message">{idUniqueError}</div>
              )}

              <input
                type="email"
                placeholder="Correo Electrónico"
                value={newResident.email}
                onChange={(e) =>
                  setNewResident({ ...newResident, email: e.target.value })
                }
              />
              {emailError && <div className="error-message">{emailError}</div>}
              {emailUniqueError && (
                <div className="error-message">{emailUniqueError}</div>
              )}

              <input
                type="tel"
                placeholder="Teléfono"
                value={newResident.phone}
                onChange={(e) =>
                  setNewResident({ ...newResident, phone: e.target.value })
                }
              />
              {phoneError && <div className="error-message">{phoneError}</div>}
              {phoneUniqueError && (
                <div className="error-message">{phoneUniqueError}</div>
              )}

              <input
                type="text"
                placeholder="Dirección"
                value={newResident.address}
                onChange={(e) =>
                  setNewResident({ ...newResident, address: e.target.value })
                }
              />
              {addressError && (
                <div className="error-message">{addressError}</div>
              )}

              <input
                type="password"
                placeholder="Contraseña"
                value={newResident.password}
                onChange={(e) =>
                  setNewResident({ ...newResident, password: e.target.value })
                }
              />
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}

              <button
                data-testid="confirm-add-resident"
                onClick={handleAddResident}
              >
                Agregar
              </button>
              <button onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        )}

        {/* Modal para editar residentes */}
        {showEditModal && editingResident && (
          <div className="modal">
            <div className="modal-content">
              <h3>Editar Residente</h3>
              <input
                type="text"
                value={editingResident.firstName}
                placeholder="Nombre"
                onChange={(e) =>
                  setEditingResident({
                    ...editingResident,
                    firstName: e.target.value,
                  })
                }
              />

              <input
                type="text"
                value={editingResident.lastName}
                placeholder="Apellido"
                onChange={(e) =>
                  setEditingResident({
                    ...editingResident,
                    lastName: e.target.value,
                  })
                }
              />

              <input
                type="text"
                value={editingResident.id}
                placeholder="Cedula"
                onChange={(e) =>
                  setEditingResident({ ...editingResident, id: e.target.value })
                }
              />

              <input
                type="email"
                value={editingResident.email}
                placeholder="Email"
                onChange={(e) =>
                  setEditingResident({
                    ...editingResident,
                    email: e.target.value,
                  })
                }
              />

              <input
                type="tel"
                value={editingResident.phone}
                placeholder="Telefono"
                onChange={(e) =>
                  setEditingResident({
                    ...editingResident,
                    phone: e.target.value,
                  })
                }
              />

              <input
                type="text"
                value={editingResident.address}
                placeholder="Direccion"
                onChange={(e) =>
                  setEditingResident({
                    ...editingResident,
                    address: e.target.value,
                  })
                }
              />

              <input
                type="password"
                value={editingResident.password}
                placeholder="Contraseña"
                onChange={(e) =>
                  setEditingResident({
                    ...editingResident,
                    password: e.target.value,
                  })
                }
              />

              <button
                data-testid="actualizar-btn"
                onClick={handleUpdateResident}
              >
                Actualizar
              </button>
              <button onClick={() => setShowEditModal(false)}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentManagement;
