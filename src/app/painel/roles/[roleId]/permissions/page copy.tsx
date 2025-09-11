"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import instance from "@/services/api";
import Link from "next/link";
import Layout from "@/components/Painel/Layout";
import Pagination from "@/components/Painel/Pagination";
import { LuCirclePlus, LuLock, LuLockOpen, LuCheck } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";

type Role = { id: number; name: string };
type Permission = { id: number; name: string; title?: string };
type User = { id: number; name: string; email: string; roles?: Role[] };

export default function RolePermissionsPage() {
  const params = useParams();
  const roleId = Number(params?.roleId);

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [permissionsPage, setPermissionsPage] = useState<number>(1);
  const [permissionsLastPage, setPermissionsLastPage] = useState<number>(1);

  const [users, setUsers] = useState<User[]>([]);
  const [usersPage, setUsersPage] = useState<number>(1);
  const [usersLastPage, setUsersLastPage] = useState<number>(1);

  const [error, setError] = useState<string | null>(null);

  const [searchPermission, setSearchPermission] = useState("");
  const [searchUser, setSearchUser] = useState("");

  const [debouncedSearchPermission, setDebouncedSearchPermission] =
    useState("");
  const [debouncedSearchUser, setDebouncedSearchUser] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchPermission(searchPermission);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchPermission]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchUser(searchUser);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchUser]);

  // Busca inicial e atualização periódica (sem loading global)
  const fetchAllData = async () => {
    if (!roleId) return;
    try {
      const response = await instance.get(`/role-permissions/${roleId}`, {
        params: {
          searchPermission: debouncedSearchPermission,
          searchUser: debouncedSearchUser,
        },
      });
      const roleData = response.data.data;
      setRole(roleData.role || null);
      setPermissions(roleData.permissions.data || []);
      setRolePermissions(roleData.rolePermissions || []);
      setPermissionsLastPage(roleData.permissions.last_page || 1);
      setUsers(roleData.users.data || []);
      setUsersLastPage(roleData.users.last_page || 1);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Erro desconhecido"
      );
    }
  };

  // Fetch ao mudar roleId ou searches
  useEffect(() => {
    fetchAllData();
  }, [roleId, debouncedSearchPermission, debouncedSearchUser]);

  // Toggle permissão (atualiza localmente sem piscar)
  const togglePermission = async (permissionId: number) => {
    try {
      await instance.patch(`/role-permissions/${roleId}/${permissionId}`);
      setRolePermissions((prev) =>
        prev.includes(permissionId)
          ? prev.filter((id) => id !== permissionId)
          : [...prev, permissionId]
      );
    } catch (err) {
      console.error("Erro ao alterar permissão", err);
    }
  };

  // Toggle usuário (atualiza localmente sem piscar)
  const toggleUser = async (userId: number) => {
    try {
      await instance.patch(`/role-permissions/${roleId}/toggle-user/${userId}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                roles: u.roles?.some((r) => r.id === roleId)
                  ? u.roles.filter((r) => r.id !== roleId)
                  : [...(u.roles || []), { id: roleId, name: role?.name! }],
              }
            : u
        )
      );
    } catch (err) {
      console.error("Erro ao alterar usuário", err);
    }
  };

  if (!role) return <p>Papel não encontrado</p>;

  return (
    <Layout>
      <main className="main-content">
        <div className="content-wrapper">
          <div className="content-header">
            <h2 className="content-title">Permissões do Perfil {role.name}</h2>
            <nav className="breadcrumb">
              <Link href="/painel/dashboard" className="breadcrumb-link">
                Dashboard
              </Link>
              <span> / </span>
              <span>Permissões do Perfil</span>
            </nav>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {/* Permissões */}
          <div className="flex-1 min-w-0">
            <div className="content-box">
              <div className="content-box-header flex justify-between items-center">
                <h3 className="content-box-title">Permissões do perfil</h3>
                <div className="content-box-btn">
                  <Link
                    href="/painel/roles/create"
                    className="btn-success flex items-center gap-1"
                  >
                    <LuCirclePlus /> <span>Novo</span>
                  </Link>
                </div>
              </div>
              <div className="content-box-body">
                <input
                  type="text"
                  placeholder="Buscar permissão..."
                  className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 mb-4"
                  value={searchPermission}
                  onChange={(e) => setSearchPermission(e.target.value)}
                />
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr className="table-row-header">
                        <th className="table-header">ID</th>
                        <th className="table-header">Nome</th>
                        <th className="table-header center">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.length > 0 ? (
                        permissions.map((p) => (
                          <tr key={p.id}>
                            <td className="table-body">{p.id}</td>
                            <td className="table-body">{p.name}</td>
                            <td className="table-body table-actions text-center">
                              <button
                                className={`px-2 py-1 rounded text-white ${
                                  rolePermissions.includes(p.id)
                                    ? "bg-green-600"
                                    : "bg-red-600"
                                }`}
                                onClick={() => togglePermission(p.id)}
                              >
                                {rolePermissions.includes(p.id)
                                  ? "Liberada"
                                  : "Bloqueada"}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-4">
                            Nenhuma Permissão encontrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {permissionsLastPage > 1 && (
                    <Pagination
                      currentPage={permissionsPage}
                      lastPage={permissionsLastPage}
                      onPageChange={setPermissionsPage}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Usuários */}
          <div className="flex-1 min-w-0">
            <div className="content-box">
              <div className="content-box-header">
                <h3 className="content-box-title">Usuários</h3>
              </div>
              <div className="content-box-body">
                <input
                  type="text"
                  placeholder="Buscar usuário..."
                  className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 mb-4"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr className="table-row-header">
                        <th className="table-header">ID</th>
                        <th className="table-header">Nome</th>
                        <th className="table-header">E-mail</th>
                        <th className="table-header center">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((u) => {
                          const hasRole = u.roles?.some(
                            (r) => r.id === role.id
                          );
                          return (
                            <tr key={u.id}>
                              <td className="table-body">{u.id}</td>
                              <td className="table-body">{u.name}</td>
                              <td className="table-body">{u.email}</td>
                              <td className="table-body table-actions text-center">
                                <button
                                  className={`px-2 py-1 rounded text-white ${
                                    hasRole ? "bg-red-600" : "bg-green-600"
                                  }`}
                                  onClick={() => toggleUser(u.id)}
                                >
                                  {hasRole ? "Remover" : "Vincular"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-4">
                            Nenhum Usuário encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {usersLastPage > 1 && (
                    <Pagination
                      currentPage={usersPage}
                      lastPage={usersLastPage}
                      onPageChange={setUsersPage}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
