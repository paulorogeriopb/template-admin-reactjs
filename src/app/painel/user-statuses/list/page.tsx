"use client";

import { useState, useEffect } from "react";
import instance from "@/services/api";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import Pagination from "@/components/Pagination";
import DeleteButton from "@/components/DeleteButton";
import Layout from "@/components/Painel/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LuCirclePlus, LuEye, LuSquarePen } from "react-icons/lu";
import AlertMessageDismissible from "@/components/AlertMessageDismissible";

type Curso = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function CursosList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(pageFromUrl);
  const [lastPage, setLastPage] = useState<number>(1);

  // Buscar cursos da API
  const fetchCursos = async (page: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await instance.get(`/user-statuses?page=${page}`);
      setCursos(response.data.data || []);
      setCurrentPage(response.data.current_page || page);
      setLastPage(response.data.last_page || 1);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        setError(
          data?.message || data?.error || "Erro inesperado ao carregar cursos."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido");
      }
    } finally {
      setLoading(false);
    }
  };

  // Callback após sucesso na exclusão
  const handleSuccess = () => {
    setSuccess("Curso deletado com sucesso!");
    fetchCursos(currentPage);
  };

  useEffect(() => {
    fetchCursos(pageFromUrl);
  }, [pageFromUrl]);

  const handlePageChange = (page: number) => {
    setError(null);
    setSuccess(null);
    router.push(`?page=${page}`);
  };

  return (
    <Layout>
      <main className="main-content">
        {/* Header */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Cursos</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <span>Cursos</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header flex justify-between items-center">
            <h3 className="content-box-title">Cursos</h3>
            <div className="content-box-btn">
              <Link
                href="/painel/cursos/create"
                className="btn-success flex items-center gap-1"
              >
                <LuCirclePlus />
                <span>Novo</span>
              </Link>
            </div>
          </div>

          <div className="content-box-body">
            {loading && <LoadingSpinner />}
            <AlertMessageDismissible type="error" message={error} />
            {success && (
              <AlertMessageDismissible type="success" message={success} />
            )}

            <div className="table-container mt-6">
              {!loading && !error && (
                <table className="table">
                  <caption className="sr-only">Lista de Cursos</caption>
                  <thead>
                    <tr className="table-row-header">
                      <th className="table-header">ID</th>
                      <th className="table-header">Nome</th>
                      <th className="table-header center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.length > 0 ? (
                      cursos.map((curso) => (
                        <tr className="table-row-body" key={curso.id}>
                          <td className="table-body">{curso.id}</td>
                          <td className="table-body">{curso.name}</td>
                          <td className="table-body table-actions flex gap-2">
                            <Link
                              href={`/painel/cursos/${curso.id}`}
                              className="btn-primary flex items-center gap-2"
                              aria-label={`Visualizar curso ${curso.name}`}
                            >
                              <LuEye /> Visualizar
                            </Link>

                            <Link
                              href={`/painel/cursos/${curso.id}/edit`}
                              className="btn-warning flex items-center gap-2"
                              aria-label={`Editar curso ${curso.name}`}
                            >
                              <LuSquarePen /> Editar
                            </Link>

                            <DeleteButton
                              id={String(curso.id)}
                              route={`/cursos`}
                              onSuccess={handleSuccess}
                              setError={setError}
                              setSuccess={setSuccess}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4">
                          Nenhum curso encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Paginação */}
            {!loading && !error && cursos.length > 0 && (
              <Pagination
                currentPage={currentPage}
                lastPage={lastPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
