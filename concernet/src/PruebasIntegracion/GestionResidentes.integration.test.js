import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ResidentManagement from "../Pages/GestionResidentes";
import React from "react";
import "@testing-library/jest-dom";
import { getDocs, setDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../AuthProvider";
import { auth, db } from "../firebaseConfig";

// Mock de Firebase
jest.mock("firebase/firestore", () => {
  const actualFirestore = jest.requireActual("firebase/firestore");
  return {
    ...actualFirestore,
    getDocs: jest.fn(() => Promise.resolve({ empty: true })),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
  };
});

// Mock de las funciones de React Router y Firebase
jest.mock("../firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
}));

jest.mock("firebase/auth", () => ({
  ...jest.requireActual("firebase/auth"),
  createUserWithEmailAndPassword: jest.fn(),
}));

// Mock de AuthProvider
jest.mock("../AuthProvider", () => ({
  useAuth: jest.fn(),
}));

describe("Pruebas de integración para Gestión de Residentes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock del hook useAuth
    useAuth.mockReturnValue({
      user: { role: "admin" },
    });
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "1",
          data: () => ({
            firstName: "Carlos",
            lastName: "López",
            id: "987654321",
            email: "clopez@example.com",
            phone: "3009876543",
            address: "Carrera 45",
            password: "securepassword",
          }),
        },
      ],
    });
  });

  test("Debe agregar un nuevo residente correctamente", async () => {
    // Mock de createUserWithEmailAndPassword
    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: "123abc",
        email: "juan.perez@example.com",
      },
    });
    const mockDocRef = { id: "1" };
    doc.mockReturnValue(mockDocRef);
    // Mock de setDoc
    setDoc.mockResolvedValueOnce();
    render(
      <MemoryRouter initialEntries={["/GestionResidentes"]}>
        <Routes>
          <Route path="/GestionResidentes" element={<ResidentManagement />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByTestId("open-add-modal"));

    // Llenar los campos del formulario
    fireEvent.change(screen.getByPlaceholderText(/Nombre/i), {
      target: { value: "Juan" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Apellido/i), {
      target: { value: "Pérez" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Cédula/i), {
      target: { value: "123456789" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Correo Electrónico/i), {
      target: { value: "juan.perez@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Teléfono/i), {
      target: { value: "3001234567" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Dirección/i), {
      target: { value: "Calle 123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "password123" },
    });

    // Confirmar la adición del residente
    fireEvent.click(screen.getByTestId("confirm-add-resident"));

    // Verificar que `createUserWithEmailAndPassword` fue llamada con los parámetros correctos
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        "juan.perez@example.com",
        "password123"
      );
    });

    // Verificar que `setDoc` fue llamada con los datos correctos
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          firstName: "Juan",
          lastName: "Pérez",
          id: "123456789",
          email: "juan.perez@example.com",
          phone: "3001234567",
          address: "Calle 123",
          password: "password123",
          uid: "123abc", // Incluye este campo en la expectativa
          role: "resident",
        })
      );
    });

    // Encuentra todos los elementos que coincidan con "Juan" y verifica que haya solo uno en la tabla de residentes.
    const residents = await screen.findAllByText(/Juan/i);
    const residentNames = residents.filter(
      (element) => element.tagName === "TD" && element.textContent === "Juan"
    );
    expect(residentNames).toHaveLength(1); // Verifica que solo haya un residente con ese nombre
  });

  test("Debe editar un residente correctamente", async () => {
    // Mock de `getDocs` y `updateDoc`
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "1",
          data: () => ({
            firstName: "Carlos",
            lastName: "López",
            id: "987654321",
            email: "clopez@example.com",
            phone: "3009876543",
            address: "Carrera 45",
            password: "securepassword",
          }),
        },
      ],
    });
    // Mock de doc para devolver un valor simulado
    const mockDocRef = { id: "1" };
    doc.mockReturnValue(mockDocRef);
    updateDoc.mockResolvedValueOnce();

    render(
      <MemoryRouter initialEntries={["/GestionResidentes"]}>
        <Routes>
          <Route path="/GestionResidentes" element={<ResidentManagement />} />
        </Routes>
      </MemoryRouter>
    );

    // Verificar que Carlos esté en la tabla antes de editar
    await waitFor(() => {
      expect(screen.getByText(/Carlos/i)).toBeInTheDocument();
    });

    // Clic en Editar
    fireEvent.click(screen.getByText(/Editar/i));

    // Cambiar algunos valores en los campos de entrada del modal
    fireEvent.change(screen.getByDisplayValue(/Carlos/i), {
      target: { value: "Carlos Editado" },
    });

    // Hacer clic en el botón de actualización
    fireEvent.click(screen.getByText(/Actualizar/i));

    // Verificar que se haya llamado `updateDoc` con los datos correctos
    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          firstName: "Carlos Editado",
          lastName: "López",
          id: "987654321",
          email: "clopez@example.com",
          phone: "3009876543",
          address: "Carrera 45",
          password: "securepassword",
        })
      );
    });
  });

  test("Debe eliminar un residente correctamente", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "1",
          data: () => ({
            firstName: "Carlos",
            lastName: "López",
            id: "987654321",
            email: "clopez@example.com",
            phone: "3009876543",
            address: "Carrera 45",
            password: "securepassword",
          }),
        },
      ],
    });
    deleteDoc.mockResolvedValueOnce();
    render(
      <MemoryRouter initialEntries={["/GestionResidentes"]}>
        <Routes>
          <Route path="/GestionResidentes" element={<ResidentManagement />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Carlos/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Eliminar/i));
    // Verificar que deleteDoc haya sido llamado
    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledWith(expect.any(Object));
    });
    // Verificar que ya no esté en la tabla
    expect(screen.queryByText(/Carlos/i)).not.toBeInTheDocument();
  });
});
