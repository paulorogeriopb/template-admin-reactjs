"use client";

import { useEffect, useState } from "react";
import instance from "@/services/api";
import Link from "next/link";
import Layout from "@/components/Painel/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LuCirclePlus } from "react-icons/lu";
import AlertMessageDismissible from "@/components/AlertMessageDismissible";

type Role = { id: number; name: string };
type Permission = { id: number; name: string; title?: string };
type User = { id: number; name: string; email: string; roles?: Role[] };

interface RolePermissionsResponse {
  role: Role;
  permissions: { data: Permission[] };
  rolePermissions: number[];
  users: User[];
}

interface Props {
  params: { roleId: string };
}

export default function RolePermissionsPage({ params }: Props) {
  const roleId = Number(params.roleId);

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await instance.get<{ data: RolePermissionsResponse }>(
        `/role-permissions/${roleId}`
      );
      const data = res.data.data;
      setRole(data.role);
      setPermissions(data.permissions.data);
      setRolePermissions(data.rolePermissions);
      setUsers(data.users);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Erro desconhecido"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(roleId)) fetchData();
  }, [roleId]);

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

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!role) return <p>Papel não encontrado</p>;

  return (
    <Layout>
      <main className="main-content">
        {/* Header */}
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

        {/* Permissões */}
        <div className="content-box">
          <div className="content-box-header flex justify-between items-center">
            <h3 className="content-box-title">Permissões do perfil</h3>
            <div className="content-box-btn">
              <Link
                href="/painel/roles/create"
                className="btn-success flex items-center gap-1"
              >
                <LuCirclePlus />
                <span>Novo</span>
              </Link>
            </div>
          </div>
          <div className="content-box-body">
            {loading && <LoadingSpinner />}
            <AlertMessageDismissible type="error" message={error} />

            <div className="table-container mt-6">
              {!loading && !error && (
                <table className="table">
                  <caption className="sr-only">Lista de Permissões</caption>
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
                        <tr className="table-row-body" key={p.id}>
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
              )}
            </div>
          </div>
        </div>

        {/* Usuários */}
        <div className="content-box mt-6">
          <div className="content-box-header">
            <h3 className="content-box-title">Usuários</h3>
          </div>
          <div className="content-box-body">
            {!loading && !error && (
              <table className="table">
                <caption className="sr-only">Lista de Usuários</caption>
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
                      const hasRole = u.roles?.some((r) => r.id === role.id);
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
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
