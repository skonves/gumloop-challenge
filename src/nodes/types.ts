import type { Node, BuiltInNode, NodeProps } from "@xyflow/react";

export type NodeComponent<T extends Node> = React.FC<
  NodeProps & Pick<T, "data" | "type">
>;

// export type FunctionNode = Node<
//   {
//     label: string;
//     func?: (input: any) => any;
//     functionName: string;
//   },
//   "function-node"
// >;

export type AudioBufferSourceData = Node<
  {
    file?: File;
    detune?: number;
    loop?: boolean;
    loopEnd?: number;
    loopStart?: number;
    playbackRate?: number;
  },
  "audio-buffer-source"
>;

export type AudioDestinationData = Node<
  { maxChannelCount?: number },
  "audio-destination"
>;

export type AppNode =
  | BuiltInNode
  | AudioBufferSourceData
  | AudioDestinationData;
