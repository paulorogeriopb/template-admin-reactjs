// components/SwalAlert/index.tsx
import Swal from "sweetalert2";

type SwalAlertType = "success" | "error";

interface SwalAlertOptions {
  type: SwalAlertType;
  title: string;
  text: string;
  theme: "dark" | "light"; // recebe o tema da página
  confirmCallback?: () => void;
}

export const SwalAlert = ({
  type,
  title,
  text,
  theme,
  confirmCallback,
}: SwalAlertOptions) => {
  Swal.fire({
    icon: type,
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: type === "success" ? "#32a2b9" : "#dc2626", // azul para sucesso, vermelho para erro
    background: theme === "dark" ? "#1f2937" : "#ffffff",
    color: theme === "dark" ? "#f9fafb" : "#111827",
  }).then(() => {
    if (confirmCallback) confirmCallback();
  });
};
