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

// Schema de validação para Permissões
const schema = yup.object().shape({
  title: yup
    .string()
    .required("O título da permissão é obrigatório.")
    .min(3, "O título deve ter pelo menos 3 caracteres."),
  name: yup
    .string()
    .required("O nome da permissão é obrigatório.")
    .min(3, "O nome deve ter pelo menos 3 caracteres."),
});

type FormData = { title: string; name: string };

export default function EditPermission() {
  const { id } = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const currentTheme: "dark" | "light" =
    resolvedTheme === "dark" ? "dark" : "light";

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Buscar detalhes da permissão
  useEffect(() => {
    const fetchPermission = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await instance.get(`/permissions/${id}`);
        const permission = response.data.data || response.data; // adapta conforme a API
        reset({
          title: response.data.data.title,
          name: response.data.data.name,
        });
      } catch (err: unknown) {
        SwalAlert({
          type: "error",
          title: "Erro",
          text:
            err instanceof AxiosError
              ? err.response?.data?.message ||
                err.response?.data?.error ||
                "Erro ao carregar a permissão."
              : err instanceof Error
              ? err.message
              : "Erro desconhecido.",
          theme: currentTheme,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPermission();
  }, [id, reset, currentTheme]);

  const onSubmit = async (data: FormData, redirectAfterSave: boolean) => {
    setLoading(true);

    try {
      await instance.put(`/permissions/${id}`, data);

      SwalAlert({
        type: "success",
        title: "Sucesso",
        text: "Permissão atualizada com sucesso!",
        theme: currentTheme,
        confirmCallback: redirectAfterSave
          ? () => router.push("/painel/permissions/list")
          : undefined,
      });
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data;
        SwalAlert({
          type: "error",
          title: "Erro",
          text:
            data.message ||
            (data.errors?.title?.[0] ? data.errors.title[0] : undefined) ||
            "Erro inesperado ao atualizar permissão.",
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
  };

  return (
    <Layout>
      <main className="main-content">
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Permissão</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <Link href="/painel/permissions/list" className="breadcrumb-link">
                Permissões
              </Link>
              <span> / </span>
              <span>Editar</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header">
            <h3 className="content-box-title">Editar Permissão</h3>
            <div className="content-box-btn">
              <Link
                href={`/painel/permissions/list`}
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
                <label htmlFor="title" className="form-label">
                  Título da Permissão
                </label>
                <input
                  type="text"
                  placeholder="Título da Permissão"
                  {...register("title")}
                  className="form-input"
                />
                {errors.title && (
                  <p style={{ color: "red" }}>{errors.title.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Nome da Permissão
                </label>
                <input
                  type="text"
                  placeholder="Nome da Permissão ex: edit-user"
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
