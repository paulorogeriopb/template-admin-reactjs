"use client";

import Link from "next/link";
import { LuEye, LuSquarePen, LuTrash2 } from "react-icons/lu";
import { IoMdMore } from "react-icons/io";

import DeleteButton from "@/components/DeleteButton";
import DeleteButtonNoStyle from "@/components/DeleteButtonNoStyle";

interface ActionButtonsProps {
  id: number | string;
  basePath: string; // ex: "/painel/cursos"
  entityName: string; // ex: "curso"
  onSuccess: () => void;
  setError: (message: string | null) => void;
  openId: number | null;
  setOpenId: (id: number | null) => void;
}

export default function ActionButtons({
  id,
  basePath,
  entityName,
  onSuccess,
  setError,
  openId,
  setOpenId,
}: ActionButtonsProps) {
  const isOpen = openId === id;

  const toggleOpen = () => {
    setOpenId(isOpen ? null : Number(id));
  };

  return (
    <div>
      {/* Desktop */}
      <div className="hidden lg:flex gap-2">
        <Link
          href={`${basePath}/${id}`}
          className="btn-light flex items-center gap-1"
        >
          <LuEye /> <span className="hidden md:inline">Visualizar</span>
        </Link>

        <Link
          href={`${basePath}/${id}/edit`}
          className="btn-light flex items-center gap-1"
        >
          <LuSquarePen /> <span className="hidden md:inline">Editar</span>
        </Link>

        <DeleteButton
          id={String(id)}
          route={basePath.replace("/painel", "")}
          onSuccess={onSuccess}
          setError={setError}
        />
      </div>

      {/* Mobile */}
      <div className="relative lg:hidden">
        <button
          type="button"
          onClick={toggleOpen}
          className="btn-light p-2 rounded-full"
        >
          <IoMdMore className="w-5 h-5" />
        </button>

        {isOpen && (
          <ul className="fixed right-0 mt-2 w-44 bg-(--light-primary) dark:bg-(--dark-secondary)  rounded-lg shadow-lg z-50">
            <li>
              <Link
                href={`${basePath}/${id}`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-(--light-secondary) dark:hover:bg-(--dark-tertiary) hover:text-(--default)  "
                onClick={() => setOpenId(null)}
              >
                <LuEye /> Visualizar
              </Link>
            </li>
            <li>
              <Link
                href={`${basePath}/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-(--light-secondary) dark:hover:bg-(--dark-tertiary) hover:text-(--default) "
                onClick={() => setOpenId(null)}
              >
                <LuSquarePen /> Editar
              </Link>
            </li>
            <li>
              <DeleteButtonNoStyle
                id={String(id)}
                route={basePath.replace("/painel", "")}
                onSuccess={() => {
                  setOpenId(null);
                  onSuccess();
                }}
                setError={setError}
              >
                <div className="flex items-center gap-2">
                  <LuTrash2 /> Excluir
                </div>
              </DeleteButtonNoStyle>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
