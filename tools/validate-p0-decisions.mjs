#!/usr/bin/env node
/**
 * Vérifie la transcription et la traçabilité des 84 réponses P0.
 * Ce programme ne simule pas le serveur Ubisoft et ne valide pas l'équilibre
 * des valeurs historiques. Node.js >=18, sans dépendance externe.
 *
 * Usage: node tools/validate-p0-decisions.mjs
 */
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const checkFile=p=>existsSync(resolve(root,p));
const src=read('data/decisions/p0-2026-10-23.json');
const policies=read('data/rules/mmhk-like-s2-policy-draft.json');
const rules=read('data/rules/early-game.rules.json');
const traces=read('data/decisions/p0-traceability.json');
const lab=read('data/rules/early-game.profile-lab.json');
const backlog=readFileSync(resolve(root,'docs/backlog/INDEX-STORIES.md'),'utf8');
const unknowns=readFileSync(resolve(root,'docs/research/INCERTITUDES.md'),'utf8');
const allowed=new Set(['confirmed_for_mmhk_like','confirmed_direction_with_parameters_open','delegated_to_research_or_design']);
let checks=0;
let errors=[];
const ok=(p,message)=>{checks++;if(!p)errors.push(message)};
const ids=new Set(src.answers.map(x=>x.id));
const rmIds=new Set(rules.rules.map(x=>x.id));
const traceById=new Map(traces.mappings.map(x=>[x.question_id,x]));
const presentUs=new Set([...backlog.matchAll(/US-[A-Z]{3}-\d{3}/g)].map(x=>x[0]));
const presentU=new Set([...unknowns.matchAll(/\|\s*(U\d{2})\s*\|/g)].map(x=>x[1]));
ok(src.counts.total===84 && src.answers.length===84,'84 réponses attendues');
ok(ids.size===84,'ID Q dupliqué');
ok(rules.rules.length===rules.counts.rules,'comptage des RM');
ok(traces.mappings.length===84,'84 lignes de traçabilité attendues');
ok(checkFile(src.source),'archive des réponses originales absente');
ok(policies.decision_registry==='data/decisions/p0-2026-10-23.json','profil non relié au registre');
ok(lab.release_gates.can_execute_PAR_01===false,'profil labo annoncé exécutable à tort');
for(let i=1;i<=84;i++){
 const id='Q'+String(i).padStart(2,'0');
 const row=src.answers[i-1];
 ok(row?.id===id,'question manquante/mal ordonnée '+id);
 ok(row?.question?.length>10 && row?.answer_original?.length>0 && row?.decision?.length>10,'réponse tronquée '+id);
 ok(allowed.has(row.decision_status),'statut inattendu '+id);
 const trace=traceById.get(id);
 ok(!!trace && trace.rule_ids.length>0,'question sans règle '+id);
 for(const rm of trace?.rule_ids||[])ok(rmIds.has(rm),'règle inexistante '+id+' -> '+rm);
 for(const us of trace?.us||[])ok(presentUs.has(us),'US inexistante '+id+' -> '+us);
 for(const u of trace?.uncertainties||[])ok(presentU.has(u),'incertitude inconnue '+id+' -> '+u);
}
for(const r of rules.rules){
 ok(r.project_decisions?.source===policies.decision_registry,'RM sans registre source '+r.id);
 for(const q of r.project_decisions?.question_refs||[]){
   ok(ids.has(q),'RM référence une Q absente '+r.id+' -> '+q);
   ok(traceById.get(q)?.rule_ids.includes(r.id),'matrice asymétrique '+r.id+' -> '+q);
 }
 for(const p of r.source_documents||[])ok(checkFile(p),'preuve/path absente '+r.id+' '+p);
}
const statusCount=src.answers.reduce((a,x)=>{a[x.decision_status]=(a[x.decision_status]||0)+1;return a},{});
ok(JSON.stringify(statusCount)===JSON.stringify(src.counts.by_status),'décomptes de décision');
ok(policies.historical_fidelity.target_season===2,'référence S2 absente');
ok(policies.prototype.faction==='HAVEN' && policies.prototype.magic_enabled===false && policies.prototype.tiers.join(',')==='1,2,3','prototype Havre T1–T3');
ok(policies.world.topology==='torus','monde non torique');
ok(policies.world.size_presets.very_small.max_players_exclusive===200,'seuil très petit');
ok(policies.world.size_presets.small.max_players_exclusive===500,'seuil petit');
ok(policies.world.size_presets.large.max_players_inclusive===2000,'seuil grand');
ok(policies.world.friend_codes.issued_per_world_player===3,'trois codes amis');
ok(policies.world.protection.duration_days===7 && policies.world.protection.early_cancellation===false,'protection sept jours');
ok(policies.world.protection.unlimited_immunity_of_last_city_to_conquest===true,'dernière cité protégée contre conquête');
ok(policies.region.mine_count===4 && policies.region.regular_region_mines.max_distinct_pairs===1 && policies.region.regular_region_mines.max_occurrences_per_resource===2,'règle unique paire de mines');
ok(policies.economy.production.fractional_accumulator===true && policies.economy.production.bonus_combination==='sum_percentages_then_apply_to_base','fractions et bonus économiques');
ok(policies.economy.maintenance.charge_every_minutes===60 && policies.economy.maintenance.attrition_rate_percent===10,'entretien horaire et attrition');
ok(policies.constructions.city.parallel_slots===1 && policies.constructions.city.cancellation_allowed===false,'chantier unique sans annulation');
ok(policies.constructions.city.fast_mode.cost_factor===1.4 && policies.constructions.city.fast_mode.duration_factor===0.8,'mode rapide');
ok(policies.constructions.city.economy_mode.cost_factor===0.8 && policies.constructions.city.economy_mode.duration_factor===1.4,'mode économique');
ok(policies.heroes.tavern.available_offers===2 && policies.heroes.tavern.refresh_cooldown_hours===12 && policies.heroes.max_owned_per_player_world===15,'taverne');
ok(policies.recruitment.credit_interval_minutes===60 && policies.recruitment.pool_shared_between_basic_and_upgraded_by_tier,'recrues horaires partagées');
ok(policies.recruitment.army_stack_limit===7 && policies.combat.deterministic===true,'combats déterministes à 7 stacks');
ok(policies.timing.world_map_truce.start_local==='23:00' && policies.timing.world_map_truce.end_local==='06:00','trêve de nuit');
ok(policies.timing.server_recovery==='catch_up_elapsed_time','temps écoulé à la reprise');
ok(policies.validation.PAR_01_ready===false,'PAR-01 déclaré prêt à tort');
if(errors.length){console.error('ÉCHEC : '+errors.length+'/'+checks+' contrôles');for(const e of errors)console.error(' - '+e);process.exitCode=1;}
else console.log('OK : '+checks+' contrôles de la transcription P0, traçabilité Q -> RM -> US et contraintes de profil. Aucun moteur de jeu exécuté.');
