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

/* =========================
   LOGIN (SEGURO)
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
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    res.json({ 
      success: true, 
      message: "Login exitoso",
      email: data.email 
    });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
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