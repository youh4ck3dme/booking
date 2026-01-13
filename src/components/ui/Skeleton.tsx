import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rect",
  width,
  height,
}) => {
  const style: React.CSSProperties = {
    width,
    height,
  };

  const variantClasses = {
    text: "rounded-sm h-4 w-3/4",
    rect: "rounded-md",
    circle: "rounded-full",
  };

  return (
    <div
      className={`animate-pulse bg-white/5 ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const BookingSkeleton = () => (
  <div className="space-y-md">
    <Skeleton height={120} className="w-full" />
    <Skeleton height={120} className="w-full" />
    <Skeleton height={120} className="w-full" />
  </div>
);
