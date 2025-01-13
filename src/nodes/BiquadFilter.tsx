import { Handle, Position } from "@xyflow/react";
import { AppNode, BiquadFilterData, NodeComponent } from "./types";
import { useSetNodes } from "../components/ChangeHandlerContext";
import { Form, NumberInput, SelectInput } from "../components/Inputs";
import { useCallback } from "react";
import { NodeBase } from "./NodeBase";

function numberOrUnderfined(value: string): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return isNaN(number) ? undefined : number;
}

const BiquadFilter: NodeComponent<BiquadFilterData> = ({
  id,
  data,
  selected,
}) => {
  const setNodes = useSetNodes();

  const handleChange = useCallback(
    (change: Partial<BiquadFilterData["data"]>) => {
      setNodes((prevNodes) => {
        return prevNodes.map<AppNode>((node) => {
          if (node.id === id && node.type === "biquad-filter") {
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
    <NodeBase heading="Biquad Filter" selected={selected}>
      <Form>
        <SelectInput
          label="type"
          id={`${id}-type`}
          value={data.type}
          onChange={(e) =>
            handleChange({ type: e.target.value as BiquadFilterType })
          }
        >
          <option value="lowpass">lowpass</option>
          <option value="highpass">highpass</option>
          <option value="bandpass">bandpass</option>
          <option value="lowshelf">lowshelf</option>
          <option value="highshelf">highshelf</option>
          <option value="peaking">peaking</option>
          <option value="notch">notch</option>
          <option value="allpass">allpass</option>
        </SelectInput>
        <NumberInput
          label="detune"
          id={`${id}-detune`}
          placeholder="number"
          value={data.detune}
          onChange={(e) =>
            handleChange({ detune: numberOrUnderfined(e.target.value) })
          }
        />
        <NumberInput
          label="frequency"
          id={`${id}-frequency`}
          placeholder="number"
          value={data.frequency}
          onChange={(e) =>
            handleChange({ frequency: numberOrUnderfined(e.target.value) })
          }
        />
        {[
          "lowpass",
          "highpass",
          "bandpass",
          "peaking",
          "notch",
          "allpass",
        ].includes(data.type) && (
          <NumberInput
            label="Q"
            id={`${id}-Q`}
            placeholder="number"
            value={data.Q}
            onChange={(e) =>
              handleChange({ Q: numberOrUnderfined(e.target.value) })
            }
          />
        )}
        {["lowshelf", "highshelf", "peaking"].includes(data.type) && (
          <NumberInput
            label="gain"
            id={`${id}-gain`}
            placeholder="number"
            value={data.gain}
            onChange={(e) =>
              handleChange({ gain: numberOrUnderfined(e.target.value) })
            }
          />
        )}
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

export default BiquadFilter;
