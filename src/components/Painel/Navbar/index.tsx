"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LuLogOut,
  LuChevronDown,
  LuCircleUserRound,
  LuMoon,
  LuSun,
  LuAlignJustify,
} from "react-icons/lu";
import { useDarkMode } from "@/components/Painel/DarkMode";

const Navbar = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) => {
  const router = useRouter();
  const { isDark, toggleTheme } = useDarkMode();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
    setDropdownOpen(false);
  };

  const handleDropdownItemClick = () => {
    setDropdownOpen(false); // fecha ao clicar em qualquer item
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Image
          key={isDark ? "dark" : "light"} // força re-render
          src={isDark ? "/images/logo-v.png" : "/images/logo-v.png"}
          alt="Logo Nimbus"
          width={160}
          height={80}
          className="mr-8"
          style={{ width: "160px", height: "auto", objectFit: "contain" }}
          priority
        />

        <button
          id="toggleSidebar"
          className="menu-button"
          onClick={() => setIsOpen(true)}
        >
          <LuAlignJustify size={28} />
        </button>

        <div className="user-container">
          <div className="relative dropdown-button-border">
            <button
              id="themeToggle"
              className="themeToggle"
              onClick={toggleTheme}
            >
              <div id="themeToggleThumb" className="themeToggleThumb">
                <LuMoon
                  size={24}
                  className={`${
                    isDark ? "hidden" : "block"
                  } w-4 h-4 text-yellow-400 `}
                />
                <LuSun
                  size={24}
                  className={`${
                    isDark ? "block" : "hidden"
                  } w-4 h-4 text-yellow-400 `}
                />
              </div>
            </button>
          </div>

          <div ref={dropdownRef} className="relative">
            <button
              id="userDropdownButton"
              className="dropdown-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Usuário
              <LuChevronDown />
            </button>

            {dropdownOpen && (
              <div id="dropdownContent" className="dropdown-content">
                <Link
                  href="#"
                  onClick={handleDropdownItemClick}
                  className="dropdown-item flex items-center gap-2"
                >
                  <LuCircleUserRound size={20} />
                  Perfil
                </Link>

                <Link
                  href="/auth/login"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="sidebar-danger flex items-center gap-2"
                >
                  <LuLogOut size={20} />
                  <span>Sair</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
