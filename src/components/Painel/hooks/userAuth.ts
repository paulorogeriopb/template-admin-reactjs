"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/services/api"; // sua instância axios

export function useAuth() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        router.push("/auth/login");
        return;
      }

      try {
        // Chama API para validar token
        await axios.get("/auth/me");
        setAuthenticated(true);
      } catch (err) {
        setAuthenticated(false);
        localStorage.removeItem("token"); // token inválido
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { authenticated, loading };
}
