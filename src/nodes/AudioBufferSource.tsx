import { Handle, Position } from "@xyflow/react";
import { AppNode, AudioBufferSourceData, NodeComponent } from "./types";
import { useSetNodes } from "../components/ChangeHandlerContext";
import { Form, Input, NumberInput } from "../components/Inputs";
import { useCallback } from "react";
import { NodeBase } from "./NodeBase";

function numberOrUnderfined(value: string): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return isNaN(number) ? undefined : number;
}

const AudioBufferSource: NodeComponent<AudioBufferSourceData> = ({
  id,
  data,
  selected,
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
    <NodeBase heading="Audio Buffer Source" selected={selected}>
      <Form>
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
          placeholder="number"
          value={data.detune}
          onChange={(e) =>
            handleChange({ detune: numberOrUnderfined(e.target.value) })
          }
        />
        <Input
          label="loop"
          id={`${id}-loop`}
          type="checkbox"
          checked={data.loop}
          onChange={(e) => handleChange({ loop: e.target.checked })}
        />
        {data.loop && (
          <>
            <NumberInput
              label="loopEnd"
              id={`${id}-loopEnd`}
              placeholder="number"
              value={data.loopEnd}
              onChange={(e) =>
                handleChange({ loopEnd: numberOrUnderfined(e.target.value) })
              }
            />
            <NumberInput
              label="loopStart"
              id={`${id}-loopStart`}
              placeholder="number"
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
          placeholder="number"
          value={data.playbackRate}
          onChange={(e) =>
            handleChange({ playbackRate: numberOrUnderfined(e.target.value) })
          }
        />
      </Form>

      <Handle
        type="source"
        position={Position.Bottom}
        id={`${id}-out`}
        style={{ left: "50%" }}
      />
    </NodeBase>
  );
};

export default AudioBufferSource;
