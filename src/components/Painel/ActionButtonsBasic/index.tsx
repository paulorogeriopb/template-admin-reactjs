"use client";

import Link from "next/link";
import { LuEye, LuSquarePen, LuTrash2, LuCirclePlus } from "react-icons/lu";
import { IoMdMore } from "react-icons/io";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import DeleteButton from "@/components/DeleteButton";
import DeleteButtonNoStyle from "@/components/DeleteButtonNoStyle";

interface ActionButtonsProps {
  id: number | string;
  basePath: string;
  onSuccess: () => void;
  setError: (message: string | null) => void;
  openId: number | null;
  setOpenId: (id: number | null) => void;
  roleId?: number; // opcional, caso precise no menu de permissões
  entityName?: string;
}

export default function ActionButtons({
  id,
  basePath,
  onSuccess,
  setError,
  openId,
  setOpenId,
  roleId,
}: ActionButtonsProps) {
  const isOpen = openId === id;
  const [buttonPos, setButtonPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const pathname = usePathname();

  const toggleOpen = (e?: React.MouseEvent) => {
    if (!isOpen && e?.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = 215;

      let left = rect.right + window.scrollX - menuWidth;
      if (left < 0) left = 0;

      setButtonPos({
        top: rect.bottom + window.scrollY - 22,
        left,
      });
    }
    setOpenId(isOpen ? null : Number(id));
  };

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setOpenId(null);
    if (isOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, setOpenId]);

  // Fecha menu mobile automaticamente se a tela for ampliada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        setOpenId(null);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, setOpenId]);

  const showPermissionsMenuItem =
    pathname === "/painel/roles/list" && typeof roleId === "number";

  return (
    <div>
      {/* Desktop */}
      <div className="hidden lg:flex gap-2">
        {showPermissionsMenuItem && (
          <Link
            href={`/painel/roles/${roleId}/permissions`}
            className="flex items-center gap-2 px-4 py-2 rounded btn-default shadow-lg"
            onClick={() => setOpenId(null)}
          >
            <LuCirclePlus /> Permissões
          </Link>
        )}
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
            e.stopPropagation();
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
            {showPermissionsMenuItem && (
              <li>
                <Link
                  href={`/painel/roles/${roleId}/permissions`}
                  className="flex items-center gap-2 px-4 py-2 rounded btn-default shadow-lg"
                  onClick={() => setOpenId(null)}
                >
                  <LuCirclePlus /> Permissões
                </Link>
              </li>
            )}

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
                className="flex items-center gap-2 px-4 py-2 hover:bg-(--light-secondary) dark:hover:bg-(--dark-tertiary) text-gray-500 dark:text-gray-400 hover:text-(--default)"
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
