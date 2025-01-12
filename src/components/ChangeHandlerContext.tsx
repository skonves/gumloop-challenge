import { createContext, PropsWithChildren, useContext } from "react";
import { AppNode } from "../nodes/types";

// Create the context
const SetNodesContext = createContext<
  React.Dispatch<React.SetStateAction<AppNode[]>> | undefined
>(undefined);

export const SetNodesProvider: React.FC<
  PropsWithChildren<{
    setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>;
  }>
> = ({ children, setNodes }) => {
  return (
    <SetNodesContext.Provider value={setNodes}>
      {children}
    </SetNodesContext.Provider>
  );
};

export const useSetNodes = () => {
  const context = useContext(SetNodesContext);
  if (!context) {
    throw new Error("useSetNodes must be used within a SetNodesProvider");
  }
  return context;
};
