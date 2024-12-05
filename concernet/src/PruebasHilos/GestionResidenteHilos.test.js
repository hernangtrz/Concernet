import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ResidentManagement from "../Pages/GestionResidentes"; // Ajusta la ruta si es necesario
import { useAuth } from "../AuthProvider";
import "@testing-library/jest-dom";

// Mock de NavBar para evitar problemas con el componente
jest.mock("../Components/NavBar", () => () => <div>NavBar</div>);
jest.mock("../AuthProvider", () => ({
  useAuth: jest.fn(),
}));
describe("GestionResidentes", () => {
  beforeEach(() => {
    // Mock del hook useAuth
    useAuth.mockReturnValue({
      user: { role: "admin" }, // Simula un usuario con rol 'admin'
    });
  });
  afterEach(() => {
    // Limpia el mock después de cada prueba
    jest.clearAllMocks();
  });
  test("debe permitir agregar un nuevo residente si el usuario esta autenticado y rol es admin", async () => {
    render(<ResidentManagement />);

    // Verifica que los residentes actuales estén en la tabla
    const residentList = screen.getByText("Lista de Residentes");
    expect(residentList).toBeInTheDocument();

    // Abre el modal para agregar un residente
    const addButton = screen.getByText("Agregar Residente");
    fireEvent.click(addButton);

    // Llena los campos con datos válidos
    const firstNameInput = screen.getByPlaceholderText("Nombre");
    const lastNameInput = screen.getByPlaceholderText("Apellido");
    const idInput = screen.getByPlaceholderText("Cédula");
    const emailInput = screen.getByPlaceholderText("Correo Electrónico");
    const phoneInput = screen.getByPlaceholderText("Teléfono");
    const addressInput = screen.getByPlaceholderText("Dirección");
    const passwordInput = screen.getByPlaceholderText("Contraseña");

    fireEvent.change(firstNameInput, { target: { value: "Carlos" } });
    fireEvent.change(lastNameInput, { target: { value: "Gómez" } });
    fireEvent.change(idInput, { target: { value: "11223344" } });
    fireEvent.change(emailInput, {
      target: { value: "carlosgomez@example.com" },
    });
    fireEvent.change(phoneInput, { target: { value: "3001234568" } });
    fireEvent.change(addressInput, { target: { value: "Calle 456" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Click en "Agregar"
    const addButtonInModal = screen.getByText("Agregar");
    fireEvent.click(addButtonInModal);

    // Espera que el nuevo residente se haya agregado correctamente
    await waitFor(() => {
      expect(screen.getByText("Carlos")).toBeInTheDocument();
    });
  });

  test("debe mostrar error si la cédula ya está registrada", async () => {
    render(<ResidentManagement />);

    // Abre el modal para agregar un residente
    const addButton = screen.getByText("Agregar Residente");
    fireEvent.click(addButton);

    // Llena los campos con una cédula que ya existe
    const firstNameInput = screen.getByPlaceholderText("Nombre");
    const lastNameInput = screen.getByPlaceholderText("Apellido");
    const idInput = screen.getByPlaceholderText("Cédula");
    const emailInput = screen.getByPlaceholderText("Correo Electrónico");
    const phoneInput = screen.getByPlaceholderText("Teléfono");
    const addressInput = screen.getByPlaceholderText("Dirección");
    const passwordInput = screen.getByPlaceholderText("Contraseña");

    fireEvent.change(firstNameInput, { target: { value: "Carlos" } });
    fireEvent.change(lastNameInput, { target: { value: "Gómez" } });
    fireEvent.change(idInput, { target: { value: "12345678" } }); // ID existente
    fireEvent.change(emailInput, {
      target: { value: "carlosgomez@example.com" },
    });
    fireEvent.change(phoneInput, { target: { value: "3001234568" } });
    fireEvent.change(addressInput, { target: { value: "Calle 456" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Click en "Agregar"
    const addButtonInModal = screen.getByText("Agregar");
    fireEvent.click(addButtonInModal);

    // Verifica que el error por cédula duplicada se muestre
    await waitFor(() => {
      expect(
        screen.getByText("La cédula ingresada ya está registrada.")
      ).toBeInTheDocument();
    });
  });

  test("debe mostrar error si el correo electrónico ya está registrado", async () => {
    render(<ResidentManagement />);

    // Abre el modal para agregar un residente
    const addButton = screen.getByText("Agregar Residente");
    fireEvent.click(addButton);

    // Llena los campos con un correo que ya existe
    const firstNameInput = screen.getByPlaceholderText("Nombre");
    const lastNameInput = screen.getByPlaceholderText("Apellido");
    const idInput = screen.getByPlaceholderText("Cédula");
    const emailInput = screen.getByPlaceholderText("Correo Electrónico");
    const phoneInput = screen.getByPlaceholderText("Teléfono");
    const addressInput = screen.getByPlaceholderText("Dirección");
    const passwordInput = screen.getByPlaceholderText("Contraseña");

    fireEvent.change(firstNameInput, { target: { value: "Carlos" } });
    fireEvent.change(lastNameInput, { target: { value: "Gómez" } });
    fireEvent.change(idInput, { target: { value: "99887766" } });
    fireEvent.change(emailInput, {
      target: { value: "juanperez@example.com" },
    }); // Correo existente
    fireEvent.change(phoneInput, { target: { value: "3001234568" } });
    fireEvent.change(addressInput, { target: { value: "Calle 456" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Click en "Agregar"
    const addButtonInModal = screen.getByText("Agregar");
    fireEvent.click(addButtonInModal);

    // Verifica que el error por correo duplicado se muestre
    await waitFor(() => {
      expect(
        screen.getByText("El correo electrónico ya está registrado.")
      ).toBeInTheDocument();
    });
  });

  test("debe mostrar error si el teléfono ya está registrado", async () => {
    render(<ResidentManagement />);

    // Abre el modal para agregar un residente
    const addButton = screen.getByText("Agregar Residente");
    fireEvent.click(addButton);

    // Llena los campos con un teléfono que ya existe
    const firstNameInput = screen.getByPlaceholderText("Nombre");
    const lastNameInput = screen.getByPlaceholderText("Apellido");
    const idInput = screen.getByPlaceholderText("Cédula");
    const emailInput = screen.getByPlaceholderText("Correo Electrónico");
    const phoneInput = screen.getByPlaceholderText("Teléfono");
    const addressInput = screen.getByPlaceholderText("Dirección");
    const passwordInput = screen.getByPlaceholderText("Contraseña");

    fireEvent.change(firstNameInput, { target: { value: "Carlos" } });
    fireEvent.change(lastNameInput, { target: { value: "Gómez" } });
    fireEvent.change(idInput, { target: { value: "99887766" } });
    fireEvent.change(emailInput, {
      target: { value: "carlosgomez@example.com" },
    });
    fireEvent.change(phoneInput, { target: { value: "3001234567" } }); // Teléfono existente
    fireEvent.change(addressInput, { target: { value: "Calle 456" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Click en "Agregar"
    const addButtonInModal = screen.getByText("Agregar");
    fireEvent.click(addButtonInModal);

    // Verifica que el error por teléfono duplicado se muestre
    await waitFor(() => {
      expect(
        screen.getByText("El teléfono ya está registrado.")
      ).toBeInTheDocument();
    });
  });
});
