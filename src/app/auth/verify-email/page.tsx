"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import publicApi from "@/services/publicApi";
import { AxiosError } from "axios";
import Link from "next/link";
import Image from "next/image";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Manipulação dos inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      const newCode = [...code];
      newCode[idx] = val.slice(-1);
      setCode(newCode);
      setError(null); // limpa erro ao digitar novamente
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
      inputsRef.current[Math.min(paste.length, 5)]?.focus();
    }
  };

  // Validação automática do código quando completo
  useEffect(() => {
    const codeStr = code.join("").trim();
    if (codeStr.length === 6 && email && !success) {
      const timer = setTimeout(() => validateCode(codeStr), 500); // debounce
      return () => clearTimeout(timer);
    }
  }, [code, email, success]);

  // Função de validação do código
  const validateCode = async (codeStr: string) => {
    if (!email) {
      setError("Email não fornecido.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await publicApi.post("/auth/verify-email-code", {
        email,
        code: codeStr,
      });
      setSuccess(response.data.message || "E-mail verificado com sucesso!");
      setTimeout(() => router.push("/auth/login"), 10000);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        setError(data?.message || "Código inválido ou expirado.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido.");
      }
      // mantém o código digitado
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-login">
      <div className="card-login sm:max-w-2xl">
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
        <p className="subtitle-login">Insira o código de verificação</p>
        {loading && <p>Carregando...</p>}

        {success ? (
          <p className="alert-success">{success}</p>
        ) : (
          <>
            {error && <p className="alert-danger mb-4">{error}</p>}

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
                  className={`w-24 h-24 text-center text-shadow-2xs shadow-md text-4xl rounded-lg text-white border 
  ${error ? "border-red-500" : ""} 
  focus:outline-none transition-all duration-300`}
                  style={{
                    backgroundColor: "#298ba1",
                    borderColor: error ? undefined : "#32a2b9",
                    outlineColor: "#32a2b9", // para foco no Chrome
                    boxShadow: "0 0 0 2px #32a2b9", // simula focus:ring
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => validateCode(code.join(""))}
              disabled={loading || code.join("").length !== 6}
              className="btn-login"
            >
              {loading ? "Validando..." : "Validar Código"}
            </button>
          </>
        )}

        {!success && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/auth/login")}
              className="link-login"
            >
              Voltar ao login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
