"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Painel/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import AlertMessageDismissible from "@/components/AlertMessageDismissible";
import instance from "@/services/api";
import { LuPlus, LuSave, LuList } from "react-icons/lu";

// Schema de validação
const schema = yup.object().shape({
  name: yup.string().required("O nome é obrigatório").min(3),
  email: yup.string().required("O email é obrigatório").email("Email inválido"),
  password: yup.string().required("Senha obrigatória").min(6),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não conferem")
    .required("Confirme a senha"),
});

export default function CreateUser() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rolesSelected, setRolesSelected] = useState<number[]>([]);
  const [userStatusId, setUserStatusId] = useState("1");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRoleChange = (roleId: number) => {
    if (rolesSelected.includes(roleId)) {
      setRolesSelected(rolesSelected.filter((r) => r !== roleId));
    } else {
      setRolesSelected([...rolesSelected, roleId]);
    }
  };

  // Função padrão de cadastro (Continuar cadastrando)
  const onsubmit = async (data: { name: string }) => {
    // Controle de carregamento
    setLoading(true);
    // Controle de erro
    setError(null);
    // Controle de sucesso
    setSuccess(null);

    try {
      await instance.post("/users", {
        ...data,
        roles: rolesSelected,
        user_status_id: userStatusId,
      });
      setSuccess("Usuário criado com sucesso! Você pode cadastrar outro.");
      reset();
      setRolesSelected([]);
      setUserStatusId("1");
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data;
        setError(
          data.message || data.error || "Erro inesperado ao cadastrar usuário."
        );
      } else {
        setError("Erro de conexão com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Função: Salvar e redirecionar
  const handleSubmitAndRedirect = handleSubmit(async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await instance.post("/users", {
        ...data,
        roles: rolesSelected,
        user_status_id: userStatusId,
      });
      setSuccess("Usuário criado com sucesso!");
      reset();
      setRolesSelected([]);
      setUserStatusId("1");

      router.push("/painel/users");
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data;
        setError(
          data.message || data.error || "Erro inesperado ao cadastrar usuário."
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
        {/* Título e breadcrumb */}
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Usuário</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <Link href="/painel/users" className="breadcrumb-link">
                Usuário
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
                href={`/painel/users`}
                className="btn-info flex items-center gap-2"
              >
                <LuList /> Visualizar
              </Link>
            </div>
          </div>

          <div className="content-box-body">
            {loading && <LoadingSpinner />}
            <AlertMessageDismissible type="error" message={error} />
            {success && (
              <AlertMessageDismissible type="success" message={success} />
            )}

            <form onSubmit={handleSubmit(onsubmit)}>
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="Nome"
                  {...register("name")}
                  className="form-input"
                />
                {errors.name && (
                  <p style={{ color: "red" }}>{errors.name.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  className="form-input"
                />
                {errors.email && (
                  <p style={{ color: "red" }}>{errors.email.message}</p>
                )}
              </div>

              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label htmlFor="password" className="form-label">
                    Senha
                  </label>
                  <input
                    type="password"
                    placeholder="Senha"
                    {...register("password")}
                    className="form-input"
                  />
                  {errors.password && (
                    <p style={{ color: "red" }}>{errors.password.message}</p>
                  )}
                </div>

                <div className="flex-1">
                  <label htmlFor="password_confirmation" className="form-label">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    placeholder="Confirme a senha"
                    {...register("password_confirmation")}
                    className="form-input"
                  />
                  {errors.password_confirmation && (
                    <p style={{ color: "red" }}>
                      {errors.password_confirmation.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label">Status</label>
                <select
                  value={userStatusId}
                  onChange={(e) => setUserStatusId(e.target.value)}
                  className="form-input"
                >
                  <option value="1">Ativo</option>
                  <option value="2">Inativo</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Roles</label>
                <div className="flex gap-4">
                  <label>
                    <input
                      type="checkbox"
                      checked={rolesSelected.includes(1)}
                      onChange={() => handleRoleChange(1)}
                      className="mr-1"
                    />{" "}
                    Admin
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={rolesSelected.includes(2)}
                      onChange={() => handleRoleChange(2)}
                      className="mr-1"
                    />{" "}
                    Editor
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={rolesSelected.includes(3)}
                      onChange={() => handleRoleChange(3)}
                      className="mr-1"
                    />{" "}
                    User
                  </label>
                </div>
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
                      <LuSave className="text-white" /> Salvar
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
                      <LuPlus className="text-white" /> Salvar e Continuar
                      Cadastrando
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
