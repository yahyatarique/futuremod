import * as React from "react";
import { cn } from "../../lib/utils";
import { Label } from "./label";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

function FormField({ className, label, hint, error, required, children, ...props }: FormFieldProps) {
  const id = React.useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string; error?: boolean }>, {
            id,
            error: !!error,
          })
        : children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export { FormField };