import { ReactNode } from "react";
import { useAuth } from "@/hooks/userAuth";
import LoginPage from "@/app/auth/login/page";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authenticated, loading } = useAuth();

  if (loading) return <p>Carregando...</p>;

  // Se não estiver autenticado, renderiza a tela de login **no lugar** do conteúdo
  if (!authenticated) return <LoginPage />;

  return <>{children}</>;
}
