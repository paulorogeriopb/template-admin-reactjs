"use client";

import { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import instance from "@/services/api";

// Schema de validação com Yup
const schema = yup.object().shape({
  email: yup
    .string()
    .email("E-mail inválido.")
    .required("O E-mail é obrigatório."),
  password: yup
    .string()
    .required("A senha é obrigatória.")
    .min(8, "A senha deve conter pelo menos 8 caracteres."),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pegando parâmetro da URL de forma segura
  const redirectTo = searchParams.get("next") || "/dashboard";

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Configuração do formulário
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange", // validação em tempo real
  });

  // Função enviar os dados para API validar
  const onsubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await instance.post("/auth/login", data);

      localStorage.setItem("token", response.data.token);

      setSuccess("Login realizado com sucesso!");

      router.push(redirectTo);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data;
        setError(
          data.message || data.error || "Erro inesperado ao realizar login."
        );
      } else {
        setError("Erro de conexão com o servidor, tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit(onsubmit)}>
        <div>
          <label htmlFor="email">E-mail</label>
          <input type="text" placeholder="E-mail" {...register("email")} />
          {errors.email && (
            <p style={{ color: "red" }}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <p style={{ color: "red" }}>{errors.password.message}</p>
          )}
        </div>

        <button type="submit" disabled={!isValid || loading}>
          {loading ? "Acessando..." : "Acessar"}
        </button>
      </form>

      <Link href="/register">Cadastrar</Link>
      <Link href="/forgot">Esqueci minha senha</Link>
    </div>
  );
}
