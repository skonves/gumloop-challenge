import type { NodeTypes } from "@xyflow/react";

import { AppNode } from "./types";
import AudioBufferSource from "./AudioBufferSource";
import AudioDestination from "./AudioDestination";
import BiquadFilter from "./BiquadFilter";
import Delay from "./Delay";
import Gain from "./Gain";
import Oscillator from "./Oscillator";
import StereoPanner from "./StereoPanner";
import DynamicsCompressor from "./DynamicsCompressor";

export const initialNodes: AppNode[] = [
  {
    id: "destination",
    type: "audio-destination",
    selectable: false,
    position: { x: 100, y: 100 },
    data: {},
  },
];

export const nodeTypes = {
  "audio-buffer-source": AudioBufferSource,
  "audio-destination": AudioDestination,
  "biquad-filter": BiquadFilter,
  delay: Delay,
  "dynamics-compressor": DynamicsCompressor,
  gain: Gain,
  oscillator: Oscillator,
  "stereo-panner": StereoPanner,
} satisfies NodeTypes;
