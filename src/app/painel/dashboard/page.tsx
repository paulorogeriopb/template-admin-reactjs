"use client";

import Layout from "@/components/Painel/Layout";

const Dashboard = () => {
  return (
    <Layout>
      <main className="main-content">
        {/* Título e Trilha de Navegação */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Dashboard</h2>
            <nav className="breadcrumb">
              <span>Dashboard</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header">
            <h3 className="content-box-title">Página Inicial</h3>
            <div className="content-box-btn"></div>
          </div>

          <div className="content-box-body">Bem-vindo ...!</div>
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;
