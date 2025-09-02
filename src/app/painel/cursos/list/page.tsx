"use client";

import { useState, useEffect } from "react";
import instance from "@/services/api";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import Menu from "@/components/Painel/Menu";
import Pagination from "@/components/Pagination";
import DeleteButton from "@/components/DeleteButton";

//Importar o Hooks responsável pela proteção de rotas
import { ProtectedRoute } from "@/components/ProtectedRoute";

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

  // Função para buscar cursos da API
  const fetchCursos = async (page: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null); // Limpa mensagens antigas ao refetch

    try {
      const response = await instance.get(`/cursos?page=${page}`);
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

  // Função chamada quando o DeleteButton executa sucesso
  const handleSuccess = () => {
    setSuccess("Curso deletado com sucesso!"); // Define mensagem de sucesso
    fetchCursos(currentPage);
  };

  useEffect(() => {
    fetchCursos(pageFromUrl);
  }, [pageFromUrl]);

  const handlePageChange = (page: number) => {
    router.push(`?page=${page}`);
  };

  return (
    <ProtectedRoute>
      <div>
        <Menu />
        <br />
        <Link href="/cursos/create">Novo Curso</Link>
        <h1>Lista de Cursos</h1>
        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}{" "}
        {/* Mensagem de sucesso */}
        {!loading && !error && (
          <>
            <table border={1} cellPadding={8} cellSpacing={0}>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Nome</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cursos.length > 0 ? (
                  cursos.map((curso) => (
                    <tr key={curso.id}>
                      <td>{curso.id}</td>
                      <td>{curso.name}</td>
                      <td>
                        <Link href={`/cursos/${curso.id}`}>Visualizar</Link> -{" "}
                        <Link href={`/cursos/${curso.id}/edit`}>Editar</Link> -{" "}
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
                    <td colSpan={3}>Nenhum curso encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
