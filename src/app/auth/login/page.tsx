"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { AxiosError } from "axios";
import instance from "@/services/api";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import AlertMessage from "@/components/AlertMessage";

// Tempo de carregamento
const MIN_LOADING_TIME = 0; // tempo mínimo em ms

// Schema de validação
const schema = yup.object().shape({
  email: yup
    .string()
    .email("E-mail inválido")
    .required("O e-mail é obrigatório"),
  password: yup
    .string()
    .required("A senha é obrigatória")
    .min(8, "Mínimo 8 caracteres"),
});

type FormData = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const emailValue = watch("email");

  // Checa token ao montar a página
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      instance
        .get("/auth/me")
        .then(() => router.push(redirectTo))
        .catch(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, [router, redirectTo]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setEmailNotVerified(false);

    const start = Date.now(); // marca o início do loading

    try {
      const response = await instance.post("/auth/login", data);
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.token);

      const elapsed = Date.now() - start;
      const remaining = MIN_LOADING_TIME - elapsed;

      if (remaining > 0) {
        setTimeout(() => router.push(redirectTo), remaining);
      } else {
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      const elapsed = Date.now() - start;
      const remaining = MIN_LOADING_TIME - elapsed;

      if (err instanceof AxiosError && err.response) {
        const apiData = err.response.data;

        if (
          apiData.message ===
          "Você precisa validar o seu e-mail antes de acessar o sistema. Verifique seu e-mail e clique no link de verificação."
        ) {
          setEmailNotVerified(true);
        }

        setError(apiData.message || apiData.error || "Erro inesperado");
      } else {
        setError("Erro de conexão com o servidor, tente novamente mais tarde.");
      }

      // garante que o loading fique visível pelo tempo mínimo
      if (remaining > 0) {
        setTimeout(() => setLoading(false), remaining);
      } else {
        setLoading(false);
      }
    }
  };

  const handleResendEmail = async () => {
    if (!emailValue) {
      setError("Informe seu e-mail para reenviar a verificação.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await instance.post("/auth/resend-verification-email", {
        email: emailValue,
      });
      console.log("Resend email response:", res.data);
      setSuccess(
        res.data.message || "E-mail de verificação enviado com sucesso!"
      );
      setEmailNotVerified(false);
    } catch (err: unknown) {
      console.log("Erro ao reenviar e-mail:", err);
      setError(
        err instanceof AxiosError && err.response
          ? err.response.data.message || "Erro ao reenviar e-mail."
          : "Erro ao reenviar e-mail."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) return <p>Carregando...</p>;

  return (
    <div className="bg-login">
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

        <h1 className="title-logo">Nimbus</h1>
        <p className="subtitle-login">Área Restrita</p>
        {loading && LoadingSpinner()}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <AlertMessage type="error" message={error} />

          {emailNotVerified && (
            <button
              type="button"
              onClick={handleResendEmail}
              className="mt-2 px-4 py-2 bg-yellow-200 text-yellow-900 font-medium rounded-lg shadow-sm 
               hover:bg-yellow-300 hover:text-yellow-950 transition-colors duration-200 
               cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Reenviar e-mail
            </button>
          )}
          <AlertMessage type="success" message={success} />
          {success && <p className="alert-success">{success}</p>}

          <div className="form-group-login">
            <label htmlFor="email" className="form-label-login">
              E-mail
            </label>
            <input
              type="text"
              placeholder="E-mail"
              {...register("email")}
              className="form-input-login"
            />
            {errors.email && (
              <p className="text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="relative form-group-login">
            <label htmlFor="password" className="form-label-login">
              Senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              {...register("password")}
              className="form-input-login"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="showPassword"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="btn-group-login">
            <button
              type="submit"
              disabled={!isValid || loading}
              className="btn-login"
            >
              {loading ? "Acessando..." : "Acessar"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <Link href="/auth/forgot-password" className="link-login">
            Esqueci minha senha
          </Link>{" "}
          <span className="text-gray-400 ml-3 mr-3">/</span>
          <Link href="/auth/register" className="link-login">
            Criar nova conta!
          </Link>
        </div>
      </div>
    </div>
  );
}
