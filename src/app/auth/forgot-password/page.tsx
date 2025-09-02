"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import instance from "@/services/api";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("E-mail inválido")
    .required("O e-mail é obrigatório"),
});

type FormData = {
  email: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await instance.post("/auth/forgot-password-code", data);
      setSuccess(
        response.data.message ||
          "Código de redefinição enviado para seu e-mail!"
      );

      // Redireciona para reset-password passando o email como query param
      setTimeout(() => {
        router.push(
          `/auth/reset-password?email=${encodeURIComponent(data.email)}`
        );
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        const data = err.response.data;
        setError(data.message || data.error || "Erro ao enviar o código.");
      } else {
        setError("Erro de conexão com o servidor, tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-login">
      {loading && <LoadingSpinner />}
      <div className="card-login">
        <div className="logo-wrapper-login">
          <Link href="/">
            <Image
              src="/images/logo2.png"
              alt="Logo"
              width={80}
              height={80}
              className="rounded"
            />
          </Link>
        </div>

        <h1 className="title-login">Esqueci minha senha</h1>

        <p className="subtitle-login">
          Insira seu e-mail para receber o código de redefinição
        </p>

        {success ? (
          <div className="text-center mt-6">
            <p className="alert-success">{success}</p>
            <p>Redirecionando para redefinir a senha...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <p className="alert-danger">{error}</p>}

            <div className="form-group-login">
              <label htmlFor="email" className="form-label-login">
                E-mail
              </label>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                {...register("email")}
                className="form-input-login"
              />
              {errors.email && (
                <p className="text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || loading}
              className="btn-login"
            >
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-4 text-center">
            <Link href="/auth/login" className="link-login">
              Voltar ao login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
