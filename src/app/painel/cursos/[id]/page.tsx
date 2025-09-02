"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import instance from "@/services/api";
import { AxiosError } from "axios";
import Link from "next/link";
import Menu from "@/components/Painel/Menu";
//Importar o Hooks responsável pela proteção de rotas
import { ProtectedRoute } from "@/components/ProtectedRoute";

type Curso = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function CursoDetails() {
  //Usado useParams para acessar o parametro 'id' da URL
  const { id } = useParams();

  // Estado para amazenar o curso
  const [curso, setCurso] = useState<Curso | null>(null);

  // Controle de carregamento
  const [loading, setLoading] = useState<boolean>(true);

  // Controle de erro
  const [error, setError] = useState<string | null>(null);

  // busar o registro pelo id na API
  const fetchCursoDetails = async (id: string) => {
    try {
      setLoading(true);

      const response = await instance.get(`/cursos/${id}`);

      // Se a API retornar erro no formato { error: "..."}
      if (response.data.error) {
        setError(response.data.error);
        setCurso(null);
      } else {
        setCurso(response.data); // já deve ser um objeto de curso
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
            "Erro inesperado ao carregar curso, por favor tente novamente."
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

  // Hook para carregar os dados do curso do 'id'
  useEffect(() => {
    if (id) {
      //Garantir que o id seja um string
      const cursoId = Array.isArray(id) ? id[0] : id;

      // Busca os detalhes do curso
      fetchCursoDetails(cursoId);
    }
  }, [id]);

  return (
    <ProtectedRoute>
      <div>
        <Menu /> <br />
        <h1>Detalhes do Curso</h1>
        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && curso && (
          <div>
            <p>Id: {curso.id}</p>
            <p>Nome: {curso.name}</p>
            <p>Created At: {new Date(curso.created_at).toLocaleString()}</p>
            <p>Updated At: {new Date(curso.updated_at).toLocaleString()}</p>
          </div>
        )}
        <Link href="/cursos/list">Voltar</Link>
      </div>
    </ProtectedRoute>
  );
}
