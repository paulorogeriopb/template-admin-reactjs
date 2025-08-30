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

    try {
      const response = await instance.post("/auth/login", data);
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.token);
      router.push(redirectTo);
    } catch (err: unknown) {
      console.log("Login API error:", err);

      if (err instanceof AxiosError && err.response) {
        const apiData = err.response.data;
        console.log("Login API response message:", apiData.message);

        // Detecta se o email não foi verificado
        if (
          apiData.message ===
          "Você precisa validar o seu e-mail antes de acessar o sistema. Verifique seu e-mail e clique no link de verificação."
        ) {
          console.log(
            "Email não verificado detectado! Mostrando botão de reenvio"
          );
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
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}

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

        {success && <p className="text-green-500 mt-2">{success}</p>}

        <div>
          <label htmlFor="email" className="block mb-1 font-medium">
            E-mail
          </label>
          <input
            type="text"
            placeholder="E-mail"
            {...register("email")}
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && (
            <p className="text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="relative">
          <label htmlFor="password" className="block mb-1 font-medium">
            Senha
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            {...register("password")}
            className="w-full p-3 pr-10 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 text-gray-400 hover:text-gray-100"
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

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? "Acessando..." : "Acessar"}
        </button>
      </form>

      <div className="mt-4 text-center space-y-2">
        <Link href="/auth/register" className="text-blue-500 hover:underline">
          Cadastrar
        </Link>
        <br />
        <Link
          href="/auth/forgot-password"
          className="text-blue-500 hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>
    </div>
  );
}
