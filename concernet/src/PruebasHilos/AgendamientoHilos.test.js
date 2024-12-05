import React from "react";
import "@testing-library/jest-dom";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { Route, Routes, MemoryRouter } from "react-router-dom";
import Agendamiento from "../Pages/Agendamiento";
import { useAuth } from "../AuthProvider";

jest.mock("../EspaciosData", () => [
  {
    id: 1,
    imagen: "./Images/piscina.jpg",
    nombre: "Piscina",
  },
  {
    id: 2,
    imagen: "./Images/cancha.jpg",
    nombre: "Cancha",
  },
  {
    id: 3,
    imagen: "./Images/salonSocial.jpeg",
    nombre: "Salón Social",
  },
]);
jest.mock("../AuthProvider", () => ({
  useAuth: jest.fn(),
}));
describe("Pruebas basadas en hilos para el módulo de Agendamiento", () => {
  beforeEach(() => {
    // Mock del hook useAuth
    useAuth.mockReturnValue({
      user: { role: "residente" }, // Simula un usuario con rol 'residente'
    });
  });
  test("Verificar usuario con ID válido", async () => {
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );

    // Verificar que el título del espacio está presente
    expect(screen.getByText("Piscina")).toBeInTheDocument();

    // Simular entrada de usuario
    const inputCedula = screen.getByLabelText("Cédula");
    fireEvent.change(inputCedula, { target: { value: "1066864985" } });

    // Simular fecha y hora
    const inputFecha = screen.getByLabelText("Fecha");
    fireEvent.change(inputFecha, { target: { value: "2024-12-09" } });

    const inputHoraInicio = screen.getByLabelText("Hora Inicio");
    fireEvent.change(inputHoraInicio, { target: { value: "10:00" } });

    const inputHoraFin = screen.getByLabelText("Hora Fin");
    fireEvent.change(inputHoraFin, { target: { value: "12:00" } });

    // Hacer clic en el botón de Agendar
    const botonAgendar = screen.getByText("Agendar");
    fireEvent.click(botonAgendar);

    // Verificar el mensaje de éxito
    expect(
      await screen.findByText("Agendamiento creado con éxito")
    ).toBeInTheDocument();
  });
  test("Consultar espacio disponible", async () => {
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );

    // Verificar que se carga la información del espacio
    const espacioNombre = screen.getByText("Piscina");
    expect(espacioNombre).toBeInTheDocument();
  });

  test("Validar horarios incorrectos", async () => {
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );

    // Simular entrada de datos inválidos
    fireEvent.change(screen.getByLabelText(/Cédula/i), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha/i), {
      target: { value: "2024-12-01" },
    });
    fireEvent.change(screen.getByLabelText(/Hora Inicio/i), {
      target: { value: "12:00" },
    });
    fireEvent.change(screen.getByLabelText(/Hora Fin/i), {
      target: { value: "11:00" },
    });

    // Enviamos el formulario
    fireEvent.click(screen.getByText(/Agendar/i));

    // Verificamos que el error por horario incorrecto se muestra
    expect(
      await screen.findByText(/Los horarios no son correctos/i)
    ).toBeInTheDocument();
  });

  test("Registrar agendamiento con datos válidos", async () => {
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );

    // Simular entrada de datos válidos
    fireEvent.change(screen.getByLabelText("Cédula"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText("Fecha:"), {
      target: { value: "2024-12-01" },
    });
    fireEvent.change(screen.getByLabelText("Hora Inicio:"), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText("Hora Fin:"), {
      target: { value: "12:00" },
    });

    const botonAgendar = screen.getByText("Agendar");
    fireEvent.click(botonAgendar);

    // Verificar que el agendamiento se registra correctamente
    await waitFor(() => {
      expect(
        screen.getByText("Agendamiento creado con éxito")
      ).toBeInTheDocument();
    });
  });
});
