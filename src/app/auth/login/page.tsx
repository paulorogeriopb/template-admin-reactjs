"use client";

import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
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

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await instance.post("/auth/login", data);
      localStorage.setItem("token", response.data.token);
      setSuccess("Login realizado com sucesso!");
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
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      {/* Exibe sucesso */}
      {success ? (
        <div className="text-center mt-6">
          <p className="text-green-600 mb-4">{success}</p>
          <button
            onClick={() => router.push(redirectTo)}
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Continuar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}

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
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-100"
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
      )}

      {!success && (
        <div className="mt-4 text-center space-y-2">
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Cadastrar
          </Link>
          <br />
          <Link href="/forgot" className="text-blue-500 hover:underline">
            Esqueci minha senha
          </Link>
        </div>
      )}
    </div>
  );
}
