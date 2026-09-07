import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variants = {
    default: "text-gray-100 bg-gray-700",
    success: "text-green-100 bg-green-700",
    warning: "text-yellow-100 bg-yellow-700",
    danger: "text-red-100 bg-red-700",
    info: "text-blue-100 bg-primary",
  };

  return (
    <span
      className={` inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-xl ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
