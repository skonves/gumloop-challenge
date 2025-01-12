import {
  ChangeEventHandler,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  useCallback,
  useState,
} from "react";

// Define props as InputHTMLAttributes to support all native input props
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

// ForwardRef component to handle refs
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <div>
        <label htmlFor={props.id}>{props.label}</label>
        <input
          ref={ref}
          id={props.id}
          onMouseDownCapture={(e) => e.stopPropagation()}
          {...props}
        />
      </div>
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
