import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { LoginInput } from "../../components/ui/LoginInput";
import { Button } from "../../components/ui/Button";
import { APP_ROUTES } from "../../constants";

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(APP_ROUTES.dashboard, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(email.trim(), password);
    if (!success) {
      setError("Invalid email or password. Please try again.");
      return;
    }
    navigate(APP_ROUTES.dashboard, { replace: true });
  };

  if (isAuthenticated) {
    return <Navigate to={APP_ROUTES.dashboard} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex items-center justify-center w-24 h-24  rounded-full ">
              <img
                src="/Logo.png"
                alt="QueueDesk logo"
                className="w-18 h-18 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            QueueDesk
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to manage your support queue
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <LoginInput
              id="login-email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@queuedesk.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <LoginInput
              id="login-password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <div
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                role="alert"
              >
                {error}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 space-y-1">
          <p>Demo accounts (password: 11111111)</p>
          <p>
            Admin@queuedesk.com (Manager) · Agent@queuedesk.com (Agent) ·
            elena@queuedesk.com (Agent) · david@queuedesk.com (Agent)
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
