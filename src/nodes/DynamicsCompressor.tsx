import { Handle, Position } from "@xyflow/react";
import { AppNode, DynamicsCompressorData, NodeComponent } from "./types";
import { useSetNodes } from "../components/ChangeHandlerContext";
import { Form, NumberInput } from "../components/Inputs";
import { useCallback } from "react";
import { NodeBase } from "./NodeBase";

function numberOrUnderfined(value: string): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return isNaN(number) ? undefined : number;
}

const DynamicsCompressor: NodeComponent<DynamicsCompressorData> = ({
  id,
  data,
  selected,
}) => {
  const setNodes = useSetNodes();

  const handleChange = useCallback(
    (change: Partial<DynamicsCompressorData["data"]>) => {
      setNodes((prevNodes) => {
        return prevNodes.map<AppNode>((node) => {
          if (node.id === id && node.type === "oscillator") {
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
    <NodeBase heading="Dynamics Compressor" selected={selected}>
      <Form>
        <NumberInput
          label="attack"
          id={`${id}-attack`}
          placeholder="number"
          value={data.attack}
          onChange={(e) =>
            handleChange({ attack: numberOrUnderfined(e.target.value) })
          }
        />
        <NumberInput
          label="knee"
          id={`${id}-knee`}
          placeholder="number"
          value={data.knee}
          onChange={(e) =>
            handleChange({ knee: numberOrUnderfined(e.target.value) })
          }
        />
        <NumberInput
          label="ratio"
          id={`${id}-ratio`}
          placeholder="number"
          value={data.ratio}
          onChange={(e) =>
            handleChange({ ratio: numberOrUnderfined(e.target.value) })
          }
        />
        <NumberInput
          label="release"
          id={`${id}-release`}
          placeholder="number"
          value={data.release}
          onChange={(e) =>
            handleChange({ release: numberOrUnderfined(e.target.value) })
          }
        />
        <NumberInput
          label="threshold"
          id={`${id}-threshold`}
          placeholder="number"
          value={data.threshold}
          onChange={(e) =>
            handleChange({ threshold: numberOrUnderfined(e.target.value) })
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

export default DynamicsCompressor;
