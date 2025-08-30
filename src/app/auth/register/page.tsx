"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import instance from "@/services/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { AxiosError } from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

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
    .matches(/^[^!]*$/, "A senha não pode conter o caractere !")
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
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setError: setFormError,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const password = watch("password", "");
  const email = watch("email", "");

  // Critérios da senha
  const rules = [
    {
      id: 1,
      label: "Mínimo 8 caracteres",
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      id: 2,
      label: "Pelo menos uma letra maiúscula",
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      id: 3,
      label: "Pelo menos uma letra minúscula",
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      id: 4,
      label: "Pelo menos um número",
      test: (pwd: string) => /\d/.test(pwd),
    },
    {
      id: 5,
      label: "Pelo menos um símbolo (@#$...)",
      test: (pwd: string) => /[@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
    {
      id: 6,
      label: 'Não pode conter "!"',
      test: (pwd: string) => !pwd.includes("!"),
    },
  ];

  const pendingRules = rules.filter((rule) => !rule.test(password));

  const checkEmailExists = async () => {
    if (!email) return;
    try {
      const response = await instance.post("/auth/check-email", { email });
      if (response.data.exists) {
        setFormError("email", {
          type: "manual",
          message: "Este e-mail já está cadastrado.",
        });
      }
    } catch (err) {
      // não bloqueia formulário
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await instance.post("/auth/register", data);
      setSuccess(response.data.message || "Cadastro realizado com sucesso!");
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
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Registrar</h1>

      {success ? (
        <div className="text-center mt-6">
          <p className="text-green-600 mb-4">{success}</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Voltar
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}

          {/* Nome */}
          <div>
            <label>Nome</label>
            <input
              type="text"
              {...register("name")}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <label>E-mail</label>
            <input
              type="email"
              {...register("email")}
              onBlur={checkEmailExists}
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="relative">
            <label>Senha</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Digite sua senha..."
              className="w-full p-3 pr-10 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 mt-4  text-gray-400 hover:text-gray-100"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>

            {pendingRules.length > 0 && (
              <ul className="mt-2 text-sm space-y-1 text-red-400">
                {pendingRules.map((rule) => (
                  <li key={rule.id}>• {rule.label}</li>
                ))}
              </ul>
            )}
            {password && pendingRules.length === 0 && (
              <p className="mt-2 text-green-600 text-sm">✅ Senha válida!</p>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="relative mt-4">
            <label>Confirmar senha</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password_confirmation")}
              placeholder="Confirme sua senha..."
              onKeyUp={() => trigger("password_confirmation")}
              className="w-full p-3 pr-10 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 mt-4 text-gray-400 hover:text-gray-100"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
            {errors.password_confirmation && (
              <p className="text-red-500">
                {errors.password_confirmation.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      )}

      {!success && (
        <p className="mt-4 text-center">
          Já tem uma conta?{" "}
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Entrar
          </Link>
        </p>
      )}
    </div>
  );
}
