import React from "react";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  optionalNote?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export default function FormField({
  label,
  required = false,
  optional = false,
  optionalNote,
  error,
  children,
  className = "",
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={htmlFor} className="font-bold block text-sm">
        {label}
        {required && <span className="text-orange-500 ml-1">*</span>}
        {optional && (
          <span className="text-gray-400 font-normal ml-1">
            {optionalNote || "(Opsional)"}
          </span>
        )}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
