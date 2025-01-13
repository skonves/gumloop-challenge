import { Handle, Position } from "@xyflow/react";
import { AppNode, StereoPannerData, NodeComponent } from "./types";
import { useSetNodes } from "../components/ChangeHandlerContext";
import { Form, NumberInput } from "../components/Inputs";
import { useCallback } from "react";
import { NodeBase } from "./NodeBase";

function numberOrUnderfined(value: string): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return isNaN(number) ? undefined : number;
}

const StereoPanner: NodeComponent<StereoPannerData> = ({
  id,
  data,
  selected,
}) => {
  const setNodes = useSetNodes();

  const handleChange = useCallback(
    (change: Partial<StereoPannerData["data"]>) => {
      setNodes((prevNodes) => {
        return prevNodes.map<AppNode>((node) => {
          if (node.id === id && node.type === "stereo-panner") {
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
    <NodeBase heading="StereoPanner" selected={selected}>
      <Form>
        <NumberInput
          label="pan"
          id={`${id}-pan`}
          placeholder="number"
          value={data.pan}
          onChange={(e) =>
            handleChange({ pan: numberOrUnderfined(e.target.value) })
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

export default StereoPanner;
