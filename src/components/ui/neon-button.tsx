import React from 'react'
import { cn } from '@/lib/utils'
import { VariantProps, cva } from "class-variance-authority";

const buttonVariants = cva(
    "relative group border text-foreground text-center rounded-full overflow-hidden",
    {
        variants: {
            variant: {
                default: "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-white",
                solid: "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-[0_0_20px_rgba(79,70,229,0.4)]",
                ghost: "border-transparent bg-transparent hover:border-zinc-700 hover:bg-white/5",
            },
            size: {
                default: "px-7 py-2.5",
                sm: "px-4 py-1.5 text-sm",
                lg: "px-10 py-3.5 text-lg font-medium",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { neon?: boolean }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, neon = true, size, variant, children, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            >
                <span className={cn("absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 inset-y-0 bg-gradient-to-r w-3/4 mx-auto from-transparent dark:via-indigo-400 via-indigo-500 to-transparent hidden", neon && "block")} />
                <span className="relative z-10">{children}</span>
                <span className={cn("absolute group-hover:opacity-60 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent dark:via-cyan-400 via-indigo-500 to-transparent hidden", neon && "block")} />
                {neon && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent pointer-events-none" />
                )}
            </button>
        );
    }
)

Button.displayName = 'Button';

export { Button, buttonVariants };
