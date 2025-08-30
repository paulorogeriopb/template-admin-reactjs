"use client";

import Menu from "@/componets/Menu";
//Importar o Hooks responsável pela proteção de rotas
import { ProtectedRoute } from "@/componets/ProtectedRoute";

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <Menu />
      <br />
      <h1>Dashboard</h1>
    </ProtectedRoute>
  );
};

export default Dashboard;
