import React from "react";
import FormControl from "@mui/material/FormControl";
import NativeSelect from "@mui/material/NativeSelect";
import FormHelperText from "@mui/material/FormHelperText";

interface SelectProps {
  id?: string;
  name?: string;
  label?: React.ReactNode;
  error?: string;
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  fullWidth?: boolean;
  className?: string;
  "aria-label"?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  error,
  value,
  onChange,
  disabled,
  required,
  autoFocus,
  fullWidth = true,
  className = "",
  "aria-label": ariaLabel,
  children,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <FormControl
        fullWidth={fullWidth}
        size="small"
        error={!!error}
        disabled={disabled}
        required={required}
        className={className}
        sx={{ maxWidth: "100%" }}
      >
        <NativeSelect
          variant="outlined"
          value={value ?? ""}
          onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
          inputProps={{
            id,
            name,
            autoFocus,
            "aria-label": ariaLabel,
            "aria-invalid": !!error || undefined,
          }}
          sx={{
            borderRadius: 1,
            "& .MuiNativeSelect-select": {
              fontSize: "0.875rem",
              lineHeight: 1.6,
              py: "8.5px",
              px: "14px",
              pr: "32px",
            },
            "&:hover fieldset": {
              borderColor: "rgba(13, 92, 182, 0.6)",
            },
          }}
        >
          {children}
        </NativeSelect>
        {error && (
          <FormHelperText sx={{ mx: 0, mt: "4px" }}>
            {error}
          </FormHelperText>
        )}
      </FormControl>
    </div>
  );
};