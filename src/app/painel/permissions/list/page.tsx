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

type Permission = {
  id: number;
  title: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function PermissionsList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(pageFromUrl);
  const [lastPage, setLastPage] = useState<number>(1);

  const [openId, setOpenId] = useState<number | null>(null);

  // Buscar permissions da API
  const fetchPermissions = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await instance.get(
        `/permissions?page=${page}&search=${encodeURIComponent(search)}`
      );
      setPermissions(response.data.data.data || []);
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
    fetchPermissions(currentPage);
  };

  useEffect(() => {
    fetchPermissions(pageFromUrl);
  }, [pageFromUrl]);

  const handlePageChange = (page: number) => {
    setError(null);
    router.push(`?page=${page}`);
  };

  const handleSearch = () => {
    setError(null);
    fetchPermissions(1);
  };

  return (
    <Layout>
      <main className="main-content">
        {/* Header */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Permissões</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <span>Permissões</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header flex justify-between items-center">
            <h3 className="content-box-title">Permissões</h3>
            <div className="content-box-btn">
              <Link
                href="/painel/permissions/create"
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

            <div className="table-container mt-6 overflow-x-auto">
              {!loading && !error && (
                <table className="table min-w-full">
                  <caption className="sr-only">Lista de Permissões</caption>
                  <thead>
                    <tr className="table-row-header">
                      <th className="table-header">ID</th>
                      <th className="table-header">Título</th>
                      <th className="table-header">Nome</th>
                      {/* Ocultar em telas menores */}
                      <th className="table-header center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="table-zebra-light">
                    {permissions.length > 0 ? (
                      permissions.map((permission) => (
                        <tr className="table-row-body" key={permission.id}>
                          <td className="table-body">{permission.id}</td>
                          <td className="table-body">{permission.title}</td>
                          <td className="table-body">{permission.name}</td>
                          {/* Ocultar em telas menores */}
                          <td className="table-body ">
                            <ActionButtons
                              id={permission.id}
                              basePath="/painel/permissions"
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
                        <td colSpan={5} className="text-center py-4">
                          Nenhuma permissão encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && !error && permissions.length > 0 && (
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
