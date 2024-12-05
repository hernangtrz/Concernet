import { setupServer } from "msw/node"; // Importar la configuración del servidor de MSW
import { rest } from "msw"; // Para definir las rutas mockeadas

// Definir el servidor con las rutas mockeadas
const server = setupServer(
  rest.get("/api/usuarios/:id", (req, res, ctx) => {
    const { id } = req.params;
    if (id === "12345") {
      return res(ctx.json({ id: "12345", nombre: "Juan Pérez" }));
    }
    return res(ctx.status(404), ctx.json({ error: "Usuario no encontrado" }));
  })
);

// Exportar el servidor para usarlo en las pruebas
export { server };
