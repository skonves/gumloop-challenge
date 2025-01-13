import { Edge } from "@xyflow/react";
import { AppNode } from "./nodes/types";

export class Engine {
  constructor(
    private readonly nodes: AppNode[],
    private readonly edges: Edge[]
  ) {}

  private readonly audioContext: AudioContext = new (window.AudioContext ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitAudioContext)();

  async run(): Promise<void> {
    const audioNodes = new Map<string, AudioNode>();

    for (const node of this.nodes) {
      switch (node.type) {
        case "audio-buffer-source": {
          const getBuffer = async (): Promise<ArrayBuffer | null> => {
            switch (node.data.type) {
              case "file": {
                if (!node.data.file) return null;
                return await node.data.file!.arrayBuffer();
              }
              case "url": {
                if (!node.data.url) return null;
                const response = await fetch(node.data.url);
                return await response.arrayBuffer();
              }
            }
          };

          const arrayBuffer = await getBuffer();

          const audioBufferSource = new AudioBufferSourceNode(
            this.audioContext,
            {
              buffer: arrayBuffer
                ? await this.audioContext.decodeAudioData(arrayBuffer)
                : null,
              loop: node.data.loop,
              loopStart: node.data.loopStart,
              loopEnd: node.data.loopEnd,
              detune: node.data.detune,
              playbackRate: node.data.playbackRate,
            }
          );
          audioNodes.set(node.id, audioBufferSource);
          break;
        }
        case "audio-destination": {
          const audioDestination = this.audioContext.destination;
          audioNodes.set(node.id, audioDestination);
          break;
        }
        case "biquad-filter": {
          const biquadFilter = new BiquadFilterNode(this.audioContext, {
            detune: node.data.detune,
            frequency: node.data.frequency,
            gain: node.data.gain,
            Q: node.data.Q,
            type: node.data.type,
          });
          audioNodes.set(node.id, biquadFilter);
          break;
        }
        case "delay": {
          const delay = new DelayNode(this.audioContext, {
            delayTime: node.data.delayTime,
          });
          audioNodes.set(node.id, delay);
          break;
        }
        case "dynamics-compressor": {
          const dynamicsCompressor = new DynamicsCompressorNode(
            this.audioContext,
            {
              attack: node.data.attack,
              knee: node.data.knee,
              ratio: node.data.ratio,
              release: node.data.release,
              threshold: node.data.threshold,
            }
          );
          audioNodes.set(node.id, dynamicsCompressor);
          break;
        }
        case "gain": {
          const gain = new GainNode(this.audioContext, {
            gain: node.data.gain,
          });
          audioNodes.set(node.id, gain);
          break;
        }
        case "oscillator": {
          const oscillator = new OscillatorNode(this.audioContext, {
            type: node.data.type,
            frequency: node.data.frequency,
            detune: node.data.detune,
          });
          audioNodes.set(node.id, oscillator);
          break;
        }
        case "stereo-panner": {
          const stereoPanner = new StereoPannerNode(this.audioContext, {
            pan: node.data.pan,
          });
          audioNodes.set(node.id, stereoPanner);
          break;
        }
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
    }

    // Connect audio nodes
    for (const edge of this.edges) {
      const sourceNode = audioNodes.get(edge.source);
      const destinationNode = audioNodes.get(edge.target);

      if (!sourceNode || !destinationNode) {
        throw new Error(
          `Could not find source or destination node for edge: ${edge.id}`
        );
      }

      sourceNode.connect(destinationNode);
    }

    // Start source nodes
    for (const node of this.nodes) {
      if (node.type === "audio-buffer-source" || node.type === "oscillator") {
        const audioBufferSource = audioNodes.get(node.id) as
          | AudioBufferSourceNode
          | OscillatorNode;
        audioBufferSource.start();
      }
    }
  }

  suspend(): void {
    if (this.audioContext.state === "running") this.audioContext.suspend();
  }

  resume(): void {
    if (this.audioContext.state === "suspended") this.audioContext.resume();
  }

  close(): void {
    if (this.audioContext.state !== "closed") this.audioContext.close();
  }
}
