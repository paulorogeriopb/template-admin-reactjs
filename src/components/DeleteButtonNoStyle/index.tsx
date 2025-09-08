import { useState, ReactNode } from "react";
import { AxiosError } from "axios";
import instance from "@/services/api";
import Swal from "sweetalert2";
import { LuTrash2 } from "react-icons/lu";

interface DeleteButtonProps {
  id: string;
  route: string;
  onSuccess: () => void;
  setError: (message: string | null) => void;
  children?: ReactNode; // ✅ Adicionado
}

const DeleteButtonNoStyle = ({
  id,
  route,
  onSuccess,
  setError,
  children,
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
      onSuccess();
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
        Swal.fire({ title: "Erro", text: msg, icon: "error" });
      } else if (error instanceof Error) {
        setError(error.message);
        Swal.fire({ title: "Erro", text: error.message, icon: "error" });
      } else {
        setError("Erro desconhecido");
        Swal.fire({ title: "Erro", text: "Erro desconhecido", icon: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-danger block w-full text-left px-4 py-2  items-center gap-2 cursor-pointer"
    >
      {loading
        ? "Excluindo..."
        : children || (
            <>
              <LuTrash2 /> Excluir
            </>
          )}
    </button>
  );
};

export default DeleteButtonNoStyle;
