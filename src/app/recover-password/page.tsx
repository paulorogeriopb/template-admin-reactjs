"use client";

import { useState } from "react";

// Validador do react-hook-form com Yup
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Hook principal para formularios
import { useForm } from "react-hook-form";

// Axios para tratar erros de requisição
import { AxiosError } from "axios";

// Router do Next para navegação programática
import { useRouter } from "next/navigation";

// Componentes auxiliares
import Link from "next/link";
import instance from "@/services/api"; // sua instância axios configurada

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

export default function LoginPage() {
  //Instancia do router
  const router = useRouter();

  // Controle de carregamento
  const [loading, setLoading] = useState<boolean>(false);

  // Controle de erro
  const [error, setError] = useState<string | null>(null);

  // Controle de sucesso
  const [success, setSuccess] = useState<string | null>(null);

  // Configuração do formulário com as validações
  const {
    register, // registra os campos
    handleSubmit, // envia os dados do formulário
    formState: { errors }, // captura erros de validação
  } = useForm({
    resolver: yupResolver(schema), // usa o schema do Yup como validador
  });

  // Função enviar os dados para API validar
  const onsubmit = async (data: { email: string; password: string }) => {
    // Controle de carregamento
    setLoading(true);
    // Controle de erro
    setError(null);
    // Controle de sucesso
    setSuccess(null);

    try {
      // Envia os dados para API
      const response = await instance.post("/auth/login", data);

      // Mensagem de sucesso
      //alert(response.data.message || "Login realizado com sucesso!");
      console.log(response.data);

      // Armazena o token no localStorage
      localStorage.setItem("token", response.data.token);

      // Redireciona para outra rota
      router.push("/dashboard");
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
    <div>
      <h1>Login</h1>

      {/* Feedback visual */}
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Formulário */}
      <form onSubmit={handleSubmit(onsubmit)}>
        <div>
          <label htmlFor="email">E-mail</label>
          <input
            type="text"
            placeholder="E-mail"
            {...register("email")} // integração com react-hook-form
          />
          {/* Mensagem de erro do Yup */}
          {errors.email && (
            <p style={{ color: "red" }}>{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            {...register("password")} // integração com react-hook-form
          />
          {/* Mensagem de erro do Yup */}
          {errors.password && (
            <p style={{ color: "red" }}>{errors.password.message}</p>
          )}
        </div>

        <button type="submit" disabled={loading} style={{ marginLeft: "10px" }}>
          {loading ? "Acessando..." : "Acessar"}
        </button>
        <Link href="/register">Cadastrar</Link>

        <Link href="/forgot">Esqueci minha senha</Link>
      </form>
    </div>
  );
}
