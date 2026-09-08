import React from "react";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

interface TextAreaProps
  extends Omit<TextFieldProps, "label" | "error" | "multiline" | "rows"> {
  label?: React.ReactNode;
  error?: string;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = "",
  id,
  rows = 3,
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
        multiline
        minRows={rows}
        className={className}
        slotProps={{
          formHelperText: { sx: { mx: 0, mt: "4px" } },
        }}
        {...props}
      />
    </div>
  );
};