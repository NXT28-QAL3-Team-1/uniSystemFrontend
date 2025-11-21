import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative z-50 w-full max-w-lg mx-4">{children}</div>
        </div>
    );
};

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "bg-white dark:bg-gray-800 rounded-lg shadow-xl",
            className
        )}
        {...props}>
        {children}
    </div>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700",
            className
        )}
        {...props}
    />
);

const DialogTitle = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
        className={cn(
            "text-xl font-semibold text-gray-900 dark:text-white",
            className
        )}
        {...props}
    />
);

const DialogDescription = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
        className={cn(
            "text-sm text-gray-500 dark:text-gray-400 mt-1",
            className
        )}
        {...props}
    />
);

const DialogClose = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <X className="w-5 h-5" />
    </button>
);

const DialogBody = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-6", className)} {...props} />
);

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700",
            className
        )}
        {...props}
    />
);

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogBody,
    DialogFooter,
};
