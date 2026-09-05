import React from "react";

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = "info",
  onDismiss,
  className = "",
}) => {
  const variants = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
    danger: "border-red-200 bg-red-50 text-red-700",
  };

  const iconVariants = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${variants[variant]} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 font-bold ${iconVariants[variant]}`}
      >
        {variant === "danger" ? "!" : variant === "success" ? "✓" : "i"}
      </span>
      <div className="flex-1 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="text-current opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current rounded"
        >
          ✕
        </button>
      )}
    </div>
  );
};
