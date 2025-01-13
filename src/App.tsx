import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  Controls,
  Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";
import { RunButton } from "./components/RunButton";
import { RunReportPanel } from "./components/RunReportPanel";
import { Logo } from "./components/Logo";
import { SetNodesProvider } from "./components/ChangeHandlerContext";
import { Engine } from "./engine";
import { Button } from "./components/Inputs";
import { AppNode } from "./nodes/types";

type State = {
  nodes: AppNode[];
  edges: Edge[];
};

function decodeState(hash: string): State | undefined {
  if (!hash) return undefined;

  try {
    return JSON.parse(atob(hash));
  } catch (e) {
    return undefined;
  }
}

function getState(): State {
  const hashState = decodeState(window.location.hash.slice(1));
  if (hashState) return hashState;

  const localNodes = sessionStorage.getItem("nodes");
  const localEdges = sessionStorage.getItem("edges");

  return {
    nodes: localNodes ? (JSON.parse(localNodes) as AppNode[]) : initialNodes,
    edges: localEdges ? JSON.parse(localEdges) : initialEdges,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function id() {
  return Math.random().toString(36).substr(2, 9);
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(getState().nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(getState().edges);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const state: State = useMemo(() => ({ nodes, edges }), [nodes, edges]);
  const debouncedState = useDebounce(state, 500);

  useEffect(() => {
    const hash = btoa(JSON.stringify(debouncedState));

    const url = new URL(window.location.href);
    url.hash = hash;
    history.replaceState(null, "", url);

    sessionStorage.setItem("nodes", JSON.stringify(debouncedState.nodes));
    sessionStorage.setItem("edges", JSON.stringify(debouncedState.edges));

    // TODO: save to local storage
  }, [debouncedState]);

  const [engine, setEngine] = useState<Engine | null>(null);

  useEffect(() => {
    return () => {
      if (engine) engine.close();
    };
  }, [engine]);

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((edges) => {
        return addEdge(connection, edges);
      }),
    [setEdges]
  );

  const handleReset = () => {
    const url = new URL(window.location.href);
    url.hash = "";
    history.replaceState(null, "", url);

    sessionStorage.removeItem("nodes");
    sessionStorage.removeItem("edges");

    setNodes(initialNodes);
    setEdges(initialEdges);
  };

  const loadSimple = () => {
    const decodedState = decodeState(
      "eyJub2RlcyI6W3siaWQiOiJkZXN0aW5hdGlvbiIsInR5cGUiOiJhdWRpby1kZXN0aW5hdGlvbiIsInNlbGVjdGFibGUiOmZhbHNlLCJwb3NpdGlvbiI6eyJ4IjoxNjYsInkiOjE5M30sImRhdGEiOnt9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6MzYwLCJoZWlnaHQiOjk4fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9LHsiaWQiOiJ2ejl6cWl1bnMiLCJ0eXBlIjoiYXVkaW8tYnVmZmVyLXNvdXJjZSIsInBvc2l0aW9uIjp7IngiOjE4NC41LCJ5IjotOTN9LCJkYXRhIjp7InR5cGUiOiJ1cmwiLCJ1cmwiOiJodHRwczovL2Nkbi5waXhhYmF5LmNvbS9hdWRpby8yMDI0LzEyLzAyL2F1ZGlvXzQyNTVjNDgyOTAubXAzIn0sIm1lYXN1cmVkIjp7IndpZHRoIjozMjMsImhlaWdodCI6MjI2fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9XSwiZWRnZXMiOlt7InNvdXJjZSI6InZ6OXpxaXVucyIsInNvdXJjZUhhbmRsZSI6InZ6OXpxaXVucy1vdXQiLCJ0YXJnZXQiOiJkZXN0aW5hdGlvbiIsInRhcmdldEhhbmRsZSI6ImRlc3RpbmF0aW9uLWluIiwiaWQiOiJ4eS1lZGdlX192ejl6cWl1bnN2ejl6cWl1bnMtb3V0LWRlc3RpbmF0aW9uZGVzdGluYXRpb24taW4ifV19"
    );
    if (!decodedState) return;

    setNodes(decodedState.nodes);
    setEdges(decodedState.edges);
  };

  const loadReverb = () => {
    const decodedState = decodeState(
      "eyJub2RlcyI6W3siaWQiOiJkZXN0aW5hdGlvbiIsInR5cGUiOiJhdWRpby1kZXN0aW5hdGlvbiIsInNlbGVjdGFibGUiOmZhbHNlLCJwb3NpdGlvbiI6eyJ4IjoxMDAsInkiOjEwMH0sImRhdGEiOnt9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6MzYwLCJoZWlnaHQiOjk4fX0seyJpZCI6IjZnbDdsc3U1cCIsInR5cGUiOiJhdWRpby1idWZmZXItc291cmNlIiwicG9zaXRpb24iOnsieCI6LTkyLjkzODcyNjM0ODg4MjE3LCJ5IjotNTAyLjE1NzA0ODE1NzA4NjR9LCJkYXRhIjp7InR5cGUiOiJ1cmwiLCJ1cmwiOiJodHRwczovL2Nkbi5waXhhYmF5LmNvbS9hdWRpby8yMDIzLzAzLzE0L2F1ZGlvXzY3Njc0NzAxM2EubXAzIn0sIm1lYXN1cmVkIjp7IndpZHRoIjozMjMsImhlaWdodCI6MjI2fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9LHsiaWQiOiJpMnQ2ODU2NXEiLCJ0eXBlIjoiZ2FpbiIsInBvc2l0aW9uIjp7IngiOjUyNS4wNzk0MTYxNTMxMTkyLCJ5IjotMjA0Ljk1MDM1Mjc1NjU0MDA0fSwiZGF0YSI6eyJnYWluIjowLjd9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6MjUwLCJoZWlnaHQiOjk4fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9LHsiaWQiOiJ4YTJ5amQ5M2giLCJ0eXBlIjoiZ2FpbiIsInBvc2l0aW9uIjp7IngiOjM3OS40MTIyMjMyODQ4MzQ1LCJ5IjotMzMuMDI5MTg5MDgwNTk5NDN9LCJkYXRhIjp7ImdhaW4iOjAuNX0sIm1lYXN1cmVkIjp7IndpZHRoIjoyNTAsImhlaWdodCI6OTh9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX0seyJpZCI6ImkzbWRlYm11NiIsInR5cGUiOiJkZWxheSIsInBvc2l0aW9uIjp7IngiOjE4OC44NTkyMDkzNTgyOTkzMiwieSI6LTIwNC4xMDM0NTA0NzI0MjIxNH0sImRhdGEiOnsiZGVsYXlUaW1lIjowLjF9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6Mjk3LCJoZWlnaHQiOjk4fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9XSwiZWRnZXMiOlt7InNvdXJjZSI6IjZnbDdsc3U1cCIsInNvdXJjZUhhbmRsZSI6IjZnbDdsc3U1cC1vdXQiLCJ0YXJnZXQiOiJkZXN0aW5hdGlvbiIsInRhcmdldEhhbmRsZSI6ImRlc3RpbmF0aW9uLWluIiwiaWQiOiJ4eS1lZGdlX182Z2w3bHN1NXA2Z2w3bHN1NXAtb3V0LWRlc3RpbmF0aW9uZGVzdGluYXRpb24taW4ifSx7InNvdXJjZSI6IjZnbDdsc3U1cCIsInNvdXJjZUhhbmRsZSI6IjZnbDdsc3U1cC1vdXQiLCJ0YXJnZXQiOiJpM21kZWJtdTYiLCJ0YXJnZXRIYW5kbGUiOiJpM21kZWJtdTYtaW4iLCJpZCI6Inh5LWVkZ2VfXzZnbDdsc3U1cDZnbDdsc3U1cC1vdXQtaTNtZGVibXU2aTNtZGVibXU2LWluIn0seyJzb3VyY2UiOiJpM21kZWJtdTYiLCJzb3VyY2VIYW5kbGUiOiJpM21kZWJtdTYtb3V0IiwidGFyZ2V0IjoiaTJ0Njg1NjVxIiwidGFyZ2V0SGFuZGxlIjoiaTJ0Njg1NjVxLWluIiwiaWQiOiJ4eS1lZGdlX19pM21kZWJtdTZpM21kZWJtdTYtb3V0LWkydDY4NTY1cWkydDY4NTY1cS1pbiJ9LHsic291cmNlIjoiaTJ0Njg1NjVxIiwic291cmNlSGFuZGxlIjoiaTJ0Njg1NjVxLW91dCIsInRhcmdldCI6ImkzbWRlYm11NiIsInRhcmdldEhhbmRsZSI6ImkzbWRlYm11Ni1pbiIsImlkIjoieHktZWRnZV9faTJ0Njg1NjVxaTJ0Njg1NjVxLW91dC1pM21kZWJtdTZpM21kZWJtdTYtaW4ifSx7InNvdXJjZSI6ImkydDY4NTY1cSIsInNvdXJjZUhhbmRsZSI6ImkydDY4NTY1cS1vdXQiLCJ0YXJnZXQiOiJ4YTJ5amQ5M2giLCJ0YXJnZXRIYW5kbGUiOiJ4YTJ5amQ5M2gtaW4iLCJpZCI6Inh5LWVkZ2VfX2kydDY4NTY1cWkydDY4NTY1cS1vdXQteGEyeWpkOTNoeGEyeWpkOTNoLWluIn0seyJzb3VyY2UiOiJ4YTJ5amQ5M2giLCJzb3VyY2VIYW5kbGUiOiJ4YTJ5amQ5M2gtb3V0IiwidGFyZ2V0IjoiZGVzdGluYXRpb24iLCJ0YXJnZXRIYW5kbGUiOiJkZXN0aW5hdGlvbi1pbiIsImlkIjoieHktZWRnZV9feGEyeWpkOTNoeGEyeWpkOTNoLW91dC1kZXN0aW5hdGlvbmRlc3RpbmF0aW9uLWluIn1dfQ"
    );
    if (!decodedState) return;

    setNodes(decodedState.nodes);
    setEdges(decodedState.edges);
  };

  const loadBinaural = () => {
    const decodedState = decodeState(
      "eyJub2RlcyI6W3siaWQiOiJkZXN0aW5hdGlvbiIsInR5cGUiOiJhdWRpby1kZXN0aW5hdGlvbiIsInNlbGVjdGFibGUiOmZhbHNlLCJwb3NpdGlvbiI6eyJ4IjoxMDAsInkiOjEwMH0sImRhdGEiOnt9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6MzYwLCJoZWlnaHQiOjk4fX0seyJpZCI6IjEydHh5dWxhMiIsInR5cGUiOiJvc2NpbGxhdG9yIiwicG9zaXRpb24iOnsieCI6LTM4LjM3NjU4NjkzNDc2MDYxLCJ5IjotMjc4LjQ1MzM3NDk2ODQ5NTU1fSwiZGF0YSI6eyJ0eXBlIjoic2luZSIsImZyZXF1ZW5jeSI6NjB9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6Mjk2LCJoZWlnaHQiOjE2Mn0sInNlbGVjdGVkIjpmYWxzZSwiZHJhZ2dpbmciOmZhbHNlfSx7ImlkIjoib29yYTZ1ZXk0IiwidHlwZSI6Im9zY2lsbGF0b3IiLCJwb3NpdGlvbiI6eyJ4IjoyOTkuODcyODY1MzUwNjg3NSwieSI6LTI3OC40NTMzNzQ5Njg0OTU1fSwiZGF0YSI6eyJ0eXBlIjoic2luZSIsImZyZXF1ZW5jeSI6Njh9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6Mjk2LCJoZWlnaHQiOjE2Mn0sInNlbGVjdGVkIjpmYWxzZSwiZHJhZ2dpbmciOmZhbHNlfSx7ImlkIjoib3BqdTkzMmQ5IiwidHlwZSI6InN0ZXJlby1wYW5uZXIiLCJwb3NpdGlvbiI6eyJ4IjotMTIuNDk0NzAyNzIyOTQ1MzA2LCJ5IjotNzcuNjQ1NjUyNjM1NDQ1ODd9LCJkYXRhIjp7InBhbiI6LTF9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6MjQ2LCJoZWlnaHQiOjk4fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9LHsiaWQiOiI3YzgxYjMxdTAiLCJ0eXBlIjoic3RlcmVvLXBhbm5lciIsInBvc2l0aW9uIjp7IngiOjMyNS43NTQ3NDk1NjI1MDI3LCJ5IjotNzguNTM4MTMxNDAxMzcwNTV9LCJkYXRhIjp7InBhbiI6MX0sIm1lYXN1cmVkIjp7IndpZHRoIjoyNDYsImhlaWdodCI6OTh9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX1dLCJlZGdlcyI6W3sic291cmNlIjoiMTJ0eHl1bGEyIiwic291cmNlSGFuZGxlIjoiMTJ0eHl1bGEyLW91dCIsInRhcmdldCI6Im9wanU5MzJkOSIsInRhcmdldEhhbmRsZSI6Im9wanU5MzJkOS1pbiIsImlkIjoieHktZWRnZV9fMTJ0eHl1bGEyMTJ0eHl1bGEyLW91dC1vcGp1OTMyZDlvcGp1OTMyZDktaW4ifSx7InNvdXJjZSI6Im9wanU5MzJkOSIsInNvdXJjZUhhbmRsZSI6Im9wanU5MzJkOS1vdXQiLCJ0YXJnZXQiOiJkZXN0aW5hdGlvbiIsInRhcmdldEhhbmRsZSI6ImRlc3RpbmF0aW9uLWluIiwiaWQiOiJ4eS1lZGdlX19vcGp1OTMyZDlvcGp1OTMyZDktb3V0LWRlc3RpbmF0aW9uZGVzdGluYXRpb24taW4ifSx7InNvdXJjZSI6IjdjODFiMzF1MCIsInNvdXJjZUhhbmRsZSI6IjdjODFiMzF1MC1vdXQiLCJ0YXJnZXQiOiJkZXN0aW5hdGlvbiIsInRhcmdldEhhbmRsZSI6ImRlc3RpbmF0aW9uLWluIiwiaWQiOiJ4eS1lZGdlX183YzgxYjMxdTA3YzgxYjMxdTAtb3V0LWRlc3RpbmF0aW9uZGVzdGluYXRpb24taW4ifSx7InNvdXJjZSI6Im9vcmE2dWV5NCIsInNvdXJjZUhhbmRsZSI6Im9vcmE2dWV5NC1vdXQiLCJ0YXJnZXQiOiI3YzgxYjMxdTAiLCJ0YXJnZXRIYW5kbGUiOiI3YzgxYjMxdTAtaW4iLCJpZCI6Inh5LWVkZ2VfX29vcmE2dWV5NG9vcmE2dWV5NC1vdXQtN2M4MWIzMXUwN2M4MWIzMXUwLWluIn1dfQ"
    );
    if (!decodedState) return;

    setNodes(decodedState.nodes);
    setEdges(decodedState.edges);
  };

  const loadClub = () => {
    const decodedState = decodeState(
      "eyJub2RlcyI6W3siaWQiOiJkZXN0aW5hdGlvbiIsInR5cGUiOiJhdWRpby1kZXN0aW5hdGlvbiIsInNlbGVjdGFibGUiOmZhbHNlLCJwb3NpdGlvbiI6eyJ4IjoxMTQuOTA3NzE4NDgzNDkyNDksInkiOjkzLjYxMDk3Nzc5Mjc4ODkzfSwiZGF0YSI6e30sIm1lYXN1cmVkIjp7IndpZHRoIjozNjAsImhlaWdodCI6OTh9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX0seyJpZCI6IjZoaGViNWw2cCIsInR5cGUiOiJhdWRpby1idWZmZXItc291cmNlIiwicG9zaXRpb24iOnsieCI6MTA4Ljk5NzI3ODY1NzE4MDQ5LCJ5IjotNjYzLjQzMDI2MTY5NzczOTF9LCJkYXRhIjp7InR5cGUiOiJ1cmwiLCJ1cmwiOiJodHRwczovL2Nkbi5waXhhYmF5LmNvbS9hdWRpby8yMDI0LzEyLzE3L2F1ZGlvXzc0MTM2YzExYjcubXAzIn0sIm1lYXN1cmVkIjp7IndpZHRoIjozMjMsImhlaWdodCI6MjI2fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9LHsiaWQiOiI2M3NxeTExaHEiLCJ0eXBlIjoiYmlxdWFkLWZpbHRlciIsInBvc2l0aW9uIjp7IngiOi01Mi44Nzg4ODA4Nzk3Njg2MTYsInkiOi0yNzMuOTUxMzk2MzQ4NDA2OX0sImRhdGEiOnsidHlwZSI6Imxvd3Bhc3MiLCJmcmVxdWVuY3kiOjYwLCJRIjo1fSwibWVhc3VyZWQiOnsid2lkdGgiOjI5NiwiaGVpZ2h0IjoxOTR9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX0seyJpZCI6IjdscW90aGlicyIsInR5cGUiOiJiaXF1YWQtZmlsdGVyIiwicG9zaXRpb24iOnsieCI6MjkzLjg2MTY4NzkyOTA1Mjk1LCJ5IjotMzcxLjk4MzA3MDczMDk1NTR9LCJkYXRhIjp7InR5cGUiOiJoaWdocGFzcyIsImZyZXF1ZW5jeSI6MjAwMCwiUSI6NX0sIm1lYXN1cmVkIjp7IndpZHRoIjoyOTYsImhlaWdodCI6MTk0fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9LHsiaWQiOiJvejhzZWJpYzMiLCJ0eXBlIjoiZGVsYXkiLCJwb3NpdGlvbiI6eyJ4IjoyOTMuODYxNjg3OTI5MDUyOTUsInkiOi0xNjIuMzgzNjM1MTgyMjA4Nn0sImRhdGEiOnsiZGVsYXlUaW1lIjowLjF9LCJtZWFzdXJlZCI6eyJ3aWR0aCI6Mjk3LCJoZWlnaHQiOjk4fSwic2VsZWN0ZWQiOmZhbHNlLCJkcmFnZ2luZyI6ZmFsc2V9LHsiaWQiOiJrbzQ4YjJsYmkiLCJ0eXBlIjoiZ2FpbiIsInBvc2l0aW9uIjp7IngiOjMxNy42MDE2ODk1OTU1Mzc0LCJ5IjotNDkuNTkzNjI3MDY0NDE1NTR9LCJkYXRhIjp7ImdhaW4iOjAuMn0sIm1lYXN1cmVkIjp7IndpZHRoIjoyNTAsImhlaWdodCI6OTh9LCJzZWxlY3RlZCI6ZmFsc2UsImRyYWdnaW5nIjpmYWxzZX1dLCJlZGdlcyI6W3sic291cmNlIjoiNmhoZWI1bDZwIiwic291cmNlSGFuZGxlIjoiNmhoZWI1bDZwLW91dCIsInRhcmdldCI6IjYzc3F5MTFocSIsInRhcmdldEhhbmRsZSI6IjYzc3F5MTFocS1pbiIsImlkIjoieHktZWRnZV9fNmhoZWI1bDZwNmhoZWI1bDZwLW91dC02M3NxeTExaHE2M3NxeTExaHEtaW4iLCJzZWxlY3RlZCI6ZmFsc2V9LHsic291cmNlIjoiNmhoZWI1bDZwIiwic291cmNlSGFuZGxlIjoiNmhoZWI1bDZwLW91dCIsInRhcmdldCI6IjdscW90aGlicyIsInRhcmdldEhhbmRsZSI6IjdscW90aGlicy1pbiIsImlkIjoieHktZWRnZV9fNmhoZWI1bDZwNmhoZWI1bDZwLW91dC03bHFvdGhpYnM3bHFvdGhpYnMtaW4iLCJzZWxlY3RlZCI6ZmFsc2V9LHsic291cmNlIjoiN2xxb3RoaWJzIiwic291cmNlSGFuZGxlIjoiN2xxb3RoaWJzLW91dCIsInRhcmdldCI6Im96OHNlYmljMyIsInRhcmdldEhhbmRsZSI6Im96OHNlYmljMy1pbiIsImlkIjoieHktZWRnZV9fN2xxb3RoaWJzN2xxb3RoaWJzLW91dC1vejhzZWJpYzNvejhzZWJpYzMtaW4iLCJzZWxlY3RlZCI6ZmFsc2V9LHsic291cmNlIjoiNjNzcXkxMWhxIiwic291cmNlSGFuZGxlIjoiNjNzcXkxMWhxLW91dCIsInRhcmdldCI6ImRlc3RpbmF0aW9uIiwidGFyZ2V0SGFuZGxlIjoiZGVzdGluYXRpb24taW4iLCJpZCI6Inh5LWVkZ2VfXzYzc3F5MTFocTYzc3F5MTFocS1vdXQtZGVzdGluYXRpb25kZXN0aW5hdGlvbi1pbiIsInNlbGVjdGVkIjpmYWxzZX0seyJzb3VyY2UiOiJvejhzZWJpYzMiLCJzb3VyY2VIYW5kbGUiOiJvejhzZWJpYzMtb3V0IiwidGFyZ2V0Ijoia280OGIybGJpIiwidGFyZ2V0SGFuZGxlIjoia280OGIybGJpLWluIiwiaWQiOiJ4eS1lZGdlX19vejhzZWJpYzNvejhzZWJpYzMtb3V0LWtvNDhiMmxiaWtvNDhiMmxiaS1pbiJ9LHsic291cmNlIjoia280OGIybGJpIiwic291cmNlSGFuZGxlIjoia280OGIybGJpLW91dCIsInRhcmdldCI6ImRlc3RpbmF0aW9uIiwidGFyZ2V0SGFuZGxlIjoiZGVzdGluYXRpb24taW4iLCJpZCI6Inh5LWVkZ2VfX2tvNDhiMmxiaWtvNDhiMmxiaS1vdXQtZGVzdGluYXRpb25kZXN0aW5hdGlvbi1pbiJ9XX0"
    );
    if (!decodedState) return;

    setNodes(decodedState.nodes);
    setEdges(decodedState.edges);
  };

  const addAudioBufferSource = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "audio-buffer-source",
          position: { x: 0, y: 0 },
          data: {
            type: "file",
          },
        },
      ];
    });
  };

  const addBiquadFilter = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "biquad-filter",
          position: { x: 0, y: 0 },
          data: {
            type: "lowpass",
          },
        },
      ];
    });
  };

  const addDelay = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "delay",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
    });
  };

  const addDynamicsCompressor = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "dynamics-compressor",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
    });
  };

  const addGain = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "gain",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
    });
  };

  const addOscillator = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "oscillator",
          position: { x: 0, y: 0 },
          data: {
            type: "sine",
          },
        },
      ];
    });
  };

  const addStereoPanner = () => {
    setNodes((nodes) => {
      return [
        ...nodes,
        {
          id: id(),
          type: "stereo-panner",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];
    });
  };

  const handleRun = useCallback(() => {
    setIsPanelOpen(true);

    const eng = new Engine(nodes, edges);
    eng.run();
    setEngine(eng);
  }, [edges, nodes]);

  return (
    <SetNodesProvider setNodes={setNodes}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Logo />
        <RunButton onRun={handleRun} />
        <div className="absolute top-[75px] left-4 bg-white flex flex-col z-50 gap-2">
          <h1>Audio Nodes</h1>
          <Button onClick={addAudioBufferSource}>Audio Buffer Source</Button>
          <Button onClick={addBiquadFilter}>Biquad Filter</Button>
          <Button onClick={addDelay}>Delay</Button>
          <Button onClick={addDynamicsCompressor}>Dynamics Compressor</Button>
          <Button onClick={addGain}>Gain</Button>
          <Button onClick={addOscillator}>Oscillator</Button>
          <Button onClick={addStereoPanner}>Stereo Panner</Button>
          <h1>Examples</h1>
          <Button onClick={loadSimple}>Simple Buffer</Button>
          <Button onClick={loadReverb}>Reverb</Button>
          <Button onClick={loadBinaural}>Binaural Beats</Button>
          <Button onClick={loadClub}>Outside the Club</Button>
          <Button onClick={handleReset}>Reset</Button>
        </div>
        {!!engine && (
          <RunReportPanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            engine={engine}
          />
        )}
        <Controls />
      </ReactFlow>
    </SetNodesProvider>
  );
}
