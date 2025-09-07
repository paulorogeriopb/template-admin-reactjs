"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LuHouse,
  LuUsers,
  LuUserCog,
  LuTriangleAlert,
  LuSquareMousePointer,
  LuLogOut,
  LuX,
} from "react-icons/lu";
import { useDarkMode } from "@/components/DarkMode";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const { isDark } = useDarkMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const links = [
    {
      href: "/painel/dashboard",
      icon: <LuHouse size={18} />,
      label: "Dashboard",
    },
    {
      href: "/painel/cursos/list",
      icon: <LuUserCog size={18} />,
      label: "Cursos",
    },
    {
      href: "/painel/users/list",
      icon: <LuUsers size={18} />,
      label: "Usuários",
    },
    {
      href: "/painel/roles/list",
      icon: <LuUserCog size={18} />,
      label: "Perfis",
    },
    {
      href: "/painel/user-status/list",
      icon: <LuUserCog size={18} />,
      label: "Status Usuários",
    },
    {
      href: "/painel/alert/alert.html",
      icon: <LuTriangleAlert size={18} />,
      label: "Alertas",
    },
    {
      href: "/painel/button/button.html",
      icon: <LuSquareMousePointer size={18} />,
      label: "Botões",
    },
  ];

  return (
    <aside
      id="sidebar"
      className={`sidebar sm:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="sidebar-container">
        <button
          id="closeSidebar"
          className="sidebar-close-button"
          onClick={() => setIsOpen(false)}
        >
          <LuX size={28} />
        </button>
        <div className="sidebar-header">
          <Image
            key={isDark ? "dark" : "light"} // força re-render
            src={isDark ? "/images/logo-dark.png" : "/images/logo-v.png"}
            alt="Logo Nimbus"
            width={160}
            height={80}
            style={{ width: "160px", height: "auto", objectFit: "contain" }}
            priority
          />
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="sidebar-link">
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {/* Logout */}
          <button onClick={handleLogout} className="sidebar-link">
            <LuLogOut size={18} />
            <span>Sair</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
