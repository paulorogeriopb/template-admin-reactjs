"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import instance from "@/services/api";

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
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Esqueci minha senha</h1>

      {success ? (
        <div className="text-center mt-6">
          <p className="text-green-600 mb-4">{success}</p>
          <p>Redirecionando para redefinir a senha...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}

          <div>
            <label className="block mb-1 font-medium">E-mail</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              {...register("email")}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>
      )}

      {!success && (
        <div className="mt-4 text-center">
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Voltar ao login
          </Link>
        </div>
      )}
    </div>
  );
}
