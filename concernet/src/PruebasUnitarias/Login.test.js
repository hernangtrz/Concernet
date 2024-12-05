import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../Pages/Login";
import React from "react";
import "@testing-library/jest-dom";

// Mock para loginAction
const mockLoginAction = jest.fn();

jest.mock("../AuthProvider", () => ({
  useAuth: () => ({
    loginAction: mockLoginAction,
  }),
}));

describe("Pruebas unitarias para el componente Login", () => {
  beforeEach(() => {
    mockLoginAction.mockClear();
  });

  test("Debe mostrar un error si el username es menor a 8 caracteres", () => {
    render(<Login />);

    fireEvent.change(
      screen.getByPlaceholderText("Nombre de usuario o correo"),
      {
        target: { value: "short" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "validPass123" },
    });
    fireEvent.click(screen.getByText("Iniciar sesión"));

    expect(
      screen.getByText(/El usuario o correo debe tener entre 8 y 40 caracteres/)
    ).toBeInTheDocument();
    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  test("Debe mostrar un error si la contraseña es menor a 8 caracteres", () => {
    render(<Login />);

    fireEvent.change(
      screen.getByPlaceholderText("Nombre de usuario o correo"),
      {
        target: { value: "validUser123" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByText("Iniciar sesión"));

    expect(
      screen.getByText(/La contraseña debe tener entre 8 y 20 caracteres/)
    ).toBeInTheDocument();
    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  test("Debe permitir el inicio de sesión con datos válidos", () => {
    render(<Login />);

    fireEvent.change(
      screen.getByPlaceholderText("Nombre de usuario o correo"),
      {
        target: { value: "validUser123" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "validPass123" },
    });
    fireEvent.click(screen.getByText("Iniciar sesión"));

    expect(mockLoginAction).toHaveBeenCalledWith({
      username: "validUser123",
      password: "validPass123",
    });
    expect(
      screen.queryByText(
        /El usuario o correo debe tener entre 8 y 40 caracteres/
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/La contraseña debe tener entre 8 y 20 caracteres/)
    ).not.toBeInTheDocument();
  });
});
