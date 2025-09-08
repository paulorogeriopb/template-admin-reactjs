"use client";

import React, { useState } from "react";

//import Menu from "@/components/Painel/Menu";

import Navbar from "../../Painel/Navbar";
import Sidebar from "../../Painel/Siderbar";
//Importar o Hooks responsável pela proteção de rotas
import { ProtectedRoute } from "../ProtectedRoute";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="bg-dashboard">
        {/* Navbar */}
        <Navbar setIsOpen={setIsOpen} />
        {/* Content */}

        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        {children}
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
