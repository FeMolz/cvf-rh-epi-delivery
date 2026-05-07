import express from "express";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------------------------------------------------------------------------
// Importar rotas modulares
// ------------------------------------------------------------------------------------------------------------------------------------
// import authRoutes from './modules/users/routes/authRoutes.js';

// ------------------------------------------------------------------------------------------------------------------------------------
// Usar rotas modulares
// ------------------------------------------------------------------------------------------------------------------------------------
// app.use('/api/auth', authRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Sistema de RH e SST rodando perfeitamente",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Ocorreu um erro interno no servidor",
  });
});

export default app;