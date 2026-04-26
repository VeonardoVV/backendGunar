import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* =========================
   SUPABASE
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* =========================
   HOME
========================= */
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y password requeridos" });
  }

  try {
    // 1. Buscar solo por email
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email);

    // 🔴 Error real de Supabase
    if (error) {
      console.error("❌ Error Supabase:", error);
      return res.status(500).json({
        error: error.message,
        details: error
      });
    }

    // 2. Usuario no existe
    if (!data || data.length === 0) {
      return res.status(401).json({
        error: "Usuario no encontrado"
      });
    }

    // 3. Comparar password en backend (texto plano)
    const usuario = data[0];

  if (usuario.password !== password) {
      return res.status(401).json({
        error: "Contraseña incorrecta"
      });
    }

    console.log("✅ Login exitoso:", email);

  return res.json({
    success: true,
    message: "Login exitoso",
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol
  });

  } catch (err) {
    console.error("❌ Error en servidor:", err);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: err.message
    });
  }
});

/* =========================
   🔥 CATEGORÍAS (NUEVO)
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
   🔥 PRODUCTOS (JOIN CATEGORÍA)
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

  const result = data.map(p => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    stock: p.stock,
    fecha: p.fecha,
    categoria: p.categorias?.nombre || "Sin categoría"
  }));

  res.json(result);
});

/* =========================
   PRODUCTO POR ID
========================= */
app.get("/productos/:id", async (req, res) => {
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
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(500).json({ error });

  res.json({
    id: data.id,
    nombre: data.nombre,
    precio: data.precio,
    stock: data.stock,
    fecha: data.fecha,
    categoria_id: data.categoria_id,
    categoria: data.categorias?.nombre || ""
  });
});

/* =========================
   CREAR PRODUCTO
========================= */
app.post("/productos", async (req, res) => {
  const { data, error } = await supabase
    .from("productos")
    .insert([req.body])
    .select();

  if (error) return res.status(500).json({ error });

  res.json(data);
});

/* =========================
   ACTUALIZAR PRODUCTO
========================= */
app.put("/productos/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("productos")
    .update(req.body)
    .eq("id", req.params.id)
    .select();

  if (error) return res.status(500).json({ error });

  res.json(data);
});

/* =========================
   ELIMINAR PRODUCTO
========================= */
app.delete("/productos/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("productos")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error });

  res.json({
    message: "Producto eliminado",
    data
  });
});

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});