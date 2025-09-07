"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";

import instance from "@/services/api";
import Layout from "@/components/Painel/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LuPlus, LuSave, LuList } from "react-icons/lu";
import { SwalAlert } from "@/components/SwalAlert";

// Schema de validação
const schema = yup.object().shape({
  name: yup
    .string()
    .required("O nome do curso é obrigatório.")
    .min(3, "O nome do curso deve conter pelo menos 3 letras."),
});

type FormData = { name: string };

export default function EditCurso() {
  const { id } = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const currentTheme: "dark" | "light" =
    resolvedTheme === "dark" ? "dark" : "light";

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Buscar detalhes do curso
  useEffect(() => {
    const fetchCurso = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await instance.get(`/cursos/${id}`);
        setValue("name", response.data.name);
      } catch (err: unknown) {
        SwalAlert({
          type: "error",
          title: "Erro",
          text:
            err instanceof AxiosError
              ? err.response?.data?.message ||
                err.response?.data?.error ||
                "Erro ao carregar o curso."
              : err instanceof Error
              ? err.message
              : "Erro desconhecido.",
          theme: currentTheme,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCurso();
  }, [id, setValue, currentTheme]);

  const onSubmit = async (data: FormData, redirectAfterSave: boolean) => {
    setLoading(true);

    try {
      await instance.put(`/cursos/${id}`, data);

      SwalAlert({
        type: "success",
        title: "Sucesso",
        text: "Curso atualizado com sucesso!",
        theme: currentTheme,
        confirmCallback: redirectAfterSave
          ? () => router.push("/painel/cursos/list")
          : undefined,
      });
    } catch (err: unknown) {
      SwalAlert({
        type: "error",
        title: "Erro",
        text:
          err instanceof AxiosError && err.response
            ? err.response.data.message ||
              err.response.data.error ||
              "Erro inesperado ao atualizar curso."
            : "Erro de conexão com o servidor, tente novamente mais tarde.",
        theme: currentTheme,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="main-content">
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
                className="btn-info flex items-center gap-2"
              >
                <LuList /> Visualizar
              </Link>
            </div>
          </div>

          <div className="content-box-body">
            {loading && <LoadingSpinner />}

            <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Curso
                </label>
                <input
                  type="text"
                  placeholder="Nome do Curso"
                  {...register("name")}
                  className="form-input"
                />
                {errors.name && (
                  <p style={{ color: "red" }}>{errors.name.message}</p>
                )}
              </div>

              <div className="content-box-footer-btn">
                <button
                  type="button"
                  onClick={handleSubmit((data) => onSubmit(data, true))}
                  disabled={loading}
                  className="btn-success flex items-center space-x-1"
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
