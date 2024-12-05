import { useState } from "react";
import { useAuth } from "../AuthProvider";
import "../Styles/Login.css";
import React from "react";

const Login = () => {
  const [input, setInput] = useState({
    username: "",
    password: "",
  });
  const [mensaje, setMensaje] = useState("");
  const auth = useAuth();

  // Función para validar las entradas según las clases de equivalencia
  const validarEntradas = ({ username, password }) => {
    const errores = [];

    // Validación para el campo username
    if (
      typeof username !== "string" ||
      username.length < 8 ||
      username.length > 40
    ) {
      errores.push("El usuario o correo debe tener entre 8 y 40 caracteres.");
    }

    // Validación para el campo password
    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 20
    ) {
      errores.push("La contraseña debe tener entre 8 y 20 caracteres.");
    }

    return errores;
  };

  const handleSubmitEvent = (e) => {
    e.preventDefault();
    const errores = validarEntradas(input);

    if (errores.length > 0) {
      setMensaje(errores.join(" "));
      return;
    }

    try {
      auth.loginAction(input);
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <div className="general">
        <div className="error-message">{mensaje}</div>
        <div className="login">
          <form onSubmit={handleSubmitEvent} role="form">
            <h1>ConCerNet</h1>
            <div className="form_control">
              <label htmlFor="user-name">Usuario o Correo:</label>
              <input
                type="text"
                id="user-name"
                name="username"
                placeholder="Nombre de usuario o correo"
                aria-describedby="user-name"
                aria-invalid="false"
                onChange={handleInput}
              />
              <div id="user-name" className="sr-only">
                Ingrese un nombre de usuario válido (entre 8 y 40 caracteres).
              </div>
            </div>
            <div className="form_control">
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Contraseña"
                aria-describedby="user-password"
                aria-invalid="false"
                onChange={handleInput}
              />
              <div id="user-password" className="sr-only">
                Ingrese una contraseña válida (entre 8 y 20 caracteres).
              </div>
            </div>
            <button className="btn-submit">Iniciar sesión</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
