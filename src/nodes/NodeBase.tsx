import React, { forwardRef } from "react";

export interface NodeBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  selected: boolean | undefined;
}

export const NodeBase = forwardRef<HTMLDivElement, NodeBaseProps>(
  (props, ref) => {
    const { children, heading, className, ...rest } = props;

    return (
      <div
        ref={ref}
        className={`p-4 rounded-lg bg-white border ${
          props.selected
            ? "outline border-blue-500 outline-blue-500 outline-1"
            : "border-black"
        } ${className} `}
        {...rest}
      >
        <h1 className="font-bold mb-4">{heading}</h1>
        {children}
      </div>
    );
  }
);

NodeBase.displayName = "NodeBase";
