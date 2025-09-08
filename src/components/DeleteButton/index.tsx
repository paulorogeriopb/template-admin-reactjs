// DeleteButton.tsx
import { useState } from "react";
import { AxiosError } from "axios";
import instance from "@/services/api";
import { LuTrash2 } from "react-icons/lu";
import Swal from "sweetalert2";

// Interface atualizada
interface DeleteButtonProps {
  id: string;
  route: string;
  onSuccess: () => void;
  setError: (message: string | null) => void;
}

const DeleteButton = ({
  id,
  route,
  onSuccess,
  setError,
}: DeleteButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Deseja realmente excluir este item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
      confirmButtonColor: "#32a2b9",
      cancelButtonColor: "#db4d52",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setError(null);

    try {
      await instance.delete(`${route}/${id}`);
      onSuccess(); // atualiza a lista
      Swal.fire({
        title: "Sucesso!",
        text: "O item foi removido com sucesso.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Erro inesperado ao deletar.";
        setError(msg);
        Swal.fire({
          title: "Erro",
          text: msg,
          icon: "error",
        });
      } else if (error instanceof Error) {
        setError(error.message);
        Swal.fire({
          title: "Erro",
          text: error.message,
          icon: "error",
        });
      } else {
        setError("Erro desconhecido");
        Swal.fire({
          title: "Erro",
          text: "Erro desconhecido",
          icon: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-danger inline-flex items-center gap-2"
    >
      {loading ? (
        "Excluindo..."
      ) : (
        <>
          <LuTrash2 className="text-white" />
          Excluir
        </>
      )}
    </button>
  );
};

export default DeleteButton;
