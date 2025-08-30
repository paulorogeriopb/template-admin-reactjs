"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import instance from "@/services/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { AxiosError } from "axios";

// Schema de validação com Yup
const schema = yup.object().shape({
  name: yup.string().required("O nome é obrigatório."),
  email: yup
    .string()
    .email("E-mail inválido.")
    .required("O e-mail é obrigatório."),
  password: yup
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .required("A senha é obrigatória."),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas devem ser iguais")
    .required("Confirmação de senha obrigatória"),
});

type FormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await instance.post("/auth/register", data);
      setSuccess(response.data.message || "Cadastro realizado com sucesso!");

      // Redireciona para login após 2 segundos
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        setError(
          data?.message ||
            data?.error ||
            "Erro inesperado ao cadastrar usuário."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Registrar</h1>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Nome</label>
          <input type="text" {...register("name")} />
          {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
        </div>

        <div>
          <label>E-mail</label>
          <input type="email" {...register("email")} />
          {errors.email && (
            <p style={{ color: "red" }}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label>Senha</label>
          <input type="password" {...register("password")} />
          {errors.password && (
            <p style={{ color: "red" }}>{errors.password.message}</p>
          )}
        </div>

        <div>
          <label>Confirmar senha</label>
          <input type="password" {...register("password_confirmation")} />
          {errors.password_confirmation && (
            <p style={{ color: "red" }}>
              {errors.password_confirmation.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <p>
        Já tem uma conta? <Link href="/auth/login">Entrar</Link>
      </p>
    </div>
  );
}
