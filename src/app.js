import express from "express";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------------------------------------------------------------------------
// Importar rotas modulares
// ------------------------------------------------------------------------------------------------------------------------------------
// import authRoutes from './modules/users/routes/authRoutes.js';
import roleRoutes from './modules/roles/routes/role.routes.js';
import userRoutes from './modules/users/routes/user.routes.js';
import employeeRoutes from './modules/employees/routes/employee.routes.js';
import companyRoutes from './modules/companies/routes/company.routes.js';
import epiRoutes from './modules/epis/routes/epi.routes.js';
import epiToRoleRoutes from './modules/chaining/epiToRole/routes/epiToRole.routes.js';
import epiDeliveryRoutes from './modules/epiDeliveries/routes/epiDelivery.routes.js';
import epiDeliveryReportRoutes from './modules/epiDeliveryReports/routes/epiDeliveryReport.routes.js';

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

app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/epis", epiRoutes);
app.use("/api/v1/roles-epis", epiToRoleRoutes);
app.use("/api/v1/epi-deliveries", epiDeliveryRoutes);
app.use("/api/v1/epi-delivery-reports", epiDeliveryReportRoutes);

export default app;