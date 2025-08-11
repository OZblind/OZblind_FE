import { cn } from "@utils/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "btn font-semibold transition duration-150";

    const variantStyles: Record<Variant, string> = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      danger: "btn-error",
    };

    const sizeStyles: Record<Size, string> = {
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
