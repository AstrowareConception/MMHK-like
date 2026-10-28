/** Camera geometry is independent of artwork and server-side world terrain.
 * The recovered backgrounds are static reference illustrations, not a tile atlas.
 * Existing stories: US-MON-001/002/004, US-UIX-002/003.
 */
export type MapCoordinate = { x: number; y: number };
export type TileOffset = { i: number; j: number };
export type MapScale = "detail" | "political";
export const MAP_VIEW = { width: 680, height: 500, cx: 340, cy: 250 } as const;

/** The original Ubisoft hit boxes are not recovered. These are UI-calibration values. */
export const TILE_METRICS: Record<MapScale,{hw:number;hh:number}> = {
  detail: { hw: 17, hh: 9 },
  political: { hw: 10, hh: 5.5 }
};
export function worldWrap(value: number, size: number): number {
  if (!Number.isInteger(size) || size < 2 || !Number.isInteger(value)) throw new Error("Invalid world coordinate");
  return ((value - 1) % size + size) % size + 1;
}
export function worldDelta(value: number, center: number, size: number): number {
  const raw = value - center;
  return ((raw + Math.floor(size / 2)) % size + size) % size - Math.floor(size / 2);
}
export function tileToPoint(i: number, j: number, hw: number, hh: number): {x:number;y:number} {
  return {x: MAP_VIEW.cx + (i - j) * hw, y: MAP_VIEW.cy + (i + j) * hh};
}
export function tileFromPoint(x: number, y: number, hw: number, hh: number): TileOffset | null {
  if (![x,y,hw,hh].every(Number.isFinite) || hw <= 0 || hh <= 0) return null;
  const u = (x - MAP_VIEW.cx) / hw, v = (y - MAP_VIEW.cy) / hh;
  const fi = (u + v) / 2, fj = (v - u) / 2;
  // Test a small neighbourhood of the inverse projection against the ACTUAL
  // diamond hitbox (not an independent axis-rounded approximation).
  let chosen: (TileOffset & {score:number}) | null = null;
  for (let i = Math.floor(fi) - 1; i <= Math.floor(fi) + 2; i++) {
    for (let j = Math.floor(fj) - 1; j <= Math.floor(fj) + 2; j++) {
      const p = tileToPoint(i,j,hw,hh);
      const score = Math.abs(x-p.x)/hw + Math.abs(y-p.y)/hh;
      if (score <= 1 + 1e-8 && (!chosen || score < chosen.score - 1e-8 ||
        (Math.abs(score-chosen.score)<1e-8 && (i<chosen.i || (i===chosen.i && j<chosen.j)))))
        chosen = {i,j,score};
    }
  }
  return chosen ? {i:chosen.i,j:chosen.j} : null;
}
export function polygonAt(x:number,y:number,hw:number,hh:number):string {
  return [x+","+(y-hh),(x+hw)+","+y,x+","+(y+hh),(x-hw)+","+y].join(" ");
}
export function screenToWorld(
  x:number,y:number,center:MapCoordinate,size:number,hw:number,hh:number,
  pan: {x:number;y:number} = {x:0,y:0}
):MapCoordinate|null {
  if (x < 8 || y < 8 || x > MAP_VIEW.width-8 || y > MAP_VIEW.height-8) return null;
  const offset=tileFromPoint(x-pan.x,y-pan.y,hw,hh);
  return offset ? {x:worldWrap(center.x+offset.i,size),y:worldWrap(center.y+offset.j,size)} : null;
}
