import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import GestionViviendas from "../Pages/GestionViviendas";
import React from "react";
import "@testing-library/jest-dom";
import {
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  doc,
} from "firebase/firestore";
import { useAuth } from "../AuthProvider";

// Mock de la función de Firebase Firestore
jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"), // Importa las funciones reales para no alterar otras funciones
  getDocs: jest.fn(() => Promise.resolve({ empty: true })),
  addDoc: jest.fn(() => Promise.resolve({ id: "2" })), // Mock de addDoc
  collection: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

// Mock de AuthProvider
jest.mock("../AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock de las funciones de React Router y Firebase
jest.mock("../firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("Pruebas de integración para GestionViviendas", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock del hook useAuth
    useAuth.mockReturnValue({
      user: { role: "admin" },
    });

    // Configurar el mock para collection y getDocs
    collection.mockImplementation(() => ({
      path: "viviendas",
    }));

    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "1",
          data: () => ({
            direccion: "Calle 123",
            precio: "500000",
            habitaciones: "3",
            enVenta: true,
            descripcion: "Vivienda en venta",
            imagen: "test-img.jpg",
          }),
        },
      ],
    });
  });

  test("Debe mostrar la lista de viviendas cargadas", async () => {
    render(
      <MemoryRouter initialEntries={["/GestionViviendas"]}>
        <Routes>
          <Route path="/GestionViviendas" element={<GestionViviendas />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Calle 123/i)).toBeInTheDocument();
    expect(screen.getByText(/500000/i)).toBeInTheDocument();

    const habitacionesElements = screen.getAllByText(/3/i);
    expect(habitacionesElements.length).toBeGreaterThan(0); // Asegura que al menos un elemento con "3" esté presente

    expect(screen.getByText(/Vivienda en venta/i)).toBeInTheDocument();
  });

  test("Debe agregar una nueva vivienda correctamente", async () => {
    render(
      <MemoryRouter initialEntries={["/GestionViviendas"]}>
        <Routes>
          <Route path="/GestionViviendas" element={<GestionViviendas />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Agregar Vivienda"));
    fireEvent.change(screen.getByPlaceholderText(/Dirección/i), {
      target: { value: "Calle 456" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Precio/i), {
      target: { value: "600000" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Habitaciones/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Descripción/i), {
      target: { value: "Vivienda de prueba para agregar" },
    });
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Imagen"), {
      target: { files: [file] },
    });
    const agregarButton = screen.getByTestId("add-vivienda-button");
    fireEvent.click(agregarButton);
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          direccion: "Calle 456",
          precio: "600000",
          habitaciones: "4",
          enVenta: true,
          descripcion: "Vivienda de prueba para agregar",
        })
      );
    });
    expect(screen.getByText(/Calle 456/i)).toBeInTheDocument();
  });

  test("Debe editar una vivienda correctamente", async () => {
    // Mock de getDocs para cargar viviendas
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "1",
          data: () => ({
            direccion: "Calle 123",
            precio: "500000",
            habitaciones: "3",
            enVenta: true,
            descripcion: "Vivienda en venta",
            imagen: "test-img.jpg",
          }),
        },
      ],
    });
    const mockDocRef = { id: "1" };
    doc.mockReturnValue(mockDocRef);
    updateDoc.mockResolvedValueOnce();
    render(
      <MemoryRouter initialEntries={["/GestionViviendas"]}>
        <Routes>
          <Route path="/GestionViviendas" element={<GestionViviendas />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Calle 123/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Editar/i));
    fireEvent.change(screen.getByPlaceholderText(/Dirección/i), {
      target: { value: "Calle 789" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Precio/i), {
      target: { value: "700000" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Habitaciones/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Descripción/i), {
      target: { value: "Vivienda editada" },
    });
    fireEvent.click(screen.getByText(/Actualizar/i));
    // Verificar que updateDoc haya sido llamado con los datos correctos
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          direccion: "Calle 789",
          precio: "700000",
          habitaciones: "4",
          enVenta: true,
          descripcion: "Vivienda editada",
        })
      );
    });
    // Verificar que los cambios se reflejan en la tabla
    expect(screen.getByText(/Calle 789/i)).toBeInTheDocument();
    expect(screen.getByText(/700000/i)).toBeInTheDocument();
  });

  test("Debe eliminar una vivienda correctamente", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "1",
          data: () => ({
            direccion: "Calle 123",
            precio: "500000",
            habitaciones: "3",
            enVenta: true,
            descripcion: "Vivienda en venta",
            imagen: "test-img.jpg",
          }),
        },
      ],
    });
    deleteDoc.mockResolvedValueOnce();
    render(
      <MemoryRouter initialEntries={["/GestionViviendas"]}>
        <Routes>
          <Route path="/GestionViviendas" element={<GestionViviendas />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Calle 123/i)).toBeInTheDocument();
    });
    const eliminarButton = screen.getByText(/Eliminar/i);
    fireEvent.click(eliminarButton);
    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledWith(expect.any(Object));
    });
    expect(screen.queryByText(/Calle 123/i)).not.toBeInTheDocument();
  });
});
