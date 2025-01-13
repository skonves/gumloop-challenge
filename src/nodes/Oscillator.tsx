import { Handle, Position } from "@xyflow/react";
import { AppNode, OscillatorData, NodeComponent } from "./types";
import { useSetNodes } from "../components/ChangeHandlerContext";
import { Form, NumberInput, SelectInput } from "../components/Inputs";
import { useCallback } from "react";
import { NodeBase } from "./NodeBase";

function numberOrUnderfined(value: string): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return isNaN(number) ? undefined : number;
}

const Oscillator: NodeComponent<OscillatorData> = ({ id, data, selected }) => {
  const setNodes = useSetNodes();

  const handleChange = useCallback(
    (change: Partial<OscillatorData["data"]>) => {
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
    <NodeBase heading="Oscillator" selected={selected}>
      <Form>
        <SelectInput
          label="type"
          id={`${id}-type`}
          value={data.type}
          onChange={(e) =>
            handleChange({
              type: e.target.value as OscillatorData["data"]["type"],
            })
          }
        >
          <option value="sawtooth">sawtooth</option>
          <option value="sine">sine</option>
          <option value="square">square</option>
          <option value="triangle">triangle</option>
        </SelectInput>
        <NumberInput
          label="frequency"
          id={`${id}-frequency`}
          placeholder="number"
          value={data.frequency}
          onChange={(e) =>
            handleChange({ frequency: numberOrUnderfined(e.target.value) })
          }
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

export default Oscillator;
