"use client";

import React from "react";

//import Menu from "@/components/Painel/Menu";

import Navbar from "../../Painel/Navbar";
import Sidebar from "../../Painel/Siderbar";
//Importar o Hooks responsável pela proteção de rotas
import { ProtectedRoute } from "../../ProtectedRoute";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <div className="bg-dashboard">
        {/* Navbar */}
        <Navbar />
        {/* Content */}
        <div className="flex">
          <Sidebar />
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
