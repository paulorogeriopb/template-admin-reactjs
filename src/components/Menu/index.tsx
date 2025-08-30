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
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/cursos/list">Cursos</Link>
        </li>
        <li>
          <Link href="/users/list">Usuários</Link>
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
