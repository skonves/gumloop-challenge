import { Handle, Position } from "@xyflow/react";
import { AppNode, AudioDestinationData, NodeComponent } from "./types";
import { useSetNodes } from "../components/ChangeHandlerContext";
import { NumberInput } from "../components/Inputs";
import { useCallback } from "react";

function numberOrUnderfined(value: string): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return isNaN(number) ? undefined : number;
}

const AudioDestination: NodeComponent<AudioDestinationData> = ({
  id,
  data,
}) => {
  const setNodes = useSetNodes();

  const handleChange = useCallback(
    (change: Partial<AudioDestinationData["data"]>) => {
      setNodes((prevNodes) => {
        return prevNodes.map<AppNode>((node) => {
          if (node.id === id && node.type === "audio-destination") {
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
    <div
      style={{ padding: "10px", border: "1px solid #000", borderRadius: "5px" }}
    >
      <h1>AudioDestinationNode</h1>
      <form>
        <NumberInput
          label="maxChannelCount"
          id={`${id}-maxChannelCount`}
          placeholder="maxChannelCount"
          value={data.maxChannelCount}
          onChange={(e) =>
            handleChange({
              maxChannelCount: numberOrUnderfined(e.target.value),
            })
          }
        />
      </form>

      <pre>{JSON.stringify(data, null, 2)}</pre>

      <Handle
        type="target"
        position={Position.Top}
        id={`${id}-in`}
        style={{ left: "50%" }}
      />
    </div>
  );
};

export default AudioDestination;
