import React from "react";

export interface FormSectionHeaderProps {
  icon?: string;
  iconAlt?: string;
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export default function FormSectionHeader({
  icon,
  iconAlt = "",
  title,
  className = "",
  children,
}: FormSectionHeaderProps) {
  return (
    <div
      className={`bg-background p-4 gap-4 flex items-center justify-between rounded-xl ${className}`}
    >
      <div className="flex items-center gap-4">
        {icon && <img className="w-6 h-6 object-contain" src={icon} alt={iconAlt} />}
        <h4 className="headline-4">{title}</h4>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
