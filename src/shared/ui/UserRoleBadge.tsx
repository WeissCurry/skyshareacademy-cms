import React from "react";

export interface UserRoleBadgeProps {
  roles?: string[] | null;
  role?: string | null;
  className?: string;
}

const ROLE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  mentor: {
    label: "Mentor",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
  },
  parent: {
    label: "Parent",
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-300",
  },
  talent: {
    label: "Talent",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-300",
  },
  verified_visitor: {
    label: "Verified Visitor",
    bg: "bg-teal-50",
    text: "text-teal-800",
    border: "border-teal-300",
  },
  visitor: {
    label: "Visitor",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
  },
  admin: {
    label: "Admin",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
  },
};

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  roles,
  role,
  className = "",
}) => {
  // Normalize roles list
  let roleList: string[] = [];
  if (Array.isArray(roles) && roles.length > 0) {
    roleList = roles.filter(Boolean);
  } else if (role) {
    roleList = [role];
  }

  if (roleList.length === 0) {
    roleList = ["visitor"];
  }

  return (
    <div className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {roleList.map((r) => {
        const key = r.toLowerCase().trim();
        const conf = ROLE_CONFIG[key] || {
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-300",
        };

        return (
          <span
            key={key}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${conf.bg} ${conf.text} ${conf.border}`}
          >
            {conf.label}
          </span>
        );
      })}
    </div>
  );
};
