import type { Node, NodeProps } from "@xyflow/react";

export type NodeComponent<T extends Node> = React.FC<
  NodeProps & Pick<T, "data" | "type">
>;

export type AudioBufferSourceData = Node<
  {
    type: "url" | "file";
    file?: File;
    url?: string;
    detune?: number;
    loop?: boolean;
    loopEnd?: number;
    loopStart?: number;
    playbackRate?: number;
  },
  "audio-buffer-source"
>;

export type BiquadFilterData = Node<
  {
    detune?: number;
    frequency?: number;
    gain?: number;
    Q?: number;
    type: BiquadFilterType;
  },
  "biquad-filter"
>;

export type DelayData = Node<
  {
    delayTime?: number;
  },
  "delay"
>;

export type DynamicsCompressorData = Node<
  {
    attack?: number;
    knee?: number;
    ratio?: number;
    release?: number;
    threshold?: number;
  },
  "dynamics-compressor"
>;

export type GainData = Node<
  {
    gain?: number;
  },
  "gain"
>;

export type OscillatorData = Node<
  {
    type: Exclude<OscillatorType, "custom">;
    frequency?: number;
    detune?: number;
  },
  "oscillator"
>;

export type StereoPannerData = Node<
  {
    pan?: number;
  },
  "stereo-panner"
>;

export type AudioDestinationData = Node<
  { maxChannelCount?: number },
  "audio-destination"
>;

export type AppNode =
  | AudioBufferSourceData
  | AudioDestinationData
  | DelayData
  | DynamicsCompressorData
  | GainData
  | BiquadFilterData
  | OscillatorData
  | StereoPannerData;
