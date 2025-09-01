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

    try {
      const response = await instance.post("/auth/login", data);
      localStorage.setItem("token", response.data.token);
      router.push(redirectTo);
    } catch (err: unknown) {
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
    } finally {
      setLoading(false);
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
      setSuccess(
        res.data.message || "E-mail de verificação enviado com sucesso!"
      );
      setEmailNotVerified(false);
    } catch (err: unknown) {
      setError(
        err instanceof AxiosError && err.response
          ? err.response.data.message || "Erro ao reenviar e-mail."
          : "Erro ao reenviar e-mail."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) return <p className="text-center mt-20">Carregando...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 ">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl shadow-lg space-y-6">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo2.png"
            alt="Logo"
            width={80}
            height={80}
            className="rounded"
          />
        </div>
        <h1 className="text-3xl font-bold text-white text-center">Nimbus</h1>
        <p className="text-gray-300 text-center mb-6">Área Restrita</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {emailNotVerified && (
            <button
              type="button"
              onClick={handleResendEmail}
              className="w-full py-2 px-4 bg-yellow-500 text-yellow-900 rounded-lg hover:bg-yellow-600 transition"
            >
              Reenviar e-mail
            </button>
          )}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <div className="flex flex-col">
            <label htmlFor="email" className="text-gray-200 mb-1">
              E-mail
            </label>
            <input
              type="text"
              placeholder="E-mail"
              {...register("email")}
              className="px-3 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative flex flex-col">
            <label htmlFor="password" className="text-gray-200 mb-1">
              Senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              {...register("password")}
              className="px-3 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-100"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition ${
              isValid && !loading
                ? "bg-cyan-600 hover:bg-cyan-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {loading ? "Acessando..." : "Acessar"}
          </button>
        </form>

        <div className="flex flex-col items-center mt-4 space-y-2">
          <Link href="/auth/register" className="text-cyan-400 hover:underline">
            Cadastrar
          </Link>
          <Link
            href="/auth/forgot-password"
            className="text-cyan-400 hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </div>
  );
}
