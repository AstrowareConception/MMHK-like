export type TimelineEvent = {
  id:string; type:"construction_complete"|"hero_arrival"|"hero_return"|
    "caravan_arrival"|"caravan_return"|"caravan_program_attempt"; title:string; occurs_at:string;
  world_id:string; city_id:string; city_name:string; target_url:string;
  icon:string; priority:string;
};
export type TimelineResponse = {
  server_now:string; horizon_hours:number; truncated:boolean; events:TimelineEvent[];
};
export function timelinePercent(at:string,now:number,hours:number):number {
  const due=Date.parse(at);
  if(!Number.isFinite(due)||!Number.isFinite(now)||hours<=0)return 0;
  return Math.max(0,Math.min(100,(due-now)/(hours*3600000)*100));
}
export function timeRemaining(at:string,now:number):string {
  const seconds=Math.ceil((Date.parse(at)-now)/1000);
  if(!Number.isFinite(seconds)||seconds<=0)return "Échéance atteinte · confirmation serveur attendue";
  const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60;
  return h>0?String(h)+" h "+String(m).padStart(2,"0")+" min":
    String(m)+" min "+String(s).padStart(2,"0")+" s";
}
