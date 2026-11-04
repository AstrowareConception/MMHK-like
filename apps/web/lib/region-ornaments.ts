/** Stable cartographic ornamentation, never inferred world terrain.
 * This is a visual-only illustration seed, not a forest/river/mineral record.
 * Identical regions preserve their appearance across renders and devices.
 */
export type RegionOrnament="grass"|"stone"|"ruin"|"trail"|"none";
export type OrnamentCell={i:number;j:number;variant:RegionOrnament;rotation:number;shade:number};

export function ornamentSeed(input:string):number{
  let h=2166136261;
  for(let i=0;i<input.length;i++){
    h^=input.charCodeAt(i);
    h=Math.imul(h,16777619);
  }
  return h>>>0;
}
export function regionOrnaments(worldId:string,x:number,y:number):OrnamentCell[]{
  const seed=ornamentSeed(worldId+":"+x+":"+y+":decor-v1");
  const variants:RegionOrnament[]=["grass","grass","stone","grass","trail","ruin","none"];
  return Array.from({length:25},(_,n)=>{
    const i=n%5,j=Math.floor(n/5);
    const v=ornamentSeed(seed+":"+i+":"+j);
    return {i,j,variant:(i===2&&j===2)?"none":variants[v%variants.length],
      rotation:(v>>>8)%4,shade:(v>>>16)%3};
  });
}
