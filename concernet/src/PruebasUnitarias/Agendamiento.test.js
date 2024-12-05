import { render, fireEvent, screen } from "@testing-library/react";
import Agendamiento from "../Pages/Agendamiento";
import { Route, Routes, MemoryRouter } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import React from "react";
import "@testing-library/jest-dom";

// Mock de Firebase
jest.mock("../firebaseConfig", () => ({
  db: {},
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
}));

jest.mock("../EspaciosData", () => ({
  __esModule: true, // Indica que es un módulo ES
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

jest.mock("../AuthProvider", () => ({
  useAuth: jest.fn(),
}));

describe("Pruebas unitarias para el módulo de Agendamiento", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock del hook useAuth
    useAuth.mockReturnValue({
      user: { role: "resident" }, // Simula un usuario con rol 'residente'
    });
  });
  test("Debe mostrar un error si la cédula es menor que 1", () => {
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText("Cédula"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("Fecha"), {
      target: { value: "2024-12-09" },
    });

    fireEvent.change(screen.getByLabelText("Hora Inicio"), {
      target: { value: "14:00" },
    });
    fireEvent.change(screen.getByLabelText("Hora Fin"), {
      target: { value: "16:00" },
    });
    fireEvent.click(screen.getByText("Agendar"));
    expect(
      screen.getByText(
        "La cédula debe ser un número entero mayor a 0 y máximo 10 dígitos."
      )
    ).toBeInTheDocument();
  });

  test("Debe mostrar un error si la cédula tiene más de 10 dígitos", () => {
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText("Cédula"), {
      target: { value: "12345678901" },
    });
    fireEvent.change(screen.getByLabelText("Fecha"), {
      target: { value: "2024-12-09" },
    });

    fireEvent.change(screen.getByLabelText("Hora Inicio"), {
      target: { value: "14:00" },
    });

    fireEvent.change(screen.getByLabelText("Hora Fin"), {
      target: { value: "16:00" },
    });
    fireEvent.click(screen.getByText("Agendar"));
    expect(
      screen.getByText(
        "La cédula debe ser un número entero mayor a 0 y máximo 10 dígitos."
      )
    ).toBeInTheDocument();
  });

  test("Debe mostrar un error si la fecha es en el pasado", () => {
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText("Cédula"), {
      target: { value: "1066864985" },
    });
    fireEvent.change(screen.getByLabelText("Fecha"), {
      target: { value: "2023-05-01" },
    });
    fireEvent.change(screen.getByLabelText("Hora Inicio"), {
      target: { value: "14:00" },
    });
    fireEvent.change(screen.getByLabelText("Hora Fin"), {
      target: { value: "16:00" },
    });
    fireEvent.click(screen.getByText("Agendar"));

    expect(
      screen.getByText("No puedes agendar en una fecha que ya pasó.")
    ).toBeInTheDocument();
  });

  test("Debe mostrar un error si la hora de inicio es mayor o igual a la hora de fin", () => {
    render(
      <MemoryRouter initialEntries={["/Espacios/1"]}>
        <Routes>
          <Route path="/Espacios/:id" element={<Agendamiento />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Cédula"), {
      target: { value: "1066864985" },
    });

    fireEvent.change(screen.getByLabelText("Fecha"), {
      target: { value: "2024-12-09" },
    });
    fireEvent.change(screen.getByLabelText("Hora Inicio"), {
      target: { value: "14:00" },
    });
    fireEvent.change(screen.getByLabelText("Hora Fin"), {
      target: { value: "12:00" },
    });
    fireEvent.click(screen.getByText("Agendar"));

    expect(
      screen.getByText("La hora de inicio debe ser anterior a la hora de fin.")
    ).toBeInTheDocument();
  });
});
