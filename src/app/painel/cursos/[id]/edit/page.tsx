"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import instance from "@/services/api";
import Layout from "@/components/Painel/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LuPlus, LuSave, LuList } from "react-icons/lu";
import AlertMessageDismissible from "@/components/AlertMessageDismissible";

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
      if (redirectAfterSave) router.push("/painel/cursos/list");
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
    <Layout>
      <main className="main-content">
        {/* Título e Trilha de Navegação */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Curso</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <Link href="/painel/cursos/list" className="breadcrumb-link">
                Curso
              </Link>
              <span> / </span>
              <span>Editar</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header">
            <h3 className="content-box-title">Editar</h3>
            <div className="content-box-btn">
              <Link
                href={`/painel/cursos/list`}
                className="btn-info  flex items-center gap-2"
              >
                <LuList /> Visualizar
              </Link>
            </div>
          </div>

          <div className="content-box-body">
            {loading && LoadingSpinner()}
            <AlertMessageDismissible type="error" message={error} />

            {success && (
              <AlertMessageDismissible type="success" message={success} />
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Curso
                </label>
                <input
                  type="text"
                  placeholder="Nome do Curso"
                  {...register("name")} // integração com react-hook-form
                  className="form-input"
                />
                {/* Mensagem de erro do Yup */}
                {errors.name && (
                  <p style={{ color: "red" }}>{errors.name.message}</p>
                )}
              </div>

              <div className="content-box-footer-btn">
                {/* Botão 1: Cadastrar e voltar */}
                <button
                  type="button"
                  onClick={handleSubmit((data) => onSubmit(data, true))}
                  disabled={loading}
                  className="btn-success flex items-center space-x-1 "
                  style={{ marginLeft: "10px" }}
                >
                  {loading ? (
                    "Salvando..."
                  ) : (
                    <>
                      <LuSave className="text-white" />
                      Salvar
                    </>
                  )}
                </button>
                {/* Botão 2: Cadastrar e continuar */}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-default flex items-center gap-2"
                >
                  {loading ? (
                    "Editando..."
                  ) : (
                    <>
                      <LuPlus className="text-white" />
                      Continuar Editando
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </Layout>
  );
}
