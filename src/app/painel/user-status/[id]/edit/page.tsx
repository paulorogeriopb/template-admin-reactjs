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
    .required("O nome do status é obrigatório.")
    .min(3, "O nome do status deve conter pelo menos 3 letras."),
});

type FormData = { name: string };

export default function EditUserStatus() {
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

  // Buscar detalhes do status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await instance.get(`/user-status/${id}`);
        setValue("name", response.data.name);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          SwalAlert({
            type: "error",
            title: "Erro",
            text:
              err.response?.data?.message ||
              err.response?.data?.error ||
              "Erro ao carregar o status do usuário.",
            theme: currentTheme,
          });
        } else if (err instanceof Error) {
          SwalAlert({
            type: "error",
            title: "Erro",
            text: err.message,
            theme: currentTheme,
          });
        } else {
          SwalAlert({
            type: "error",
            title: "Erro",
            text: "Erro desconhecido.",
            theme: currentTheme,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [id, setValue, currentTheme]);

  // Função genérica para salvar
  const onSubmit = async (data: FormData, redirectAfterSave: boolean) => {
    setLoading(true);
    try {
      const response = await instance.put(`/user-status/${id}`, data);

      SwalAlert({
        type: "success",
        title: "Sucesso",
        text: response.data.message || "Status atualizado com sucesso!",
        theme: currentTheme,
        confirmCallback: redirectAfterSave
          ? () => router.push("/painel/user-status/list")
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
            data.error ||
            "Erro inesperado ao atualizar status.",
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
            <h2 className="content-title">Status Usuário</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <Link href="/painel/user-status/list" className="breadcrumb-link">
                Status Usuário
              </Link>
              <span> / </span>
              <span>Editar</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header">
            <h3 className="content-box-title">Editar Status</h3>
            <div className="content-box-btn">
              <Link
                href={`/painel/user-status/list`}
                className="btn-info flex items-center gap-2"
              >
                <LuList /> Visualizar
              </Link>
            </div>
          </div>

          <div className="content-box-body">
            {loading && <LoadingSpinner />}

            {/* Formulário */}
            <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Status Usuário
                </label>
                <input
                  type="text"
                  placeholder="Nome do Status"
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
