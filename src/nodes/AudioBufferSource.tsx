import { Handle, Position } from "@xyflow/react";
import { AppNode, AudioBufferSourceData, NodeComponent } from "./types";
import { useSetNodes } from "../components/ChangeHandlerContext";
import { Input, NumberInput } from "../components/Inputs";
import { useCallback } from "react";

function numberOrUnderfined(value: string): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return isNaN(number) ? undefined : number;
}

const AudioBufferSource: NodeComponent<AudioBufferSourceData> = ({
  id,
  data,
}) => {
  const setNodes = useSetNodes();

  const handleChange = useCallback(
    (change: Partial<AudioBufferSourceData["data"]>) => {
      setNodes((prevNodes) => {
        return prevNodes.map<AppNode>((node) => {
          if (node.id === id && node.type === "audio-buffer-source") {
            const newData = { ...node.data, ...change };

            if (!newData.loop) {
              delete newData.loopEnd;
              delete newData.loopStart;
            }

            return {
              ...node,
              data: newData,
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
      <h1>AudioBufferSourceNode</h1>
      <form>
        <Input
          label="file"
          id={`${id}-file`}
          type="file"
          accept="audio/*"
          onChange={async (e) => handleChange({ file: e.target.files?.[0] })}
        />
        <NumberInput
          label="detune"
          id={`${id}-detune`}
          placeholder="detune"
          value={data.detune}
          onChange={(e) =>
            handleChange({ detune: numberOrUnderfined(e.target.value) })
          }
        />
        <Input
          label="loop"
          id={`${id}-loop`}
          type="checkbox"
          placeholder="loop"
          checked={data.loop}
          onChange={(e) => handleChange({ loop: e.target.checked })}
        />
        {data.loop && (
          <>
            <NumberInput
              label="loopEnd"
              id={`${id}-loopEnd`}
              placeholder="loopEnd"
              value={data.loopEnd}
              onChange={(e) =>
                handleChange({ loopEnd: numberOrUnderfined(e.target.value) })
              }
            />
            <NumberInput
              label="loopStart"
              id={`${id}-loopStart`}
              placeholder="loopStart"
              value={data.loopStart}
              onChange={(e) =>
                handleChange({ loopStart: numberOrUnderfined(e.target.value) })
              }
            />
          </>
        )}
        <NumberInput
          label="playbackRate"
          id={`${id}-playbackRate`}
          placeholder="playbackRate"
          value={data.playbackRate}
          onChange={(e) =>
            handleChange({ playbackRate: numberOrUnderfined(e.target.value) })
          }
        />
      </form>

      <pre>{JSON.stringify(data, null, 2)}</pre>

      <Handle
        type="source"
        position={Position.Bottom}
        id={`${id}-out`}
        style={{ left: "50%" }}
      />
    </div>
  );
};

export default AudioBufferSource;
