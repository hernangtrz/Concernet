import { render, fireEvent, screen } from "@testing-library/react";
import GestionViviendas from "../Pages/GestionViviendas";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../AuthProvider"; // Asegúrate de importar el contexto autenticado
import React from "react";
import "@testing-library/jest-dom";

// Mock de useAuth
jest.mock("../AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mocks de Firestore
jest.mock("firebase/firestore", () => {
  return {
    collection: jest.fn(() => ({
      id: "viviendas",
    })),
    getDocs: jest.fn(() =>
      Promise.resolve({
        docs: [
          {
            id: "1",
            data: () => ({
              direccion: "Calle 123",
              precio: 100000,
              habitaciones: 3,
              enVenta: true,
              imagen: "image.jpg",
              descripcion: "Hermosa casa de dos pisos",
            }),
          },
        ],
      })
    ),
    addDoc: jest.fn(() => Promise.resolve({ id: "123" })),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
  };
});

// Mocks de la configuración de Firebase
jest.mock("../firebaseConfig", () => ({
  db: {}, // Mock de Firestore
  auth: {
    currentUser: { uid: "testUid" },
  },
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

describe("Pruebas unitarias para Gestión de Viviendas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock para un usuario administrador
    useAuth.mockReturnValue({
      user: { role: "admin" },
    });
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test("Debe mostrar un error si la dirección tiene menos de 6 caracteres", () => {
    renderWithRouter(<GestionViviendas />);

    // Simula la apertura del modal
    fireEvent.click(screen.getByText("Agregar Vivienda"));

    // Ahora busca el input con el placeholder "Dirección"
    const direccionInput = screen.getByPlaceholderText("Dirección");
    fireEvent.change(direccionInput, {
      target: { value: "C123" },
    });
    fireEvent.blur(direccionInput);

    expect(
      screen.getByText("La dirección debe tener entre 6 y 20 caracteres.")
    ).toBeInTheDocument();
  });

  test("Debe mostrar un error si el precio no es válido", () => {
    renderWithRouter(<GestionViviendas />);

    fireEvent.click(screen.getByText("Agregar Vivienda"));

    const precioInput = screen.getByPlaceholderText("Precio");

    fireEvent.change(precioInput, {
      target: { value: "abc" },
    });
    fireEvent.blur(precioInput);

    expect(
      screen.getByText(
        "El precio debe ser un número mayor a 0 y máximo 10 dígitos."
      )
    ).toBeInTheDocument();
  });

  test("Debe mostrar un error si el número de habitaciones es mayor a 5", () => {
    renderWithRouter(<GestionViviendas />);

    fireEvent.click(screen.getByText("Agregar Vivienda"));

    const habitacionesInput = screen.getByPlaceholderText("Habitaciones");

    fireEvent.change(habitacionesInput, {
      target: { value: "6" },
    });
    fireEvent.blur(habitacionesInput);

    expect(
      screen.getByText("El número de habitaciones debe ser entre 1 y 5.")
    ).toBeInTheDocument();
  });

  test("Debe mostrar un error si la imagen tiene un formato no válido", async () => {
    renderWithRouter(<GestionViviendas />);

    fireEvent.click(screen.getByText("Agregar Vivienda"));

    // Simula la carga de un archivo con un formato no válido
    const file = new File([""], "test.bmp", { type: "image/bmp" });
    fireEvent.change(screen.getByLabelText("Imagen"), {
      target: { files: [file] },
    });

    // Verifica que el mensaje de error se muestra
    expect(
      await screen.findByText((content, element) =>
        content.includes("Solo se permiten archivos JPG y PNG.")
      )
    ).toBeInTheDocument();
  });

  test("Debe mostrar un error si la descripción tiene menos de 11 caracteres", () => {
    renderWithRouter(<GestionViviendas />);

    fireEvent.click(screen.getByText("Agregar Vivienda"));

    const descripcionInput = screen.getByPlaceholderText("Descripción");

    fireEvent.change(descripcionInput, {
      target: { value: "Casa" },
    });
    fireEvent.blur(descripcionInput);

    expect(
      screen.getByText("La descripción debe tener entre 11 y 200 caracteres.")
    ).toBeInTheDocument();
  });

  test("Debe permitir agregar una vivienda con datos válidos", () => {
    renderWithRouter(<GestionViviendas />);

    fireEvent.click(screen.getByText("Agregar Vivienda"));

    fireEvent.change(screen.getByPlaceholderText("Dirección"), {
      target: { value: "Calle 123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Precio"), {
      target: { value: "100000" },
    });
    fireEvent.change(screen.getByPlaceholderText("Habitaciones"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "En venta" },
    });
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Imagen"), {
      target: { files: [file] },
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Hermosa casa de dos pisos con jardín" },
    });

    fireEvent.click(screen.getByText("Agregar"));

    expect(
      screen.queryByText("La dirección debe tener entre 6 y 20 caracteres.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "El precio debe ser un número mayor a 0 y máximo 10 dígitos."
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("El número de habitaciones debe ser entre 1 y 5.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("La descripción debe tener entre 11 y 200 caracteres.")
    ).not.toBeInTheDocument();
  });
});
