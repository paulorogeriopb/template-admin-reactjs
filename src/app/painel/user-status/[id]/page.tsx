"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import instance from "@/services/api";
import { AxiosError } from "axios";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import AlertMessageDismissible from "@/components/AlertMessageDismissible";
import { LuChevronLeft, LuSquarePen, LuList } from "react-icons/lu";

import Layout from "@/components/Painel/Layout";

type UserStatus = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function UserStatusDetails() {
  // Usado useParams para acessar o parametro 'id' da URL
  const { id } = useParams();

  // Estado para armazenar o status do usuário
  const [status, setStatus] = useState<UserStatus | null>(null);

  // Controle de carregamento
  const [loading, setLoading] = useState<boolean>(true);

  // Controle de erro
  const [error, setError] = useState<string | null>(null);

  // Buscar o registro pelo id na API
  const fetchUserStatusDetails = async (id: string) => {
    try {
      setLoading(true);

      const response = await instance.get(`/user-status/${id}`);

      if (response.data.error) {
        setError(response.data.error);
        setStatus(null);
      } else {
        setStatus(response.data);
      }

      setLoading(false);
    } catch (error: unknown) {
      setLoading(false);

      if (error instanceof AxiosError) {
        const data = error.response?.data;
        setError(
          data?.message ||
            data?.error ||
            "Erro inesperado ao carregar status do usuário."
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro desconhecido");
      }
    }
  };

  // Hook para carregar os dados do status pelo 'id'
  useEffect(() => {
    if (id) {
      const statusId = Array.isArray(id) ? id[0] : id;
      fetchUserStatusDetails(statusId);
    }
  }, [id]);

  return (
    <Layout>
      <main className="main-content">
        {/* Título e Trilha de Navegação */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Status Usuário</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <Link href="/painel/user-status/list" className="breadcrumb-link">
                Status Usuário
              </Link>
              <span> / </span>
              <span>Visualizar</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header">
            <h3 className="content-box-title">Detalhes do Status Usuário</h3>
            <div className="content-box-btn">
              <Link
                href={`/painel/user-status/list`}
                className="btn-info flex items-center gap-2"
              >
                <LuList /> Visualizar
              </Link>

              <Link
                href={`/painel/user-status/${status?.id}/edit`}
                className="btn-warning flex items-center gap-2"
              >
                <LuSquarePen /> Editar
              </Link>
            </div>
          </div>

          <div className="content-box-body">
            {loading && <LoadingSpinner />}
            <AlertMessageDismissible type="error" message={error} />
            {!loading && !error && status && (
              <div className="detail-box">
                <div className="mb-1">
                  <span className="title-detail-content">ID: </span>
                  <span className="detail-content">{status.id}</span>
                </div>

                <div className="mb-1">
                  <span className="title-detail-content">Nome: </span>
                  <span className="detail-content">{status.name}</span>
                </div>

                <div className="mb-1">
                  <span className="title-detail-content">Created At: </span>
                  <span className="detail-content">
                    {new Date(status.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="mb-1">
                  <span className="title-detail-content">Updated At: </span>
                  <span className="detail-content">
                    {new Date(status.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="content-box-btn mt-4">
              <Link
                href="/painel/user-status/list"
                className="btn-default flex items-center space-x-1"
              >
                <LuChevronLeft />
                <span>Voltar</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
