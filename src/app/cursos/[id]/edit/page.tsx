"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import instance from "@/services/api";
import Menu from "@/componets/Menu";

//Importar o Hooks responsável pela proteção de rotas
import { ProtectedRoute } from "@/componets/ProtectedRoute";

// Schema de validação com Yup
const schema = yup.object().shape({
  name: yup
    .string()
    .required("O nome do curso é obrigatório.")
    .min(3, "O nome do curso deve conter pelo menos 3 letras."),
});

export default function EditCurso() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Configuração do formulário
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{ name: string }>({
    resolver: yupResolver(schema),
  });

  // Buscar detalhes do curso ao carregar
  useEffect(() => {
    const fetchCursoDetails = async () => {
      try {
        setLoading(true);
        const response = await instance.get(`/cursos/${id}`);
        setValue("name", response.data.name); // preenche o formulário
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Erro ao carregar o curso."
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erro desconhecido.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCursoDetails();
  }, [id, setValue]);

  // Função genérica para salvar
  const onSubmit = async (
    data: { name: string },
    redirectAfterSave: boolean
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await instance.put(`/cursos/${id}`, data);
      setSuccess(response.data.message || "Curso atualizado com sucesso!");
      if (redirectAfterSave) router.push("/cursos/list");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Erro inesperado ao atualizar curso."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div>
        <Menu />
        <br />
        <Link href="/cursos/list">Voltar</Link>
        <br />

        <h1>Editar Curso</h1>

        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
          <div>
            <input
              type="text"
              placeholder="Nome do Curso"
              {...register("name")}
            />
            {errors.name && (
              <p style={{ color: "red" }}>{errors.name.message}</p>
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Editando..." : "Continuar Editando"}
            </button>

            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={loading}
              style={{ marginLeft: "10px" }}
            >
              {loading ? "Editando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
