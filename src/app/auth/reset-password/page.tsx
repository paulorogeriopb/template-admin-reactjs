"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AxiosError } from "axios";
import instance from "@/services/api";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Schema para reset de senha
const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .matches(/^[^!]*$/, "A senha não pode conter '!'")
    .required("A senha é obrigatória"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas devem ser iguais")
    .required("Confirmação obrigatória"),
});

type PasswordForm = {
  password: string;
  password_confirmation: string;
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  // --- Estados ---
  const [code, setCode] = useState(Array(6).fill(""));
  const [step, setStep] = useState(false); // true = código válido
  const [loadingCode, setLoadingCode] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false); // sucesso da redefinição

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<PasswordForm>({
    resolver: yupResolver(passwordSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  // --- Critérios da senha ---
  const rules = [
    {
      id: 1,
      label: "Mínimo 8 caracteres",
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      id: 2,
      label: "Uma letra maiúscula",
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      id: 3,
      label: "Uma letra minúscula",
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    { id: 4, label: "Um número", test: (pwd: string) => /\d/.test(pwd) },
    {
      id: 5,
      label: "Um símbolo (@#$...)",
      test: (pwd: string) => /[@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
    {
      id: 6,
      label: "Não pode conter '!'",
      test: (pwd: string) => !pwd.includes("!"),
    },
  ];
  const pendingRules = rules.filter((rule) => !rule.test(password));

  // --- Manipulação do código ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      const newCode = [...code];
      newCode[idx] = val.slice(-1);
      setCode(newCode);
      setErrorCode(null); // limpa erro ao digitar novamente
      if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("Text").trim().slice(0, 6);
    if (/^\d{1,6}$/.test(paste)) {
      const newCode = paste.split("");
      setCode([...Array(6)].map((_, i) => newCode[i] || ""));
      setErrorCode(null);
      inputsRef.current[Math.min(paste.length, 5)]?.focus();
    }
  };

  // --- Validação automática do código com debounce ---
  useEffect(() => {
    const codeStr = code.join("").trim();
    if (codeStr.length === 6 && email && !step) {
      const timer = setTimeout(() => validateCode(codeStr), 500); // debounce
      return () => clearTimeout(timer);
    }
  }, [code, email, step]);

  const validateCode = async (codeStr: string) => {
    if (!email) {
      setErrorCode("Email não fornecido.");
      return;
    }

    setLoadingCode(true);
    try {
      await instance.post("/auth/reset-password-validate-code", {
        email: email.trim(),
        code: codeStr,
      });
      setStep(true);
      setErrorCode(null);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response)
        setErrorCode(err.response.data.message || "Código inválido.");
      else setErrorCode("Erro de conexão com o servidor.");
    } finally {
      setLoadingCode(false);
    }
  };

  // --- Resetar senha ---
  const resetPassword = async (data: PasswordForm) => {
    setLoadingPassword(true);
    setErrorPassword(null);

    try {
      await instance.post("/auth/reset-password-code", {
        email,
        code: code.join(""),
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      setSuccess(true); // sucesso
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response)
        setErrorPassword(
          err.response.data.message || "Erro ao redefinir senha."
        );
      else setErrorPassword("Erro de conexão com o servidor.");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Redefinir senha</h1>

      {/* Mensagens de erro */}
      {errorCode && !step && <p className="text-red-500 mb-4">{errorCode}</p>}
      {errorPassword && step && (
        <p className="text-red-500 mb-4">{errorPassword}</p>
      )}

      {/* Etapa 1: Código */}
      {!step && !success ? (
        <>
          <div className="flex justify-between space-x-2 mb-4">
            {code.map((num, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={num}
                ref={(el) => (inputsRef.current[idx] = el)}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={handlePaste}
                className={`w-16 h-20 text-center text-4xl rounded-lg bg-gray-800 text-white border ${
                  errorCode ? "border-red-500" : "border-gray-600"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => validateCode(code.join(""))}
            disabled={loadingCode || code.join("").trim().length !== 6}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loadingCode ? "Validando..." : "Verificar código"}
          </button>
        </>
      ) : step && !success ? (
        // Etapa 2: redefinir senha
        <form onSubmit={handleSubmit(resetPassword)} className="space-y-4">
          <div className="relative">
            <label>Nova senha</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Digite a nova senha"
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

          <div className="relative mt-4">
            <label>Confirmar senha</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password_confirmation")}
              placeholder="Confirme a nova senha"
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyUp={() => trigger("password_confirmation")}
            />
            {errors.password_confirmation && (
              <p className="text-red-500 mt-1">
                {errors.password_confirmation.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || loadingPassword}
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loadingPassword ? "Redefinindo..." : "Redefinir senha"}
          </button>
        </form>
      ) : (
        // Mensagem de sucesso
        <div className="text-center mt-6">
          <p className="text-green-600 text-xl font-semibold mb-4">
            Senha redefinida com sucesso!
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ir para login
          </Link>
        </div>
      )}

      {/* Link de voltar */}
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
