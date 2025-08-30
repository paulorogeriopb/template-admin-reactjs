"use client";

import Menu from "@/components/Menu";
//Importar o Hooks responsável pela proteção de rotas
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
