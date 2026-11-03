import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 animate-pulse motion-reduce:animate-none rounded-lg ${className}`}
      {...props}
    />
  );
}
