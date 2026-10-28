/** Logical 5×5 region tile, independent of the historical background JPG.
 * One source for drawing, hit-testing and keyboard navigation.
 * The background is 680×562: preserve its native aspect ratio.
 */
export const REGION_VIEW={width:680,height:562,centerX:340,centerY:281,halfWidth:57,halfHeight:36} as const;
export type RegionCell={i:number;j:number};
export function regionCellCenter(i:number,j:number){
  if(!Number.isInteger(i)||!Number.isInteger(j)||i<0||j<0||i>4||j>4)throw new Error("Invalid 5x5 tile");
  const {centerX,centerY,halfWidth,halfHeight}=REGION_VIEW;
  return {x:centerX+(i-j)*halfWidth,y:centerY+(i+j-4)*halfHeight};
}
export function regionPolygon(i:number,j:number){
  const {x,y}=regionCellCenter(i,j),{halfWidth:w,halfHeight:h}=REGION_VIEW;
  return [x+","+(y-h),(x+w)+","+y,x+","+(y+h),(x-w)+","+y].join(" ");
}
export function regionCellAt(x:number,y:number):RegionCell|null{
  const {centerX,centerY,halfWidth:w,halfHeight:h}=REGION_VIEW;
  const u=(x-centerX)/w,v=(y-centerY)/h+4;
  const fi=(u+v)/2,fj=(v-u)/2;
  let chosen:(RegionCell&{distance:number})|null=null;
  for(let i=Math.floor(fi)-1;i<=Math.ceil(fi)+1;i++)for(let j=Math.floor(fj)-1;j<=Math.ceil(fj)+1;j++){
    if(i<0||j<0||i>4||j>4)continue;
    const c=regionCellCenter(i,j);
    const d=Math.abs(x-c.x)/w+Math.abs(y-c.y)/h;
    if(d<=1+1e-8&&(!chosen||d<chosen.distance-1e-8||
      (Math.abs(d-chosen.distance)<1e-8&&(i<chosen.i||(i===chosen.i&&j<chosen.j)))))
      chosen={i,j,distance:d};
  }
  return chosen?{i:chosen.i,j:chosen.j}:null;
}
