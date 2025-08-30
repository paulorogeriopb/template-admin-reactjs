"use client";

import instance from "@/services/api";
import { useEffect, useState } from "react";

type Curso = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function TesteConnection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await instance.get("/cursos");

        if (response.data?.data) {
          setCursos(response.data.data);
        }
      } catch (err: any) {
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    if (instance.defaults.baseURL) {
      testConnection();
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão</h1>

      {loading && <p className="text-blue-500">Carregando...</p>}

      {error && (
        <p className="text-red-500">Erro ao conectar ao servidor: {error}</p>
      )}

      {!loading && !error && cursos.length === 0 && (
        <p className="text-gray-500">Nenhum curso cadastrado.</p>
      )}

      {!loading && !error && cursos.length > 0 && (
        <ul className="space-y-3">
          {cursos.map((curso) => (
            <li
              key={curso.id}
              className="p-4 border rounded-xl shadow-sm bg-white"
            >
              <h2 className="font-semibold">{curso.name}</h2>
              <p className="text-sm text-gray-500">
                Criado em: {new Date(curso.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
