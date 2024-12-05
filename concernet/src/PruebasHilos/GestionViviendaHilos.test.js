import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GestionViviendas from "../Pages/GestionViviendas";
import { useAuth } from "../AuthProvider";
import "@testing-library/jest-dom";
import React from "react";
import { MemoryRouter } from "react-router-dom";

// Datos de prueba
const viviendasData = [
  {
    id: "1",
    direccion: "Calle 1",
    precio: "$50000",
    descripcion: "Casa pequeña",
    habitaciones: 3,
    estado: "En Venta",
  },
  {
    id: "2",
    direccion: "Calle 2",
    precio: "$75000",
    descripcion: "Casa grande",
    habitaciones: 4,
    estado: "En Renta",
  },
];

// Mock de Firebase
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("firebase/firestore", () => {
  const mockCollection = jest.fn();
  const mockGetDocs = jest.fn();

  return {
    getFirestore: jest.fn(() => ({
      collection: mockCollection,
    })),
    collection: mockCollection,
    getDocs: mockGetDocs.mockResolvedValue({
      docs: viviendasData.map((vivienda) => ({
        id: vivienda.id,
        data: () => vivienda,
      })),
    }),
  };
});

// Mock del AuthProvider
jest.mock("../AuthProvider", () => ({
  useAuth: jest.fn(),
}));

describe("GestionViviendas", () => {
  beforeEach(() => {
    // Mock de `useAuth` para simular usuario administrador
    useAuth.mockReturnValue({
      user: { role: "admin" },
    });
  });

  afterEach(() => {
    // Limpiar todos los mocks después de cada prueba
    jest.clearAllMocks();
  });

  test("El usuario se autentica correctamente como admin", () => {
    <MemoryRouter>
      render(
      <GestionViviendas />
      );
    </MemoryRouter>;
    // Verificar que se renderiza el título de la página
    expect(screen.getByText("Gestión de Viviendas")).toBeInTheDocument();

    // Verificar que el botón para agregar vivienda solo es visible para administradores
    expect(screen.getByText("Agregar Vivienda")).toBeInTheDocument();
  });

  test("Consultar todas las viviendas registradas", () => {
    render(<GestionViviendas />);

    // Verificar que los datos de las viviendas aparecen en la tabla
    viviendasData.forEach((vivienda) => {
      expect(screen.getByText(vivienda.direccion)).toBeInTheDocument();
      expect(screen.getByText(vivienda.precio)).toBeInTheDocument();
      expect(screen.getByText(vivienda.descripcion)).toBeInTheDocument();
      expect(
        screen.getByText(vivienda.habitaciones.toString())
      ).toBeInTheDocument();
      expect(screen.getByText(vivienda.estado)).toBeInTheDocument();
    });
  });

  test("Validar que la dirección no sea la misma que otras viviendas", async () => {
    render(<GestionViviendas />);

    // Simular abrir el modal para agregar una nueva vivienda
    fireEvent.click(screen.getByText("Agregar Vivienda"));

    // Ingresar una dirección ya registrada
    const direccionInput = screen.getByLabelText("Dirección");
    fireEvent.change(direccionInput, {
      target: { value: viviendasData[0].direccion },
    });

    // Simular pérdida de foco (blur) en el campo de dirección
    fireEvent.blur(direccionInput);

    // Verificar que aparece el mensaje de error
    expect(
      await screen.findByText("La dirección ya está registrada")
    ).toBeInTheDocument();
  });

  test("Registrar una vivienda correctamente", async () => {
    render(<GestionViviendas />);

    // Simular abrir el modal para agregar una nueva vivienda
    fireEvent.click(screen.getByText("Agregar Vivienda"));

    // Ingresar datos válidos para una nueva vivienda
    fireEvent.change(screen.getByLabelText("Dirección"), {
      target: { value: "Calle Ficticia 123" },
    });
    fireEvent.change(screen.getByLabelText("Precio"), {
      target: { value: "$100000" },
    });
    fireEvent.change(screen.getByLabelText("Habitaciones"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Casa amplia con jardín" },
    });
    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "En Venta" },
    });

    // Simular carga de imagen
    const imagenInput = screen.getByLabelText("Imagen");
    const file = new File(["test"], "test-image.jpg", { type: "image/jpg" });
    Object.defineProperty(imagenInput, "files", { value: [file] });

    // Asegurarse de que no aparezca ningún error
    expect(
      screen.queryByText("La dirección ya está registrada")
    ).not.toBeInTheDocument();

    // Simular envío del formulario
    fireEvent.click(screen.getByText("Agregar"));

    // Verificar que la nueva vivienda aparece en la tabla
    await waitFor(() => screen.findByText("Calle Ficticia 123"));
    // eslint-disable-next-line testing-library/no-node-access
    const fila = screen.getByText("Calle Ficticia 123").closest("tr");

    expect(fila).toHaveTextContent("$100000");
    expect(fila).toHaveTextContent("3");
    expect(fila).toHaveTextContent("Casa amplia con jardín");
    expect(fila).toHaveTextContent("En Venta");
  });
});
