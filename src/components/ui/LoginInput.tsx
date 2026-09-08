import React, { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const LoginInput: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 border rounded-lg shadow-xs text-sm focus:outline-none focus:ring-2 transition-colors ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
        } ${className}`}
        {...props}
      />{" "}
      {/* <Autocomplet
        sx={{ width: 300 }}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        isOptionEqualToValue={(option, value) => option.title === value.title}
        getOptionLabel={(option) => option.title}
        options={options}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Asynchronous"
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                endAdornment: (
                  <React.Fragment>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.slotProps.input.endAdornment}
                  </React.Fragment>
                ),
              },
            }}
          />
        )}
      /> */}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
