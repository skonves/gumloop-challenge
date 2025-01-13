import { useCallback } from "react";
import { Handle, Position } from "@xyflow/react";

import { useSetNodes } from "../components/ChangeHandlerContext";
import { Form, Input, NumberInput, SelectInput } from "../components/Inputs";

import { NodeBase } from "./NodeBase";
import { AppNode, AudioBufferSourceData, NodeComponent } from "./types";

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

            if (newData.type === "file") delete newData.url;
            if (newData.type === "url") delete newData.file;

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
        <SelectInput
          label="type"
          id={`${id}-type`}
          value={data.type}
          onChange={(e) =>
            handleChange({ type: e.target.value as "url" | "file" })
          }
        >
          <option value="url">url</option>
          <option value="file">file</option>
        </SelectInput>
        {data.type === "file" && (
          <Input
            label="file"
            id={`${id}-file`}
            type="file"
            accept="audio/*"
            onChange={async (e) => handleChange({ file: e.target.files?.[0] })}
          />
        )}
        {data.type === "url" && (
          <Input
            label="url"
            id={`${id}-url`}
            type="text"
            value={data.url}
            onChange={(e) => handleChange({ url: e.target.value })}
          />
        )}
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
