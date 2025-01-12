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
    console.log("running nodes", this.nodes, this.edges);

    const audioNodes = new Map<string, AudioNode>();

    // Create audio nodes
    for (const node of this.nodes) {
      switch (node.type) {
        case "audio-buffer-source": {
          const audioBufferSource = new AudioBufferSourceNode(
            this.audioContext,
            {
              buffer: node.data.file
                ? await this.audioContext.decodeAudioData(
                    await node.data.file.arrayBuffer()
                  )
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
      if (node.type === "audio-buffer-source") {
        const audioBufferSource = audioNodes.get(
          node.id
        ) as AudioBufferSourceNode;
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
