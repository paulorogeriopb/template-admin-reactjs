import { useState } from "react";
import { AxiosError } from "axios";
import instance from "@/services/api";
import { LuTrash2 } from "react-icons/lu";

interface DeleteButtonProps {
  id: string; // ID do item a ser deletado
  route: string; // Rota da API para deletar o item
  onSuccess: () => void; // Atualiza a lista após exclusão
  setError: (message: string | null) => void; // Exibe mensagem de erro
  setSuccess: (message: string | null) => void; // Exibe mensagem de sucesso
}

const DeleteButton = ({
  id,
  route,
  onSuccess,
  setError,
  setSuccess,
}: DeleteButtonProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    // Pergunta ao usuário se deseja realmente excluir
    const confirmed = window.confirm("Deseja realmente excluir este curso?");
    if (!confirmed) return; // se cancelar, não faz nada

    if (loading) return; // evita múltiplos cliques
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await instance.delete(`${route}/${id}`);

      // Atualiza a lista
      onSuccess();

      // Exibe mensagem de sucesso
      setSuccess("Curso deletado com sucesso!");

      // Opcional: sumir com a mensagem após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const data = error.response?.data;
        setError(
          data?.message || data?.error || "Erro inesperado ao deletar curso."
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro desconhecido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-danger hidden md:inline-flex items-center gap-2"
    >
      {loading ? (
        "Excluindo..."
      ) : (
        <>
          <LuTrash2 className="text-white" />
          Deletar
        </>
      )}
    </button>
  );
};

export default DeleteButton;
