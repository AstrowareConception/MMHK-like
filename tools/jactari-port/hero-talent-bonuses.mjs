/**
 * Historic Jactari combat-page talent enumeration:
 * nom_machine -> niveau_<name>, bonus_<name> from _talents[c][t].v[rank].
 * Selection is by trusted historical career/talent IDs, not client bonuses.
 * It is NOT a proof of the full career-tree learning restrictions.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 */
import {getJactariHeroTables} from './hero-source-tables.mjs';
const safe=n=>Number.isSafeInteger(n)&&n>=0;
export function deriveJactariTalentBonuses(selections=[],tables=getJactariHeroTables()){
 if(!Array.isArray(selections))throw new TypeError('Talent choices array required');
 const byName=new Map();
 for(const choice of selections){
  if(!choice||typeof choice!=='object'||Array.isArray(choice)||
     Object.keys(choice).some(k=>!['careerId','talentIndex','rank'].includes(k))||
     !safe(choice.careerId)||!safe(choice.talentIndex)||!safe(choice.rank))
    throw new RangeError('Only trusted talent career/index/rank values accepted');
  const talent=tables.talents[choice.careerId]?.[choice.talentIndex];
  if(!talent?.nom_machine||!Array.isArray(talent.v)||choice.rank>=talent.v.length)
    throw new RangeError('Unknown historical talent or rank');
  if(byName.has(talent.nom_machine)&&byName.get(talent.nom_machine)!==choice.rank)
    throw new Error('Conflicting duplicate named talent rank');
  byName.set(talent.nom_machine,choice.rank);
 }
 const bonuses={},levels={};
 for(const career of tables.talents)for(const talent of career){
  if(!talent?.nom_machine)continue;
  const name=talent.nom_machine,rank=byName.get(name)??0;
  if(!Array.isArray(talent.v)||rank>=talent.v.length||
     !Number.isFinite(talent.v[rank]))throw new RangeError('Unusable historical talent numeric table');
  levels['niveau_'+name]=rank;
  bonuses['bonus_'+name]=talent.v[rank];
 }
 return {levels,bonuses,
  provenance:'Jactari combat.min.js maj_situation talent fields from archived _talents',
  limitations:['Rank choices validated, not entire talent tree progression',
   'Legendary class prerequisites and talents learned for a given hero remain unproved']};
}
