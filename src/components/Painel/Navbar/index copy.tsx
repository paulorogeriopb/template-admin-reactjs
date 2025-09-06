"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  LuLogOut,
  LuChevronDown,
  LuCircleUserRound,
  LuMoon,
  LuSun,
  LuAlignJustify,
} from "react-icons/lu";

const Navbar = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) => {
  const router = useRouter();

  // dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // tema via next-themes
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Botão sidebar */}
        <button
          id="toggleSidebar"
          className="menu-button"
          onClick={() => setIsOpen(true)}
        >
          <LuAlignJustify size={28} />
        </button>

        {/* User / Theme */}
        <div className="user-container">
          {/* Toggle theme */}
          <div className="relative dropdown-button-border">
            <button
              id="themeToggle"
              className="themeToggle"
              onClick={() => setTheme(isDark ? "light" : "dark")} // alterna o tema
            >
              <div id="themeToggleThumb" className="themeToggleThumb">
                {/* Lua */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className={`w-4 h-4 text-yellow-400 ${
                    isDark ? "hidden" : "block"
                  }`}
                >
                  <LuMoon size={24} />
                </svg>
                {/* Sol */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className={`w-4 h-4 text-yellow-300 ${
                    isDark ? "block" : "hidden"
                  }`}
                >
                  <LuSun size={24} />
                </svg>
              </div>
            </button>
          </div>

          {/* Dropdown usuário */}
          <div ref={dropdownRef}>
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
                  className="dropdown-item  flex items-center gap-2"
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
