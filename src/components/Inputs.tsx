import {
  ChangeEventHandler,
  FormHTMLAttributes,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  useCallback,
  useState,
} from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref: ForwardedRef<HTMLButtonElement>) => {
  const { className, ...buttonProps } = props;

  return (
    <button
      ref={ref}
      className={`text-lg bg-blue-100 hover:bg-blue-200 text-blue-500 font-semibold py-2 px-4 rounded-lg border border-blue-500 transition-colors flex items-center gap-2 ${className}`}
      {...buttonProps}
    />
  );
});

export const Form = forwardRef<
  HTMLFormElement,
  FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => {
  return (
    <form
      ref={ref}
      className={`grid grid-cols-[auto,1fr] gap-2 ${className ?? ""}`}
      {...props}
    />
  );
});

Form.displayName = "Form";

// Define props as InputHTMLAttributes to support all native input props
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

// ForwardRef component to handle refs
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <>
        <label
          className="text-right font-bold cursor-pointer text-gray-700"
          htmlFor={props.id}
        >
          {props.label}
        </label>
        <input
          ref={ref}
          className={`cursor-pointer ${className}`}
          id={props.id}
          onMouseDownCapture={(e) => e.stopPropagation()}
          {...props}
        />
      </>
    );
  }
);

export const NumberInput = forwardRef<HTMLInputElement, InputProps>(
  (props, ref: ForwardedRef<HTMLInputElement>) => {
    const { onChange, value, ...rest } = props;
    const [controlledValue, setControlledValue] = useState(value);

    const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
      (e) => {
        const numericValue = parseFloat(e.target.value);

        if (!isNaN(numericValue) || !e.target.value) {
          setControlledValue(e.target.value);
          onChange?.(e);
        }
      },
      [onChange]
    );

    return (
      <Input
        ref={ref}
        id={props.id}
        onMouseDownCapture={(e) => e.stopPropagation()}
        onChange={handleChange}
        value={controlledValue}
        {...rest}
        type="number"
      />
    );
  }
);

// Define props as InputHTMLAttributes to support all native input props
interface SelectInputProps extends InputHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  (props, ref: ForwardedRef<HTMLSelectElement>) => {
    return (
      <>
        <label
          className="text-right font-bold cursor-pointer text-gray-700"
          htmlFor={props.id}
        >
          {props.label}
        </label>
        <select ref={ref} id={props.id} {...props} />
      </>
    );
  }
);
