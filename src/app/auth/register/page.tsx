"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import publicApi from "@/services/publicApi";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { AxiosError } from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import LoadingSpinner from "@/components/LoadingSpinner";
import AlertMessage from "@/components/AlertMessage";

// Componentes auxiliares
import Image from "next/image";

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

  // Critérios da senha (para feedback visual)
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

  // Verifica se o email já existe
  const checkEmailExists = async () => {
    if (!email) return;
    try {
      const response = await publicApi.post("/auth/check-email", { email });
      if (response.data.exists) {
        setFormError("email", {
          type: "manual",
          message: "Este e-mail já está cadastrado.",
        });
      }
    } catch (err) {
      console.warn("Falha ao verificar e-mail:", err);
    }
  };

  // Submissão do formulário
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      await publicApi.post("/auth/register", data);
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
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

        <h1 className="title-login">Registrar</h1>
        <p className="subtitle-login">
          Crie sua conta para acessar nossa plataforma
        </p>

        {loading && LoadingSpinner()}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <AlertMessage type="error" message={error} />

          {/* Nome */}
          <div className="form-group-login">
            <label htmlFor="name" className="form-label-login">
              Nome
            </label>
            <input
              type="text"
              placeholder="Nome"
              {...register("name")}
              className="form-input-login"
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* E-mail */}
          <div className="form-group-login">
            <label htmlFor="email" className="form-label-login">
              E-mail
            </label>
            <input
              type="email"
              placeholder="E-mail"
              {...register("email")}
              onBlur={checkEmailExists}
              className="form-input-login"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="relative form-group-login">
            <label htmlFor="password" className="form-label-login">
              Senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Digite sua senha..."
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

            {pendingRules.length > 0 && (
              <ul className="mt-2 text-sm space-y-1 text-red-400">
                {pendingRules.map((rule) => (
                  <li key={rule.id}>• {rule.label}</li>
                ))}
              </ul>
            )}
            {password && pendingRules.length === 0 && (
              <p className="mt-2 text-green-600 text-sm">
                Perfeito, senha válida!
              </p>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="relative form-group-login">
            <label htmlFor="password_confirmation" className="form-label-login">
              Confirmar senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password_confirmation")}
              placeholder="Confirme sua senha..."
              onKeyUp={() => trigger("password_confirmation")}
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
            {errors.password_confirmation && (
              <p className="text-red-500">
                {errors.password_confirmation.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className=" btn-login mt-4  "
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-700 dark:text-gray-400">
          Já tem uma conta?{" "}
          <Link href="/auth/login">
            <span className="link-login">Entrar</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
