import { Handle, Position } from "@xyflow/react";
import { AppNode, DelayData, NodeComponent } from "./types";
import { useSetNodes } from "../components/ChangeHandlerContext";
import { Form, NumberInput } from "../components/Inputs";
import { useCallback } from "react";
import { NodeBase } from "./NodeBase";

function numberOrUnderfined(value: string): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return isNaN(number) ? undefined : number;
}

const Delay: NodeComponent<DelayData> = ({ id, data, selected }) => {
  const setNodes = useSetNodes();

  const handleChange = useCallback(
    (change: Partial<DelayData["data"]>) => {
      setNodes((prevNodes) => {
        return prevNodes.map<AppNode>((node) => {
          if (node.id === id && node.type === "delay") {
            return {
              ...node,
              data: { ...node.data, ...change },
            };
          }

          return node;
        });
      });
    },
    [id, setNodes]
  );

  return (
    <NodeBase heading="Delay" selected={selected}>
      <Form>
        <NumberInput
          label="delayTime"
          id={`${id}-delayTime`}
          placeholder="number"
          value={data.delayTime}
          onChange={(e) =>
            handleChange({ delayTime: numberOrUnderfined(e.target.value) })
          }
        />
      </Form>

      <Handle
        type="target"
        position={Position.Top}
        id={`${id}-in`}
        style={{ left: "50%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${id}-out`}
        style={{ left: "50%" }}
      />
    </NodeBase>
  );
};

export default Delay;
