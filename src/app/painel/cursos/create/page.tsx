"use client";

// Hooks do React
import { useState } from "react";

// Hook principal para formularios
import { useForm } from "react-hook-form";

// Validador do react-hook-form com Yup
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Axios para tratar erros de requisição
import { AxiosError } from "axios";

// Router do Next para navegação programática
import { useRouter } from "next/navigation";

// Componentes auxiliares
import Link from "next/link";
import instance from "@/services/api"; // sua instância axios configurada

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

export default function CreateCurso() {
  // Controle de carregamento
  const [loading, setLoading] = useState<boolean>(false);

  // Controle de erro
  const [error, setError] = useState<string | null>(null);

  // Controle de sucesso
  const [success, setSuccess] = useState<string | null>(null);

  // Hook do Next.js para navegação
  const router = useRouter();

  // Configuração do formulário com as validações
  const {
    register, // registra os campos
    handleSubmit, // envia os dados do formulário
    formState: { errors }, // captura erros de validação
    reset, // reseta o formulário após sucesso
  } = useForm({
    resolver: yupResolver(schema), // usa o schema do Yup como validador
  });

  // Função padrão de cadastro (Continuar cadastrando)
  const onsubmit = async (data: { name: string }) => {
    // Controle de carregamento
    setLoading(true);
    // Controle de erro
    setError(null);
    // Controle de sucesso
    setSuccess(null);

    try {
      const response = await instance.post("/cursos", data);

      // Mensagem de sucesso
      setSuccess(response.data.message || "Curso cadastrado com sucesso!");
      reset(); // limpa formulário
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data;
        setError(
          data.message || data.error || "Erro inesperado ao cadastrar curso."
        );
      } else {
        setError("Erro de conexão com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Função de cadastro e redirecionamento (Cadastrar e voltar)
  const handleSubmitAndRedirect = handleSubmit(async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Envia os dados para API
      const response = await instance.post("/cursos", data);

      setSuccess(response.data.message || "Curso cadastrado com sucesso!");
      reset(); // limpa formulário

      // Redireciona para lista de cursos
      router.push("/painel/cursos/list");
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data;
        setError(
          data.message || data.error || "Erro inesperado ao cadastrar curso."
        );
      } else {
        setError("Erro de conexão com o servidor, tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  });

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
            <form onSubmit={handleSubmit(onsubmit)}>
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
                  onClick={handleSubmitAndRedirect}
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
