import { ReactNode } from "react";
import { useAuth } from "@/hooks/userAuth";
import LoginPage from "@/app/auth/login/page";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authenticated, loading } = useAuth();

  if (loading) return <p>Carregando...</p>; // espera confirmação da API

  // Se não estiver autenticado, redireciona ou mostra login
  if (!authenticated) return <LoginPage />;

  return <>{children}</>;
}
