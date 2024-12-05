import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Agendamiento from "../Pages/Agendamiento";
import React from "react";
import "@testing-library/jest-dom";
import { useAuth } from "../AuthProvider";
import { getDocs, addDoc, collection } from "firebase/firestore";

// Mock de la función de Firebase Firestore
jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"), // Importa las funciones reales para no alterar otras funciones
  getDocs: jest.fn(() => Promise.resolve({ empty: true })),
  addDoc: jest.fn(() => Promise.resolve({ id: "2" })), // Mock de addDoc
  collection: jest.fn(),
  doc: jest.fn(),
}));

// Mock de EspaciosData
jest.mock("../EspaciosData", () => ({
  __esModule: true,
  default: [
    {
      id: 1,
      imagen: "test-file-stub",
      nombre: "Piscina",
    },
    {
      id: 2,
      imagen: "test-file-stub",
      nombre: "Cancha",
    },
    {
      id: 3,
      imagen: "test-file-stub",
      nombre: "Salon",
    },
  ],
}));

// Mock del hook useAuth
jest.mock("../AuthProvider", () => ({
  useAuth: jest.fn(),
}));

describe("Pruebas de integración para Agendamiento", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: { role: "resident" },
    });
    // Configurar el mock para collection y getDocs
    collection.mockImplementation(() => ({
      path: "agendamientos",
    }));
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "mockDocId",
          data: () => ({
            cedula: "1066864985",
            fecha: "2024-12-05",
            horaInicio: "10:00",
            horaFin: "12:00",
          }),
        },
      ],
    });
  });
  test("Debe mostrar los datos del espacio seleccionado", () => {
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Piscina/i)).toBeInTheDocument();
  });

  test("Debe mostrar un error si el usuario no está registrado", async () => {
    getDocs.mockResolvedValueOnce({ empty: true }); // Simula que no hay usuario registrado

    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/cédula/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha/i), {
      target: { value: "2024-12-07" },
    });
    fireEvent.change(screen.getByLabelText(/Hora Inicio/i), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText(/Hora Fin/i), {
      target: { value: "12:00" },
    });
    fireEvent.click(screen.getByText(/Agendar/i));

    await waitFor(() => {
      expect(
        screen.getByText(/El usuario no está registrado/i)
      ).toBeInTheDocument();
    });
  });

  test("Debe mostrar un error si el espacio ya está reservado", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "mockDocId",
          data: () => ({
            cedula: "1066864985",
            fecha: "2024-12-05",
            horaInicio: "10:00",
            horaFin: "12:00",
          }),
        },
      ],
    });
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Cédula/i), {
      target: { value: "1066864985" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha/i), {
      target: { value: "2024-12-05" },
    });
    fireEvent.change(screen.getByLabelText(/Hora Inicio/i), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText(/Hora Fin/i), {
      target: { value: "12:00" },
    });
    fireEvent.click(screen.getByText(/Agendar/i));
    await waitFor(() => {
      expect(
        screen.getByText(/El espacio ya está reservado en ese horario./i)
      ).toBeInTheDocument();
    });
  });

  test("Debe agendar un espacio correctamente", async () => {
    getDocs.mockResolvedValueOnce({ empty: true }); // Simula que no hay registros previos
    addDoc.mockResolvedValueOnce({}); // Simula un éxito al agregar el documento
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Cédula/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha/i), {
      target: { value: "2024-12-04" },
    });
    fireEvent.change(screen.getByLabelText(/Hora Inicio/i), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText(/Hora Fin/i), {
      target: { value: "12:00" },
    });
    fireEvent.click(screen.getByText(/Agendar/i));
    await waitFor(() => {
      expect(
        screen.getByText(/¡Agendamiento creado con éxito!/i)
      ).toBeInTheDocument();
    });
  });
});
