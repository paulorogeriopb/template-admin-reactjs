"use client";

import { useState, useEffect } from "react";
import instance from "@/services/api";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import Pagination from "@/components/Painel/Pagination";
import Layout from "@/components/Painel/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LuCirclePlus, LuSearch } from "react-icons/lu";
import AlertMessageDismissible from "@/components/AlertMessageDismissible";
import ActionButtons from "@/components/Painel/ActionButtonsBasic";

type UserStatus = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function UserStatusList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [userStatuses, setUserStatuses] = useState<UserStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(pageFromUrl);
  const [lastPage, setLastPage] = useState<number>(1);

  const [openId, setOpenId] = useState<number | null>(null);

  // Buscar status de usuários da API
  const fetchUserStatuses = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await instance.get(`/user-status?page=${page}}`);
      setUserStatuses(response.data.data || []);
      setCurrentPage(response.data.current_page || page);
      setLastPage(response.data.last_page || 1);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        setError(
          data?.message || data?.error || "Erro inesperado ao carregar status."
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
    fetchUserStatuses(currentPage);
  };

  useEffect(() => {
    fetchUserStatuses(pageFromUrl);
  }, [pageFromUrl]);

  const handlePageChange = (page: number) => {
    setError(null);
    router.push(`?page=${page}`);
  };

  const handleSearch = () => {
    setError(null);
    fetchUserStatuses(1);
  };

  return (
    <Layout>
      <main className="main-content">
        {/* Header */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Status Usuário</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <span>Status Usuário</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header flex justify-between items-center">
            <h3 className="content-box-title">Status Usuário</h3>
            <div className="content-box-btn">
              <Link
                href="/painel/user-status/create"
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

            {/* Tabela */}
            <div className="table-container mt-6">
              {!loading && !error && (
                <table className="table">
                  <caption className="sr-only">Lista de Status Usuário</caption>
                  <thead>
                    <tr className="table-row-header">
                      <th className="table-header">ID</th>
                      <th className="table-header">Status</th>
                      <th className="table-header center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStatuses.length > 0 ? (
                      userStatuses.map((status) => (
                        <tr className="table-row-body" key={status.id}>
                          <td className="table-body">{status.id}</td>
                          <td className="table-body">{status.name}</td>
                          <td className="table-body table-actions">
                            <ActionButtons
                              id={status.id}
                              basePath="/painel/user-status"
                              entityName="status"
                              onSuccess={handleSuccess}
                              setError={setError}
                              openId={openId}
                              setOpenId={setOpenId}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4">
                          Nenhum Status Usuário encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Paginação */}
            {!loading && !error && userStatuses.length > 0 && (
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
