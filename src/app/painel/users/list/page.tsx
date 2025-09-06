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

type User = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function UsersList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(pageFromUrl);
  const [lastPage, setLastPage] = useState<number>(1);

  // Função para buscar Users da API
  const fetchUsers = async (page: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null); // Limpa mensagens antigas ao refetch

    try {
      const response = await instance.get(`/users?page=${page}`);
      setUsers(response.data.data || []);
      setCurrentPage(response.data.current_page || page);
      setLastPage(response.data.last_page || 1);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        setError(
          data?.message ||
            data?.error ||
            "Erro inesperado ao carregar Usuários."
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

  // Função chamada quando o DeleteButton executa sucesso
  const handleSuccess = () => {
    setSuccess("Usuário deletado com sucesso!");
    fetchUsers(currentPage);
  };

  // Efeito para buscar usuários ao carregar ou ao mudar a página
  useEffect(() => {
    fetchUsers(pageFromUrl);
  }, [pageFromUrl]);

  const handlePageChange = (page: number) => {
    setError(null);
    setSuccess(null);
    router.push(`?page=${page}`);
  };

  return (
    <Layout>
      <main className="main-content">
        {/* Título e Trilha de Navegação */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Usuários</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <span>Usuários</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header flex justify-between items-center">
            <h3 className="content-box-title">Usuários</h3>
            <div className="content-box-btn">
              <Link
                href="/painel/users/create"
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
                  <caption className="sr-only">Lista de Usuários</caption>
                  <thead>
                    <tr className="table-row-header">
                      <th className="table-header">ID</th>
                      <th className="table-header">Nome</th>
                      <th className="table-header center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr className="table-row-body" key={user.id}>
                          <td className="table-body">{user.id}</td>
                          <td className="table-body">{user.name}</td>
                          <td className="table-body table-actions flex gap-2">
                            <Link
                              href={`/painel/users/${user.id}`}
                              className="btn-primary flex items-center gap-2"
                              aria-label={`Visualizar usuário ${user.name}`}
                            >
                              <LuEye /> Visualizar
                            </Link>

                            <Link
                              href={`/painel/users/${user.id}/edit`}
                              className="btn-warning flex items-center gap-2"
                              aria-label={`Editar usuário ${user.name}`}
                            >
                              <LuSquarePen /> Editar
                            </Link>

                            <DeleteButton
                              id={String(user.id)}
                              route={`/users`}
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
                          Nenhum Usuário encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Paginação */}
            {!loading && !error && users.length > 0 && (
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
