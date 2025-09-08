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

type Permission = {
  id: number;
  title: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function CursoDetails() {
  //Usado useParams para acessar o parâmetro 'id' da URL
  const { id } = useParams();

  // Estado para armazenar o permission
  const [permission, setCurso] = useState<Permission | null>(null);

  // Controle de carregamento
  const [loading, setLoading] = useState<boolean>(true);

  // Controle de erro
  const [error, setError] = useState<string | null>(null);

  // buscar o registro pelo id na API
  const fetchCursoDetails = async (id: string) => {
    try {
      setLoading(true);

      const response = await instance.get(`/permissions/${id}`);

      // Se a API retornar erro no formato { error: "..."}
      if (response.data.error) {
        setError(response.data.error);
        setCurso(null);
      } else {
        setCurso(response.data.data); // já deve ser um objeto de permission
      }

      setLoading(false);
    } catch (error: unknown) {
      setLoading(false);

      if (error instanceof AxiosError) {
        // AxiosError tem response.data
        const data = error.response?.data;
        if (data?.message) {
          setError(data.message);
        } else if (data?.error) {
          setError(data.error);
        } else {
          setError(
            "Erro inesperado ao carregar permission, por favor tente novamente."
          );
        }
      } else if (error instanceof Error) {
        // Qualquer outro erro JS
        setError(error.message);
      } else {
        setError("Erro desconhecido");
      }
    }
  };

  // Hook para carregar os dados do permission do 'id'
  useEffect(() => {
    if (id) {
      //Garantir que o id seja um string
      const cursoId = Array.isArray(id) ? id[0] : id;

      // Busca os detalhes do permission
      fetchCursoDetails(cursoId);
    }
  }, [id]);

  return (
    <Layout>
      <main className="main-content">
        {/* Título e Trilha de Navegação */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Permission</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <Link href="/painel/permissions/list" className="breadcrumb-link">
                Permission
              </Link>
              <span> / </span>
              <span>Visualizar</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header">
            <h3 className="content-box-title">Detalhes do Permission</h3>
            <div className="content-box-btn">
              <Link
                href={`/painel/permissions/list`}
                className="btn-info  flex items-center gap-2"
              >
                {" "}
                <LuList /> Visualizar
              </Link>

              <Link
                href={`/painel/permissions/${permission?.id}/edit`}
                className="btn-warning flex items-center gap-2"
              >
                <LuSquarePen /> Editar
              </Link>
            </div>
          </div>

          <div className="content-box-body">
            {loading && LoadingSpinner()}
            <AlertMessageDismissible type="error" message={error} />
            {!loading && !error && permission && (
              <div>
                <div className="detail-box">
                  <div className="mb-1">
                    <span className="title-detail-content">ID: </span>
                    <span className="detail-content">{permission.id}</span>
                  </div>

                  <div className="mb-1">
                    <span className="title-detail-content">Título: </span>
                    <span className="detail-content">{permission.title}</span>
                  </div>

                  <div className="mb-1">
                    <span className="title-detail-content">Nome: </span>
                    <span className="detail-content">{permission.name}</span>
                  </div>

                  <div className="mb-1">
                    <span className="title-detail-content">Created At: </span>
                    <span className="detail-content">
                      {new Date(permission.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="mb-1">
                    <span className="title-detail-content">Updated At: </span>
                    <span className="detail-content">
                      {new Date(permission.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="content-box-btn">
              <Link
                href="/painel/permissions/list"
                className="btn-default flex items-center space-x-1 "
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
