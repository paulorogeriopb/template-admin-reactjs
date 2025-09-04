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
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import AlertMessage from "@/components/AlertMessage";

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
    <div className="bg-login">
      {(loadingCode || loadingPassword) && <LoadingSpinner />}
      <div className="card-login max-w-md sm:max-w-2xl mx-auto px-4 sm:px-8">
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
        <p className="subtitle-login">Redifinição de Senha</p>

        {/* Mensagens de erro */}

        {errorCode && !step && (
          <AlertMessage type="error" message={errorCode} />
        )}

        {errorPassword && step && (
          <AlertMessage type="error" message={errorPassword} />
        )}

        {(loadingCode || loadingPassword) && (
          <div className="flex justify-center my-4">
            <LoadingSpinner />
          </div>
        )}

        {/* Etapa 1: Código */}
        {!step && !success ? (
          <>
            <div className="flex justify-between gap-2 sm:gap-4 mb-4">
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
                  className={`flex-1 min-w-[2.5rem] max-w-[4rem] h-20 sm:h-22 text-center text-shadow-2xs shadow-md text-3xl sm:text-4xl rounded-lg text-white border 
    ${errorCode ? "border-red-500" : "border-[#32a2b9]"} 
    focus:outline-none transition-all duration-300`}
                  style={{
                    backgroundColor: "#298ba1",
                    outlineColor: "#32a2b9",
                    boxShadow: "0 0 0 2px #32a2b9",
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => validateCode(code.join(""))}
              disabled={loadingCode || code.join("").trim().length !== 6}
              className="btn-login"
            >
              {loadingCode ? "Validando..." : "Verificar código"}
            </button>
          </>
        ) : step && !success ? (
          // Etapa 2: redefinir senha
          <form onSubmit={handleSubmit(resetPassword)} className="mt-4">
            <div className="relative form-group-login">
              <label htmlFor="password" className="form-label-login">
                Nova senha
              </label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Digite a nova senha"
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
                <p className="mt-2 text-green-600 text-sm">Senha válida!</p>
              )}
            </div>

            <div className="relative form-group-login mt-4">
              <label
                htmlFor="password_confirmation"
                className="form-label-login"
              >
                Confirmar senha
              </label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password_confirmation")}
                placeholder="Confirme a nova senha"
                className="form-input-login"
                onKeyUp={() => trigger("password_confirmation")}
              />
              {errors.password_confirmation && (
                <p className="text-red-400 mt-1">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || loadingPassword}
              className="btn-login mt-4"
            >
              {loadingPassword ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </form>
        ) : (
          // Mensagem de sucesso
          <div className="text-center mt-6">
            <AlertMessage
              type="success"
              message={"Senha redefinida com sucesso!"}
            />
            <Link href="/auth/login" className="w-48 mx-auto block btn-login">
              Ir para login
            </Link>
          </div>
        )}

        {/* Link de voltar */}
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
