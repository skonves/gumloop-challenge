import type { NodeTypes } from "@xyflow/react";

import { AppNode } from "./types";
import AudioBufferSource from "./AudioBufferSource";
import AudioDestination from "./AudioDestination";

export const initialNodes: AppNode[] = [
  // {
  //   id: "a",
  //   type: "input",
  //   position: { x: 0, y: 0 },
  //   data: { label: "Audio Source" },
  // },
  // { id: "c", position: { x: 100, y: 100 }, data: { label: "step 2" } },
  // {
  //   id: "d",
  //   type: "output",
  //   position: { x: 0, y: 200 },
  //   data: { label: "step 3" },
  // },
  // {
  //   id: "e",
  //   type: "audio-buffer-source",
  //   position: { x: 100, y: 300 },
  //   data: {},
  // },
  {
    id: "destination",
    type: "audio-destination",
    position: { x: 100, y: 100 },
    data: {},
  },
];

export const nodeTypes = {
  // Add any of your custom nodes here!
  "audio-buffer-source": AudioBufferSource,
  "audio-destination": AudioDestination,
} satisfies NodeTypes;
