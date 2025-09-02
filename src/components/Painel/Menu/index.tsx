import React from "react";
import Link from "next/link";

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/auth/login";
};

const Menu = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/painel/dashboard">Home</Link>
        </li>
        <li>
          <Link href="/painel/cursos/list">Cursos</Link>
        </li>
        <li>
          <Link href="/painel/users/list">Usuários</Link>
        </li>
        <li>
          <Link href="#" onClick={handleLogout}>
            Sair
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
