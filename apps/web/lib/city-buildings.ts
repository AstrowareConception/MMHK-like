/** Public-safe names shared by server-rendered construction history and
 * the interactive client-side city inspector. No runtime server/client hooks.
 */
export const BUILDING_NAMES:Readonly<Record<string,string>> = {
  village_hall:"Hôtel du village",town_hall:"Hôtel de ville",
  marketplace:"Marché",resource_silo:"Silos",tavern:"Taverne",
  recruit_t1:"Demeure des miliciens",recruit_t2:"Demeure des archers",
  fort:"Fortifications",blacksmith:"Forge",mage_guild:"Guilde des mages",
  stables:"Écuries",watchtower:"Tour de guet",
};

export function buildingName(code:string):string{
  return Object.prototype.hasOwnProperty.call(BUILDING_NAMES,code)
    ?BUILDING_NAMES[code]:code;
}
