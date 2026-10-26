/**
 * Explicit UTC truce windows for the V7.0 experimental movement lab.
 * Calendar and server timezone MUST be supplied by an authorized profile;
 * no Ubisoft S2 night schedule is silently assumed.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {normalizeTravelBlackouts} from './world-journey.mjs';
const DAY=86400000, HOUR=3600000;
const ms=(v,n)=>{if(!Number.isSafeInteger(v)||v<0)throw new RangeError(n+' must be safe epoch ms');return v;};
const hour=(v,n)=>{if(!Number.isInteger(v)||v<0||v>23)throw new RangeError(n+' must be an integer UTC hour 0..23');return v;};

/**
 * Returns full, merged windows clipped to the explicitly covered horizon.
 * UTC avoids DST ambiguity but does not establish the game's actual timezone.
 * A nightly truce can cross midnight or be confined to the same UTC day.
 */
export function buildCandidateUtcNightTruces({
 fromMs,untilMs,startHourUTC,endHourUTC
}){
 ms(fromMs,'fromMs');ms(untilMs,'untilMs');
 if(untilMs<=fromMs||untilMs-fromMs>366*DAY)
  throw new RangeError('Night-truce coverage must be >0 and <=366 days');
 hour(startHourUTC,'startHourUTC');hour(endHourUTC,'endHourUTC');
 if(startHourUTC===endHourUTC)throw new RangeError('Ambiguous 24-hour night truce');
 const firstDay=Math.floor(fromMs/DAY)-1,lastDay=Math.floor(untilMs/DAY);
 const windows=[];
 for(let day=firstDay;day<=lastDay;day++){
  const midnight=day*DAY;
  const start=midnight+startHourUTC*HOUR;
  const end=midnight+endHourUTC*HOUR+(endHourUTC<startHourUTC?DAY:0);
  if(end>fromMs&&start<untilMs)
   windows.push({startMs:Math.max(fromMs,start),endMs:Math.min(untilMs,end)});
 }
 return {fromMs,untilMs,startHourUTC,endHourUTC,
  windows:normalizeTravelBlackouts(windows),
  historicalCertification:false,authoritativeArrivalTime:false};
}
