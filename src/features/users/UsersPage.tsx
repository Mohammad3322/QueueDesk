import React, { useState } from "react";
import type { User, UserRole } from "../../types";
import { useUser } from "../../hooks/useUser";
import { useUsers } from "../../hooks/useUsers";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import { Alert } from "../../components/ui/Alert";
import { canManageUsers } from "../../utils/permissions";

const ROLE_LABELS: Record<UserRole, string> = {
  manager: "Manager",
  agent: "Agent",
};

export const UsersPage: React.FC = () => {
  const { currentUser } = useUser();
  const {
    users,
    loadState,
    errorMessage,
    refresh,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Create-user form state
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("agent");
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  if (!canManageUsers(currentUser)) {
    return (
      <Card>
        <h1 className="text-xl font-bold text-gray-900 mb-3">
          User Management
        </h1>
        <Alert variant="warning" title="Manager-only view">
          Only managers can manage users and assign roles. Switch to the Manager
          persona (Sarah Connor) from the header to access this page.
        </Alert>
      </Card>
    );
  }

  if (loadState === "loading" && users.length === 0) {
    return (
      <Spinner
        label="Loading users..."
        className="bg-white border border-gray-200 rounded-xl"
      />
    );
  }

  if (loadState === "error" && users.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Could not load users"
          description={errorMessage || "Something went wrong. Try again."}
          actionLabel="Retry"
          onAction={refresh}
        />
      </Card>
    );
  }

  const handleRoleChange = (user: User, role: UserRole) => {
    if (role === user.role) return;
    void updateUser(user.id, { role });
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteUser(pendingDelete.id);
      setPendingDelete(null);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete user",
      );
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: string; email?: string } = {};
    if (!newName.trim()) nextErrors.name = "Name is required.";
    if (
      !newEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const id = `usr-${Date.now()}`;
    const user: User = {
      id,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
    };
    void createUser(user).then(() => {
      setShowForm(false);
      setNewName("");
      setNewEmail("");
      setNewRole("agent");
    });
  };

  const isSelf = (user: User) => user.id === currentUser.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team &amp; Roles</h1>
          <p className="text-gray-500 text-sm">
            Manage users and assign roles for your support team.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Close Form" : "+ Add User"}
        </Button>
      </div>

      {showForm && (
        <Card title="Add team member">
          <form onSubmit={handleCreate} className="space-y-4" noValidate>
            <Input
              id="new-user-name"
              label="Full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              error={formErrors.name}
            />
            <Input
              id="new-user-email"
              label="Email address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              error={formErrors.email}
            />
            <Select
              id="new-user-role"
              label="Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
            >
              <option value="agent">Agent</option>
              <option value="manager">Manager</option>
            </Select>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create User
              </Button>
            </div>
          </form>
        </Card>
      )}

      {deleteError && (
        <Alert variant="danger" title="Delete failed">
          {deleteError}
        </Alert>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || ""}
                      alt={user.name}
                      className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name}
                        {isSelf(user) && (
                          <span className="ml-1.5 text-xs font-normal text-blue-600">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.role === "manager" ? "info" : "default"}
                    >
                      {ROLE_LABELS[user.role]}
                    </Badge>
                    <Select
                      aria-label={`Role for ${user.name}`}
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user, e.target.value as UserRole)
                      }
                      className="text-xs px-2 py-1 max-w-27.5"
                    >
                      <option value="agent">Agent</option>
                      <option value="manager">Manager</option>
                    </Select>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSelf(user)}
                    title={
                      isSelf(user)
                        ? "You cannot delete your own account"
                        : `Delete ${user.name}`
                    }
                    onClick={() => {
                      setPendingDelete(user);
                      setDeleteError(null);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Delete user?"
      >
        {pendingDelete && (
          <>
            <p className="text-sm text-gray-600">
              Removing{" "}
              <span className="font-medium">
                {pendingDelete.name} ({pendingDelete.email})
              </span>{" "}
              will revoke their access immediately. Their previously assigned
              tickets stay in the system but will show as unassigned.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete User
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
