import { useSettings } from "../../state/browser/hooks";
import { layout } from "../ui/theme";

export type PageFrame = { inset: number; radius: number; edgeToEdge: boolean };

const FRAMED: PageFrame = { inset: layout.cardInset, radius: layout.cardRadius, edgeToEdge: false };
const EDGE_TO_EDGE: PageFrame = { inset: 0, radius: 0, edgeToEdge: true };

export const pageFrameOf = (edgeToEdge: boolean): PageFrame => (edgeToEdge ? EDGE_TO_EDGE : FRAMED);

export const usePageFrame = (): PageFrame => pageFrameOf(useSettings((s) => s.edgeToEdge));
