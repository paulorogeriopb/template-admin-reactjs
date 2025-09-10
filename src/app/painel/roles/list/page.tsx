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

type Role = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function RolesList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(pageFromUrl);
  const [lastPage, setLastPage] = useState<number>(1);

  const [openId, setOpenId] = useState<number | null>(null);

  // Buscar roles da API
  const fetchRoles = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await instance.get(
        `/roles?page=${page}&search=${encodeURIComponent(search)}`
      );
      setRoles(response.data.data.data || []);
      setCurrentPage(response.data.current_page || page);
      setLastPage(response.data.last_page || 1);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        setError(
          data?.message || data?.error || "Erro inesperado ao carregar Perfis."
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

  const handleSuccess = () => {
    fetchRoles(currentPage);
  };

  useEffect(() => {
    fetchRoles(pageFromUrl);
  }, [pageFromUrl]);

  const handlePageChange = (page: number) => {
    setError(null);
    router.push(`?page=${page}`);
  };

  const handleSearch = () => {
    setError(null);
    fetchRoles(1);
  };

  return (
    <Layout>
      <main className="main-content">
        {/* Header */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Perfis</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <span>Perfis</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header flex justify-between items-center">
            <h3 className="content-box-title">Perfis</h3>
            <div className="content-box-btn">
              <Link
                href="/painel/roles/create"
                className="btn-success flex items-center gap-1"
              >
                <LuCirclePlus />
                <span>Novo</span>
              </Link>
            </div>
          </div>

          <div className="content-box-body">
            {/* Campo de busca */}
            <div className="mb-4 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Pesquisar perfis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="form-input"
              />
              <button
                onClick={handleSearch}
                className="btn-default flex items-center gap-2 py-2 px-4"
              >
                <LuSearch size={20} />
                Buscar
              </button>
            </div>

            {loading && <LoadingSpinner />}
            <AlertMessageDismissible type="error" message={error} />

            <div className="table-container mt-6">
              {!loading && !error && (
                <table className="table">
                  <caption className="sr-only">Lista de Perfis</caption>
                  <thead>
                    <tr className="table-row-header">
                      <th className="table-header">ID</th>
                      <th className="table-header">Nome</th>
                      <th className="table-header center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <tr className="table-row-body" key={role.id}>
                          <td className="table-body">{role.id}</td>
                          <td className="table-body">{role.name}</td>
                          <td className="table-body table-actions">
                            <Link
                              href={`/painel/roles/${role.id}/permissions`}
                              className="inline-flex items-center px-3 py-1 text-xs rounded btn-info"
                            >
                              Permissões
                            </Link>
                            <ActionButtons
                              id={role.id}
                              basePath="/painel/roles"
                              entityName="perfil"
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
                          Nenhum Perfil encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && !error && roles.length > 0 && (
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
