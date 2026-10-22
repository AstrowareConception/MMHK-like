/** Extraction reproductible des tables Jactari/MMHK-Plus, source CODE-01.
 * Transformations distribuées sous GPL-3.0-or-later, comme les tables sources.
 * Usage: node tools/extract-reference.mjs --input /chemin/sources
 *        node tools/extract-reference.mjs --download /chemin/cache
 * Node >=18; aucune dépendance npm. Ne jamais évaluer une source non vérifiée.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/source-manifest.json'), 'utf8'));
const mode = process.argv[2], input = process.argv[3];
if (!['--input', '--download'].includes(mode) || !input) throw new Error('Usage: --input DIR ou --download DIR');
fs.mkdirSync(input, { recursive: true });
const sha = (b, kind='sha256') => crypto.createHash(kind).update(b).digest('hex');
const context = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false } });
for (const entry of manifest.files) {
  if (!entry.file.startsWith('donnees.') && entry.file !== 'Licence.txt') continue;
  const local = path.join(input, entry.file);
  if (mode === '--download') {
    const url = `${manifest.repository.replace('github.com', 'raw.githubusercontent.com')}/${manifest.commit}/${entry.path}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status}: ${url}`);
    fs.writeFileSync(local, Buffer.from(await response.arrayBuffer()));
  }
  const bytes = fs.readFileSync(local);
  const blob = sha(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]), 'sha1');
  if (blob !== entry.git_blob_sha || sha(bytes) !== entry.sha256) throw new Error(`Source différente: ${entry.file}`);
  if (entry.file === 'Licence.txt') continue;
  // Seulement les six fichiers déclaratifs épinglés; jamais le simulateur ni un fichier utilisateur arbitraire.
  new vm.Script(bytes.toString('utf8'), { filename: entry.file }).runInContext(context, { timeout: 1000 });
}

// Projection française. Le texte narratif et les références d'images sont exclus.
// Les descriptions mécaniques sont conservées dans les groupes concernés.
function project(value, descriptions=false) {
  if (Array.isArray(value)) return value.map(x => project(x, descriptions));
  if (value && typeof value === 'object') {
    if ('fr' in value && Object.keys(value).every(k => ['fr','en','de','ru'].includes(k)))
      return value.fr || value.en || '';
    return Object.fromEntries(Object.entries(value)
      .filter(([k]) => !['icone','image','nom_abrege','de','ru'].includes(k) && (descriptions || k !== 'description'))
      .map(([k,v]) => [k, project(v, descriptions)]));
  }
  return value;
}
const select = (keys, descriptions=false) => Object.fromEntries(keys.map(k => [k, project(context[k], descriptions)]));
const groups = {
  'general': select(['_version','_versions','_factions','_armes','_ressources','_bonus_larmes_pertes','_bonus_larmes_defense','_fortifications','_lieux','_facteur_bonus','_facteur_pertes','_seuil_fuite_jcj','_seuil_fuite_jce','_bonus_jcj','_voies','_classement_voies','_multiplicateur_voie']),
  'creatures': select(['_unites']),
  'batiments': select(['_categories_batiments','_batiments','_batiments_region'], true),
  'heros': { ...select(['_archetypes']), ...select(['_progression','_niveaux','_carrieres','_talents','_talents_combat','_talents_magie','_apprentissage','_talents_legendary_combat'], true) },
  'sorts': select(['_ecoles_magie','_types_sorts','_cibles_sorts','_unites_sorts','_sorts'], true),
  'artefacts': select(['_effets','_types_effets','_effets_combat','_types_effets_magie','_slots','_types_artefacts','_artefacts','_sets_artefacts'], true),
  'bonus': select(['_competences_alliance','_competences_hereditaires','_competences_speciales'], true)
};
const out = path.join(root, 'data/reference');
fs.mkdirSync(out, { recursive:true });
for (const [name, values] of Object.entries(groups)) fs.writeFileSync(path.join(out, name+'.json'), JSON.stringify({
  _provenance: { source: 'CODE-01', commit: manifest.commit, license: manifest.license, schema_version: 1, locale: 'fr', warning: 'Indices sources conservés. Tables communautaires, pas une configuration de serveur certifiée.' },
  ...values
}, null, 2)+'\n');
fs.copyFileSync(path.join(input, 'Licence.txt'), path.join(out, 'LICENSE-GPL-3.0.txt'));

const clean = x => String(x ?? '—').replaceAll('|','\\|').replaceAll('\n',' ');
const table = (headers, rows) => '| '+headers.join(' | ')+' |\n| '+headers.map(()=> '---').join(' | ')+' |\n'+rows.map(r=>'| '+r.map(clean).join(' | ')+' |').join('\n')+'\n';
const price = c => typeof c === 'object' && c ? Object.entries(c).map(([k,v])=>`${v} ${k}`).join(', ') : String(c??'—');
const header = '# Catalogues de référence extraits\n\nGénéré par `tools/extract-reference.mjs`. Source [CODE-01](../research/SOURCES.md#code-01), commit `'+manifest.commit+'`. Ces tables sont une photographie communautaire de 2013; elles ne prouvent pas la disponibilité de chaque entrée dans toutes les saisons. Descriptions mécaniques et données dérivées sous GPL-3.0-or-later. Voir [le dictionnaire](../../data/README.md).\n\n';
let text = header+'## Unités\n\n`i` est l’indice stable dans `_unites`, **pas** le champ `id` facultatif. I = infanterie, R = tireur, C = cavalerie. G = or, w = bois, o = minerai, m = mercure, c = cristal, s = soufre, g = gemme. Production = valeur brute du catalogue, traditionnellement quotidienne; absente = inconnue/non applicable.\n\n';
for (const f of [0,1,2,3,4,5,6,-1,-2]) {
  text += '### '+(f>=0?groups.general._factions[f].nom:`Autres unités, faction ${f}`)+'\n\n';
  if (f===5||f===6) text += '**Corpus PNJ/PvE : la présence dans les tables ne démontre pas une faction jouable.**\n\n';
  text += table(['i','Nom','Rang','Amélioré','Arme','Puissance','Prod.','Recrutement','Amélioration','Ratio XP'],groups.creatures._unites.map((u,i)=>[u,i]).filter(([u])=>u.faction===f).map(([u,i])=>[i,u.nom,u.rang,u.plus,u.arme,u.puissance,u.prod,price(u.cout),price(u.cout_amel),u.ratio_xp]))+'\n';
}
fs.writeFileSync(path.join(root,'docs/game-design/CATALOGUE-UNITES.md'), text);
text = header+'## Bâtiments de ville\n\nDurée brute en minutes, sans bonus de héros; `domination` est conservé tel quel, et ne doit pas être recalculé systématiquement à 20 % du dernier coût. L’indice 0 est une sentinelle. Les prérequis sont les références brutes; certaines entrées sont incomplètes.\n\n';
text += table(['i','Nom','Faction','Coût','Minutes','Niveau cité requis','Bâtiment requis','Domination'],groups.batiments._batiments.map((b,i)=>[i,b.nom,b.faction,price(b.cout),b.duree,b.prerequis?.niveau_cite,JSON.stringify(b.prerequis?.batiment),b.domination]));
text += '\n## Bâtiments de région\n\nCatalogue partiel : seulement dix entrées; ne constitue pas la liste complète des aménagements. `cout` scalaire et ressources à plat sont conservés dans le JSON.\n\n'+table(['i','Nom','Coût brut','Minutes','Prérequis bruts'],groups.batiments._batiments_region.map((b,i)=>[i,b.nom,price(b.cout)+(b.c?`, ${b.c} c`:''),b.duree,JSON.stringify(b.prerequis??{carriere:b.prerequis_carriere,mine:b.prerequis_mine,batiment:b.batiment})]));
fs.writeFileSync(path.join(root,'docs/game-design/CATALOGUE-BATIMENTS.md'), text);
text = header+'## Sorts\n\nLe coefficient n’est pas une quantité de dégâts universelle. Il dépend du type, de la cible, de l’unité et des multiplicateurs d’arme. Le JSON conserve ces champs.\n\n'+table(['i','Nom','École','Cercle','Type','Coefficient','Effet déclaré'],groups.sorts._sorts.map((s,i)=>[i,s.nom,groups.sorts._ecoles_magie[s.ecole].nom,s.cercle,groups.sorts._types_sorts[s.type],s.puissance,s.description]));
text += '\n## Talents\n\nLes groupes 0–12 ont une carrière nommée. Les groupes 13–20 correspondent aux extensions légendaires du calculateur; le nom de carrière manque dans `_carrieres`. Les valeurs incluent généralement le rang 0.\n\n'+table(['Carrière/groupe','Talent','Valeurs','Effet déclaré'],groups.heros._talents.flatMap((ts,c)=>ts.map(t=>[groups.heros._carrieres[c]?.nom??`groupe ${c} (extension)`,t.nom,JSON.stringify(t.v),t.description])));
fs.writeFileSync(path.join(root,'docs/game-design/CATALOGUE-SORTS-TALENTS.md'),text);
const stats={creatures:context._unites.length,buildings:context._batiments.length-1,regional_buildings:context._batiments_region.length,spells:context._sorts.length,hero_archetypes:context._archetypes.length,careers:context._carrieres.length,talent_groups:context._talents.length,talents:context._talents.flat().length,artifacts:context._artefacts.length-1,artifact_effects:context._effets.length-1,artifact_sets:context._sets_artefacts.length};
fs.writeFileSync(path.join(out,'counts.json'), JSON.stringify(stats,null,2)+'\n');
console.log(JSON.stringify(stats));
