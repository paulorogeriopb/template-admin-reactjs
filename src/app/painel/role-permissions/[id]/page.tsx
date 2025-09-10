"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
  title?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles?: Role[];
}

export default function RolePermissionPage({ roleId }: { roleId: number }) {
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/role-permissions/${roleId}`);
      setRole(res.data.data.role);
      setPermissions(res.data.data.permissions.data); // paginação retorna em "data"
      setRolePermissions(res.data.data.rolePermissions);
      setUsers(res.data.data.users);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (permissionId: number) => {
    await axios.patch(`/api/v1/role-permissions/${roleId}/${permissionId}`);
    fetchData(); // recarrega dados
  };

  const toggleUser = async (userId: number) => {
    await axios.patch(
      `/api/v1/role-permissions/${roleId}/toggle-user/${userId}`
    );
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [roleId]);

  if (loading) return <p>Carregando...</p>;
  if (!role) return <p>Papel não encontrado</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Permissões do Papel: {role.name}</h2>

      {/* Lista de Permissões */}
      <div>
        <h3 className="mb-2 font-semibold">Permissões</h3>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Ação</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((p) => (
              <tr key={p.id}>
                <td className="p-2 border">{p.id}</td>
                <td className="p-2 border">{p.title ?? p.name}</td>
                <td className="p-2 border text-center">
                  <button
                    className={`px-2 py-1 rounded text-white ${
                      rolePermissions.includes(p.id)
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                    onClick={() => togglePermission(p.id)}
                  >
                    {rolePermissions.includes(p.id) ? "Liberada" : "Bloqueada"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lista de Usuários */}
      <div>
        <h3 className="mb-2 font-semibold">Usuários</h3>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">E-mail</th>
              <th className="p-2 border">Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const hasRole = u.roles?.some((r: Role) => r.id === role.id);
              return (
                <tr key={u.id}>
                  <td className="p-2 border">{u.id}</td>
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border text-center">
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
