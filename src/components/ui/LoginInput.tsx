import React from "react";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

interface InputProps
  extends Omit<TextFieldProps, "label" | "error" | "inputProps"> {
  label?: string;
  error?: string;
  maxLength?: number;
  minLength?: number;
}

export const LoginInput: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  maxLength,
  minLength,
  ...props
}) => {
  const fieldId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <TextField
        id={fieldId}
        error={!!error}
        helperText={error}
        variant="outlined"
        size="small"
        fullWidth
        className={className}
        slotProps={{
          htmlInput: { maxLength, minLength },
          formHelperText: { sx: { mx: 0, mt: "4px" } },
        }}
        {...props}
      />
    </div>
  );
};