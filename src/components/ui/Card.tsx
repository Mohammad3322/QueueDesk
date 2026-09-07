import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleStyle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  titleStyle,
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-xs p-5 ${className}!`}
    >
      {title && (
        <h3
          className={`text-lg font-semibold text-gray-900 mb-4 ${titleStyle}!`}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
