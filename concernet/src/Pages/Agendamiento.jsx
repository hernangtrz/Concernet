import React, { useState } from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import "../Styles/Agendamiento.css";
import espacios from "../EspaciosData"; // Datos de los espacios

const Agendamiento = () => {
  const { id } = useParams(); // ID del espacio
  const espacio = espacios.find((espacio) => espacio.id === parseInt(id)); // Obtener datos del espacio
  const [idusuario, setIdUsuario] = useState(""); // Cédula del usuario
  const [fechaagendamiento, setFechaAgendamiento] = useState(""); // Fecha de reserva
  const [horaInicio, setHoraInicio] = useState(""); // Hora de inicio
  const [horaFin, setHoraFin] = useState(""); // Hora de fin
  const [mensajeError, setMensajeError] = useState(""); // Mensajes de error
  const [mensajeExito, setMensajeExito] = useState(""); // Mensaje de éxito
  const [errores, setErrores] = useState({
    cedula: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
  });

  // Verificar si el usuario existe en la colección `usuarios`
  const verificarUsuario = async (idusuario) => {
    try {
      const usuariosRef = collection(db, "usuarios");
      const q = query(usuariosRef, where("id", "==", idusuario));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Si encontramos un usuario
        return querySnapshot.docs[0].data();
      } else {
        return null; // Usuario no encontrado
      }
    } catch (error) {
      console.error("Error al verificar usuario: ", error);
      return null;
    }
  };

  // Verificar si el espacio ya está reservado en el rango de fecha y hora
  const verificarDisponibilidad = async () => {
    const q = query(
      collection(db, "agendamientos"),
      where("idespacio", "==", id),
      where("fechaagendamiento", "==", fechaagendamiento),
      where("horaInicio", "<", horaFin),
      where("horaFin", ">", horaInicio)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Devuelve true si ya hay un cruce
  };

  const agendarEspacio = async (e) => {
    e.preventDefault();
    setErrores({
      cedula: "",
      fecha: "",
      horaInicio: "",
      horaFin: "",
    }); // Limpiar mensajes de error al hacer clic en "Agendar"

    const regexCedula = /^[1-9][0-9]{0,9}$/;
    if (!regexCedula.test(idusuario)) {
      setErrores((prev) => ({
        ...prev,
        cedula:
          "La cédula debe ser un número entero mayor a 0 y máximo 10 dígitos.",
      }));
      return;
    }

    // Validación de la fecha (debe ser en formato AAAA-MM-DD)
    const fechaActual = new Date().toISOString().split("T")[0];
    if (fechaagendamiento < fechaActual) {
      setErrores((prev) => ({
        ...prev,
        fecha: "No puedes agendar en una fecha que ya pasó.",
      }));
      return;
    }

    // Validación del rango de horas
    if (horaInicio >= horaFin) {
      setErrores((prev) => ({
        ...prev,
        horaFin: "La hora de inicio debe ser anterior a la hora de fin.",
      }));
      return;
    }

    try {
      // Verificar si el usuario existe
      const usuarioExiste = await verificarUsuario(idusuario);
      if (!usuarioExiste) {
        setErrores((prev) => ({
          ...prev,
          cedula: "El usuario no está registrado.",
        }));
        return;
      }

      // Verificar disponibilidad del espacio
      const espacioOcupado = await verificarDisponibilidad();
      if (espacioOcupado) {
        setErrores((prev) => ({
          ...prev,
          horaFin: "El espacio ya está reservado en ese horario.",
        }));
        return;
      }

      // Crear el agendamiento en Firestore
      const agendamiento = {
        idespacio: id,
        idusuario,
        fechaagendamiento,
        horaInicio,
        horaFin,
      };

      await addDoc(collection(db, "agendamientos"), agendamiento);

      // Mostrar mensaje de éxito, limpiar el formulario y mostrar alert
      setMensajeExito("¡Agendamiento creado con éxito!");
      setMensajeError("");
      setIdUsuario("");
      setFechaAgendamiento("");
      setHoraInicio("");
      setHoraFin("");
      alert("Agendamiento creado con éxito");
    } catch (error) {
      console.error("Error al crear el agendamiento: ", error);
      setMensajeError("Ocurrió un error al intentar crear el agendamiento.");
    }
  };

  // Validar que el espacio exista
  if (!espacio) {
    return <div>El espacio no existe.</div>;
  }

  return (
    <div className="agendamiento">
      <NavBar />
      <div className="contenedorAgendamiento">
        <div className="agendaImagen">
          <h2 className="nombreEspacio">{espacio.nombre}</h2>
          <img
            src={espacio.imagen}
            alt={`Imagen del espacio ${espacio.nombre}`}
          />
        </div>

        <form className="calendario" onSubmit={agendarEspacio}>
          <div className="campos">
            <label htmlFor="cedula">Cédula</label>
            <input
              type="number"
              id="cedula"
              name="cedula"
              value={idusuario}
              onChange={(e) => setIdUsuario(e.target.value)}
              required
            />
            {errores.cedula && <div className="error">{errores.cedula}</div>}

            <label htmlFor="fecha">Fecha</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={fechaagendamiento}
              onChange={(e) => setFechaAgendamiento(e.target.value)}
              required
            />
            {errores.fecha && <div className="error">{errores.fecha}</div>}

            <label htmlFor="horaInicio">Hora Inicio</label>
            <input
              type="time"
              id="horaInicio"
              name="horaInicio"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              required
            />
            {errores.horaInicio && (
              <div className="error">{errores.horaInicio}</div>
            )}

            <label htmlFor="horaFin">Hora Fin</label>
            <input
              type="time"
              id="horaFin"
              name="horaFin"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              required
            />
            {errores.horaFin && <div className="error">{errores.horaFin}</div>}
          </div>
          <div className="desicion">
            <button className="agendar" type="submit">
              Agendar
            </button>
            <Link className="cancelar" to="/Espacios">
              Cancelar
            </Link>
          </div>

          {mensajeExito && <div className="mensajeExito">{mensajeExito}</div>}
          {mensajeError && <div className="mensajeError">{mensajeError}</div>}
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Agendamiento;
