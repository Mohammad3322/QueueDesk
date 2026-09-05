import React from "react";

interface SpinnerProps {
  label?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  label = "Loading...",
  className = "",
}) => {
  const labelId = React.useId();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-labelledby={labelId}
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="flex justify-center my-[50px]">
        <div className="w-5 h-5 bg-blue-400 rounded-full mx-[0.5px] animate-up-and-down" />

        <div
          className="w-5 h-5 bg-blue-400 rounded-full mx-[0.5px] animate-up-and-down"
          style={{ animationDelay: "0.3s" }}
        />

        <div
          className="w-5 h-5 bg-blue-400 rounded-full mx-[0.5px] animate-up-and-down"
          style={{ animationDelay: "0.6s" }}
        />
      </div>
      <p id={labelId} className="mt-3 text-sm text-gray-500">
        {label}
      </p>
    </div>
  );
};
