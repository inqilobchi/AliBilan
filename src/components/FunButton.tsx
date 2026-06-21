import { motion } from "framer-motion";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "accent" | "success" | "ghost";
type Size = "md" | "lg" | "xl";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "ref"> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success text-success-foreground",
  ghost: "bg-card text-card-foreground border-2 border-border",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-3 text-base rounded-2xl",
  lg: "px-7 py-4 text-lg rounded-2xl",
  xl: "px-8 py-5 text-2xl rounded-3xl",
};

export const FunButton = forwardRef<HTMLButtonElement, Props>(function FunButton(
  { variant = "primary", size = "lg", icon, children, className = "", ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96, y: 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={`shadow-pop font-bold inline-flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {icon}
      {children}
    </motion.button>
  );
});
