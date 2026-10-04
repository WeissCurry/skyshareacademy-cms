import React, { forwardRef } from "react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors text-sm ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-gray-300 focus:border-black"
        } ${className}`}
        {...props}
      />
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
