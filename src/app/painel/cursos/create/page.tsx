"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
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

export default function CreateCurso() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const currentTheme: "dark" | "light" =
    resolvedTheme === "dark" ? "dark" : "light";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Continuar cadastrando (alert de sucesso incluído)
  const onsubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      await instance.post("/cursos", data);
      reset(); // limpa o formulário

      // Mostra o alert de sucesso
      SwalAlert({
        type: "success",
        title: "Sucesso",
        text: "Curso cadastrado com sucesso!",
        theme: currentTheme,
      });
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data;
        SwalAlert({
          type: "error",
          title: "Erro",
          text:
            data.message || data.error || "Erro inesperado ao cadastrar curso.",
          theme: currentTheme,
        });
      } else {
        SwalAlert({
          type: "error",
          title: "Erro",
          text: "Erro de conexão com o servidor.",
          theme: currentTheme,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Salvar e voltar (com alerta de sucesso)
  const handleSubmitAndRedirect = handleSubmit(async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      await instance.post("/cursos", data);
      reset();

      SwalAlert({
        type: "success",
        title: "Sucesso",
        text: "Curso cadastrado com sucesso!",
        theme: currentTheme,
        confirmCallback: () => router.push("/painel/cursos/list"),
      });
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data;
        SwalAlert({
          type: "error",
          title: "Erro",
          text:
            data.message || data.error || "Erro inesperado ao cadastrar curso.",
          theme: currentTheme,
        });
      } else {
        SwalAlert({
          type: "error",
          title: "Erro",
          text: "Erro de conexão com o servidor, tente novamente mais tarde.",
          theme: currentTheme,
        });
      }
    } finally {
      setLoading(false);
    }
  });

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
              <span>Novo</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header">
            <h3 className="content-box-title">Novo</h3>
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

            <form onSubmit={handleSubmit(onsubmit)}>
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
                  onClick={handleSubmitAndRedirect}
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
                    "Cadastrando..."
                  ) : (
                    <>
                      <LuPlus className="text-white" />
                      Continuar Cadastrando
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
