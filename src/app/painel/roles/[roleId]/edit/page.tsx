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
    .required("O nome do perfil é obrigatório.")
    .min(3, "O nome do perfil deve conter pelo menos 3 letras."),
});

export default function EditRole() {
  const { roleId: id } = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const currentTheme: "dark" | "light" =
    resolvedTheme === "dark" ? "dark" : "light";

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<{ name: string }>({
    resolver: yupResolver(schema),
  });

  // Buscar detalhes do perfil
  useEffect(() => {
    const fetchRoleDetails = async () => {
      try {
        setLoading(true);
        const response = await instance.get(`/roles/${id}`);
        setValue("name", response.data.data.name);
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response) {
          SwalAlert({
            type: "error",
            title: "Erro",
            text:
              err.response.data.message ||
              err.response.data.error ||
              "Erro ao carregar o perfil.",
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

    if (id) fetchRoleDetails();
  }, [id, setValue, currentTheme]);

  // Salvar (com opção de redirecionar)
  const onSubmit = async (
    data: { name: string },
    redirectAfterSave = false
  ) => {
    setLoading(true);
    try {
      const response = await instance.put(`/roles/${id}`, data);

      SwalAlert({
        type: "success",
        title: "Sucesso!",
        text: response.data.message || "Perfil atualizado com sucesso!",
        theme: currentTheme,
        confirmCallback: () => {
          if (redirectAfterSave) router.push("/painel/roles/list");
        },
      });

      // Limpa o formulário apenas se não for redirecionar
      if (!redirectAfterSave) reset({ name: data.name });
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        SwalAlert({
          type: "error",
          title: "Erro",
          text:
            err.response.data.message ||
            err.response.data.error ||
            "Erro ao atualizar perfil.",
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

  return (
    <Layout>
      <main className="main-content">
        {/* Cabeçalho */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Perfil</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <Link href="/painel/roles/list" className="breadcrumb-link">
                Perfil
              </Link>
              <span> / </span>
              <span>Editar</span>
            </nav>
          </div>
        </div>

        <div className="content-box">
          <div className="content-box-header">
            <h3 className="content-box-title">Editar Perfil</h3>
            <div className="content-box-btn">
              <Link
                href="/painel/roles/list"
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
                  Perfil
                </label>
                <input
                  type="text"
                  placeholder="Nome do Perfil"
                  {...register("name")}
                  className="form-input"
                />
                {errors.name && (
                  <p style={{ color: "red" }}>{errors.name.message}</p>
                )}
              </div>

              <div className="content-box-footer-btn">
                {/* Salvar e voltar */}
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
                      <LuSave className="text-white" /> Salvar
                    </>
                  )}
                </button>

                {/* Continuar Editando */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-default flex items-center gap-2"
                >
                  {loading ? (
                    "Editando..."
                  ) : (
                    <>
                      <LuPlus className="text-white" /> Continuar Editando
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
