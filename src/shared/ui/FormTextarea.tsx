import React, { forwardRef } from "react";

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className = "", error, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors text-sm resize-y min-h-[100px] ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-gray-300 focus:border-black"
        } ${className}`}
        {...props}
      />
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
