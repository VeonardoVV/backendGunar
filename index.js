import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./conexion.js"; // 👈 AQUÍ IMPORTAS TU CONEXIÓN

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* =========================
   HOME
========================= */
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

/* =========================
   LOGIN
========================= */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y password requeridos" });
  }

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const usuario = data[0];

    if (usuario.password !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    return res.json({
      success: true,
      message: "Login exitoso",
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol
    });

  } catch (err) {
    return res.status(500).json({
      error: "Error interno del servidor",
      details: err.message
    });
  }
});

/* =========================
   CATEGORÍAS
========================= */
app.get("/categorias", async (req, res) => {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("id", { ascending: true });

  if (error) return res.status(500).json({ error });

  res.json(data);
});

/* =========================
   PRODUCTOS
========================= */
app.get("/productos", async (req, res) => {
  const { data, error } = await supabase
    .from("productos")
    .select(`
      id,
      nombre,
      precio,
      stock,
      fecha,
      categorias:categoria_id ( nombre )
    `);

  if (error) return res.status(500).json({ error });

  res.json(
    data.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      fecha: p.fecha,
      categoria: p.categorias?.nombre || "Sin categoría"
    }))
  );
});

app.post("/productos", async (req, res) => {
  const { nombre, precio, stock, categoria_id, fecha } = req.body;

  const { data, error } = await supabase
    .from("productos")
    .insert([
      { nombre, precio, stock, categoria_id, fecha }
    ])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});
app.put("/productos/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, categoria_id, fecha } = req.body;

  const { data, error } = await supabase
    .from("productos")
    .update({ nombre, precio, stock, categoria_id, fecha })
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});
app.delete("/productos/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("productos")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    message: "Producto eliminado correctamente",
    data
  });
});

app.get("/productos/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("productos")
    .select(`
      id,
      nombre,
      precio,
      stock,
      fecha,
      categoria_id,
      categorias:categoria_id ( nombre )
    `)
    .eq("id", id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    id: data.id,
    nombre: data.nombre,
    precio: data.precio,
    stock: data.stock,
    categoria_id: data.categoria_id,
    categoria: data.categorias?.nombre || ""
  });
});
/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});