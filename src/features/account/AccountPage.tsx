import React, { useState } from "react";
import { useUser } from "../../hooks/useUser";
import { useUsers } from "../../hooks/useUsers";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Alert } from "../../components/ui/Alert";

export const AccountPage: React.FC = () => {
  const { currentUser, setCurrentUser } = useUser();
  const { updateUser } = useUsers();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState(currentUser.password);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: string; email?: string } = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const updates = { name: name.trim(), email: email.trim() };
    void updateUser(currentUser.id, updates).then(() => {
      setCurrentUser({ ...currentUser, ...updates });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-500 text-sm">
          View your profile and update your account details.
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <img
            src={currentUser.avatarUrl || ""}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200"
          />
          <div>
            <p className="text-lg font-bold text-gray-900">
              {currentUser.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant={currentUser.role === "manager" ? "info" : "default"}
              >
                {currentUser.role === "manager" ? "Manager" : "Agent"}
              </Badge>
              <span className="text-xs text-gray-500">{currentUser.id}</span>
            </div>
          </div>
        </div>

        {saved && (
          <div className="pt-4">
            <Alert variant="success" title="Profile updated">
              Your account details have been saved.
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4" noValidate>
          <Input
            id="account-name"
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            id="account-email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            id="account-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Capabilities">
        <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
          {currentUser.role === "manager" ? (
            <>
              <li>Create, edit, and delete tickets</li>
              <li>Assign tickets to any agent</li>
              <li>Manage team members and roles</li>
              <li>View support analytics</li>
            </>
          ) : (
            <>
              <li>Create tickets</li>
              <li>Work tickets assigned to you</li>
              <li>Claim unassigned tickets</li>
            </>
          )}
        </ul>
      </Card>
    </div>
  );
};
