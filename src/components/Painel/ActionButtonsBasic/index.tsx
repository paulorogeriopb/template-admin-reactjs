"use client";

import Link from "next/link";
import { LuEye, LuSquarePen, LuTrash2 } from "react-icons/lu";
import { IoMdMore } from "react-icons/io";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import DeleteButton from "@/components/DeleteButton";
import DeleteButtonNoStyle from "@/components/DeleteButtonNoStyle";

interface ActionButtonsProps {
  id: number | string;
  basePath: string;
  entityName: string;
  onSuccess: () => void;
  setError: (message: string | null) => void;
  openId: number | null;
  setOpenId: (id: number | null) => void;
}

export default function ActionButtons({
  id,
  basePath,
  onSuccess,
  setError,
  openId,
  setOpenId,
}: ActionButtonsProps) {
  const isOpen = openId === id;
  const [buttonPos, setButtonPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const toggleOpen = (e?: React.MouseEvent) => {
    if (!isOpen && e?.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = 215; // w-44 ≈ 44*4 = 176px

      let left = rect.right + window.scrollX - menuWidth;
      // Evita que o menu saia da tela à esquerda
      if (left < 0) left = 0;

      setButtonPos({
        top: rect.bottom + window.scrollY - 22,
        left,
      });
    }
    setOpenId(isOpen ? null : Number(id));
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setOpenId(null);
    if (isOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, setOpenId]);

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
      <div className="relative lg:hidden inline-block">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // evita fechar ao clicar no botão
            toggleOpen(e);
          }}
          className="btn-light p-2 rounded-full"
        >
          <IoMdMore className="w-5 h-5" />
        </button>
      </div>

      {/* Dropdown via Portal */}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <ul
            style={{
              position: "absolute",
              top: `${buttonPos.top}px`,
              left: `${buttonPos.left}px`,
            }}
            className="w-44 bg-(--light-primary) dark:bg-(--dark-primary) rounded-lg shadow-lg z-[9999]"
          >
            <li>
              <Link
                href={`${basePath}/${id}`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-(--light-secondary) dark:hover:bg-(--dark-tertiary) text-gray-500 dark:text-gray-400 hover:text-(--default) border-b border-(--light-secondary) dark:border-(--dark-tertiary)"
                onClick={() => setOpenId(null)}
              >
                <LuEye /> Visualizar
              </Link>
            </li>
            <li>
              <Link
                href={`${basePath}/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-(--light-secondary) dark:hover:bg-(--dark-tertiary) text-gray-500 dark:text-gray-400  hover:text-(--default)"
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
          </ul>,
          document.body
        )}
    </div>
  );
}
