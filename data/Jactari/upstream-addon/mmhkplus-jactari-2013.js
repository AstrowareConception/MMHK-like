MMHKPLUS.Jactari = MMHKPLUS.ExtendableElement.extend({
	elementType : "Jactari",
	internalLastPermalien : "",
	bonus : { data : {graal:0,dolmen:0,cri:0,def:0,ecoles:[0,0,0,0]}},
	heredite : { cv : {d:0, w:0, h:0}, competences : []},
	
	options : {
	},
	
	init : function(options)
	{
		this.options = $.extend({}, this.options, options);
		
		var self = this;
		self.bonusFunction();
		var lang = MMHKPLUS.locale;
		switch (lang) 
		{
			case 'de': self.url_combat = self.base_url + 'Kampf'; break;
			case 'ru': self.url_combat = self.base_url + 'fight_ru'; break;
			case 'fr': self.url_combat = self.base_url + 'combat'; break;
			default: self.url_combat = self.base_url + 'fight'; break;
		};

        //self.url_combat = self.base_url;
		self.herediteFunction();
		
		function ajout_bouton(r) 
		{
			var c,frame = this;
			function createJactariButton(id,def,container,left,top)
			{
				var n = document.getElementById(id);
				if(n) n.parentNode.removeChild(n);
				n = document.createElement('a');
				n.id = id;
				n.href = self.url_combat;
				n.target = '_blank';
				n.title = def?'simulation as defencer':'simulation';
				n.innerHTML = def?'Defender':'Attacker';
				n.addEventListener('click', function(E) { return self.permalien(frame,def); }, true);
				if(left) n.style.left=left+'px';
				if(top) n.style.top=top+'px';
				if(container) container.appendChild(n);
				return n;
			}
			switch(frame.mainElementId.substring(0,4))
			{
				case "Hero":
					c = document.getElementById('HeroFrame'+frame.content.id+'HeroContainer');
					createJactariButton('permalien_jactari',0,c,15,30);
					createJactariButton('permalien_jactari_defencer',1,c,15,55);
					break;
				case "Zone":
					c = frame.contentMainElement;
					createJactariButton('permalien_jactari',undefined,c,280,30);
					break;
				case "Halt":
					c = frame.contentMainElement;
					createJactariButton('permalien_jactari',undefined,c,100,20);
					createJactariButton('permalien_jactari_defencer',1,c,220,20);
					break;
				default: //fight
					c = frame.getChildElement('Defender');	
					createJactariButton('permalien_jactari',undefined,c); 
			}
			return r;
		};
		MMHKPLUS.HOMMK.BattlePrepFrame.prototype.show = injectAfter(MMHKPLUS.HOMMK.BattlePrepFrame.prototype.show, ajout_bouton);
		MMHKPLUS.HOMMK.ZoneBuildingPortalUpgradeFrame.prototype.show = injectAfter(MMHKPLUS.HOMMK.ZoneBuildingPortalUpgradeFrame.prototype.show, ajout_bouton);
		MMHKPLUS.HOMMK.HeroFrame.prototype.show = injectAfter(MMHKPLUS.HOMMK.HeroFrame.prototype.show, ajout_bouton);
		if(MMHKPLUS.HOMMK.ZoneBuildingDungeonUpgradeFrame) // saison < 3
			MMHKPLUS.HOMMK.ZoneBuildingDungeonUpgradeFrame.prototype.show = injectAfter(MMHKPLUS.HOMMK.ZoneBuildingDungeonUpgradeFrame.prototype.show, ajout_bouton);
		if ( MMHKPLUS.getElement("Player").isPVEWorld() )
			MMHKPLUS.HOMMK.HaltFrame.prototype.show = injectAfter(MMHKPLUS.HOMMK.HaltFrame.prototype.show, ajout_bouton);
			
		return this;
	},
	
	//set_artefacts_fixer : {_143:524,_144:525,_145:506,_146:507,_147:508,_148:509,_149:510,_150:511,_508:519,_509:521,_510:535,_511:518,_512:522,_513:520,_514:523,_515:512,_516:513,_517:514,_518:515,_519:516,_520:517,_521:532,_522:533,_523:536,_524:537,_525:538,_526:539,_527:540,_528:541,_529:542,_530:543,_531:544,_532:545,_533:546,_534:547,_535:548,_536:549,_537:528,_538:530,_539:531,_540:527,_541:526,_542:529,_543:534,_544:550,_545:551,_546:552,_547:553},
	// base_url : 'http://jactari.info/mmhk/',
    base_url : MMHKPLUS.URL_JACTARI + "/",
    
	url_combat : '',

	_base64 : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
	_camps : ['attaquant','defenseur'],
	_camps_abr : ['a','d'],
	_factions : 
	{
		ACADEMY:0,HAVEN:1,INFERNO:2,NECROPOLIS:3,SYLVAN:4,FORTRESS:5,DUNGEON:6,NEUTRAL:7,SYLVAN_S:4
	},
	_special_factions :
	{
		SYLVAN_S:122
	},
	_ecoles : 
	{
		SUMMON:0,DARK:1,LIGHT:2,DESTRUCTION:3
	},
	_rangs : 
	{
		T1:0, T1P:1, T2:2, T2P:3, T3:4, T3P:5, T4:6, T4P:7, T5:8, T5P:9, T6:10, T6P:11, T7:12, T7P:13, T8:14, T8P:15, T1S:1,  T2S:2,  T3S:3,  T4S:4,  T5S:5,  T6S:6,  T7S:7
	},
	_neutres : 
	{
		WIND:64, WATER:65, EARTH:66, FIRE:67, DEATHKNIGHT:68, WOLF:86, GNOMESHOOTER:87, GNOME:85, WANDERINGGHOST:88, MANTICORE:89, MINOTAUR:90
	},
	_archetypes : 
	{   
		ARCANE_MAGE:0, DISTURBED_WIZARD:1, FANATIC_SORCERER:2, ILLUMINATED_PROTECTOR:3, MERCENARY:4, OUTLAND_WARRIOR:5, PALADIN:6, PIT_WARRIOR:7,
		PROTECTOR:8, WARMAGE:9, WARMASTER:10, WARRIOR_MAGE:11, SENACHAL:12, SOBERED_WIZARD:13, EXPLORER:14
	},
	_slots : 
	{
		HEAD:0, NECKLACE:1, RING:2, LEFT_HAND:3, CHEST:4, RIGHT_HAND:5, FEET:6, CAPE:7
	},
	_sorts :
	{
		FIST_OF_WRATH:0, WASP_SWARM:1, FIRE_TRAP:2, RAISE_DEAD:3, EARTHQUAKE:4, PHANTOM_FORCES:5, SUMMON_ELEMENTALS:6, FIREWALL:7, CONJURE_PHOENIX:8,
		WEAKNESS:9, SICKNESS:10, GUARD_BREAK:11, DISEASE:12, VULNERABILITY:13, SLOW:14, PLAGUE:15, DEATH_TOUCH:16, WORD_OF_DEATH:17,
		DIVINE_STRENGTH:18, BLESS:19, MYSTIC_SHIELD:20, HASTE:21, RIGHTEOUS_MIGHT:22, DEFLECT_MISSILE:23, TELEPORTATION:24, WORD_OF_LIGHT:25, RESURRECTION:26,
		STONE_SPIKES:27, ELDERTICH_ARROW:28, ICE_BOLT:29, LIGHTNING_BOLT:30, CIRCLE_OF_WINTER:31, FIREBALL:32, METEOR_SHOWER:33, CHAIN_LIGHTNING:34, IMPLOSION:35
	},
	_competences_hereditaires : 
	{
		BARRAGE_FIRE: 'tir_de_barrage', MAGIC_RESISTANCE: 'resistance_magique', SPELL_MASTERY: 'maitrise_des_sorts', RESURRECTION: 'resurrection',
		BATTLE_LOOT: 'butin_de_guerre', CHARACTERISTICS_ILLUMINATION: 'revelation_de_caracteristiques', MORAL_BOOST: 'moral_eleve', TOUGHER_HERO: 'heros_superieur', RAISE_DEAD: 'relever_les_morts'
	},
	_fortifications : 
	{
		FORT:1, CITADEL:2, CASTLE:3
	},

	prepare_troupe : function(donnees) 
	{
		var self = this;
		var u = 0;
		if (donnees.factionEntityTagName == 'NEUTRAL' ) 
		{
			u = self._neutres[donnees.tier];
		}
		else 
		{
			var rang = self._rangs[donnees.tier];
			var faction = self._factions[donnees.factionEntityTagName];
			if(donnees.tier.indexOf("S") != -1)
				u = self._special_factions[donnees.factionEntityTagName + "_S"] + rang;
			else
				u = (faction * 16) + (rang & 15) + (faction == 4 ? 5 : 0) + (faction >= 5 ? 11 : 0);
		}
		return {unite:u, nombre:donnees.quantity};
	},
	
	prepare_talent : function(a,talent) 
	{
		/*
		 
		In Jactari by Aspirin, IDs of Legendary skills ares like this: 
		 
		triplets[36]|=(donnees.a.legendary_sovereign_a&3)<<21;
		triplets[36]|=(donnees.a.legendary_sovereign_b&3)<<18;
		triplets[36]|=(donnees.a.legendary_sovereign_c&3)<<15;
		triplets[36]|=(donnees.a.legendary_legwarrior_a&3)<<12;
		triplets[36]|=(donnees.a.legendary_legwarrior_b&3)<<9;
		triplets[36]|=(donnees.a.legendary_legwarrior_c&3)<<6;
		triplets[36]|=(donnees.a.legendary_magehunter_a&3)<<3;
		triplets[36]|=(donnees.a.legendary_magehunter_b&3);
		
		triplets[37]|=(donnees.a.legendary_magehunter_c&3)<<21;
		triplets[37]|=(donnees.a.legendary_legpaladin_a&3)<<18;
		triplets[37]|=(donnees.a.legendary_legpaladin_b&3)<<15;
		triplets[37]|=(donnees.a.legendary_legpaladin_c&3)<<12;
		triplets[37]|=(donnees.a.legendary_ethernalnight_a&3)<<9;
		triplets[37]|=(donnees.a.legendary_ethernalnight_b&3)<<6;
		triplets[37]|=(donnees.a.legendary_ethernalnight_c&3)<<3;
		triplets[37]|=(donnees.a.legendary_kingundead_a&3);
		
		triplets[38]|=(donnees.a.legendary_kingundead_b&3)<<21;
		triplets[38]|=(donnees.a.legendary_kingundead_c&3)<<18;
		triplets[38]|=(donnees.a.legendary_legmagician_a&3)<<15;
		triplets[38]|=(donnees.a.legendary_legmagician_b&3)<<12;
		triplets[38]|=(donnees.a.legendary_legmagician_c&3)<<9;
		triplets[38]|=(donnees.a.legendary_dragonkinght_a&3)<<6;
		triplets[38]|=(donnees.a.legendary_dragonkinght_b&3)<<3;
		triplets[38]|=(donnees.a.legendary_dragonkinght_c&3);

		*/
		var self = this;
		switch (talent.heroClassSkillEntityTagName) 
		{
			case 'ARMY_ATTACK_POWER_INCREASE': a.tacticien = talent.level; break;
			case 'CAVALRY_ATTACK_POWER_INCREASE': a.ecuyer = talent.level; break;
			case 'SHOOTER_ATTACK_POWER_INCREASE': a.tireur_elite = talent.level; break;
			case 'INFANTRY_ATTACK_POWER_INCREASE': a.commandant_infanterie = talent.level; break;
			case 'ARMY_DEFENSE_POWER_INCREASE': a.tacticien_defenseur = talent.level; break;
			case 'CAVALRY_DEFENSE_POWER_INCREASE': a.ecuyer_defenseur = talent.level; break;
			case 'SHOOTER_DEFENSE_POWER_INCREASE': a.expert_tirs_barrage = talent.level; break;
			case 'INFANTRY_DEFENSE_POWER_INCREASE': a.inebranlable = talent.level; break;
			case 'ATTRITION_RATE_DECREASE': a.logisticien = talent.level; break;
			case 'SUMMON_ADDED_BATTLE_SPELL_LEVEL': a.arcanes = talent.level; break;
			case 'SUMMON_SPELLBOOK_SPELL_NUMBER': break;
			case 'SUMMON_SPELL_EFFICIENCY': a.expert[0] = talent.level; break;
			case 'SUMMON_ADDED_MAGIC_POINTS': a.instinct[0] = talent.level; break;
			case 'DARK_ADDED_BATTLE_SPELL_LEVEL': a.arcanes = talent.level; break;
			case 'DARK_SPELLBOOK_SPELL_NUMBER': break;
			case 'DARK_SPELL_EFFICIENCY': a.expert[1] = talent.level; break;
			case 'DARK_ADDED_MAGIC_POINTS': a.instinct[1] = talent.level; break;
			case 'LIGHT_ADDED_BATTLE_SPELL_LEVEL': a.arcanes = talent.level; break;
			case 'LIGHT_SPELLBOOK_SPELL_NUMBER': break;
			case 'LIGHT_SPELL_EFFICIENCY': a.expert[2] = talent.level; break;
			case 'LIGHT_ADDED_MAGIC_POINTS': a.instinct[2] = talent.level; break;
			case 'DESTRUCTION_ADDED_BATTLE_SPELL_LEVEL': a.arcanes = talent.level; break;
			case 'DESTRUCTION_SPELLBOOK_SPELL_NUMBER': break;
			case 'DESTRUCTION_SPELL_EFFICIENCY': a.expert[3] = talent.level; break;
			case 'DESTRUCTION_ADDED_MAGIC_POINTS': a.instinct[3] = talent.level; break;
			case 'UNIT_PRODUCTION_INCREASE': break;
			case 'UNIT_RECRUITMENT_SPEED_INCREASE': break;
			case 'NEUTRAL_STACK_RECRUITMENT_INCREASE': break;
			case 'ATTACK_POWER_PER_UNIT_INCREASE': a.harangueur = talent.level; break;
			case 'SCOUTING_DETECT_LEVEL_INCREASE': break;
			case 'ATTRITION_RATE_INCREASE': a.massacreur = talent.level; break;
			case 'PILLAGE_INCREASE': break;
			case 'DEFENSE_POWER_PER_UNIT_INCREASE': a.bon_payeur = talent.level; break;
			
			// Legendary classes
			case 'MASTER_HARANGUER' : a.legendary_sovereign_a = talent.level; break
			case 'MASTER_FIGHTER' : a.legendary_sovereign_b = talent.level; break
			case 'RUTHLESS' : a.legendary_sovereign_c = talent.level; break
			
			case 'MASTER_FIGHTER_2' : a.legendary_legwarrior_a = talent.level; break
			case 'MASTER_DEFENDER' : a.legendary_legwarrior_b = talent.level; break
			case 'WALL_BREAKER' : a.legendary_legwarrior_c = talent.level; break
			
			case 'HERO_ATTACK_DECREASE' : a.legendary_magehunter_a = talent.level; break
			case 'HERO_MAGIC_DECREASE' : a.legendary_magehunter_b = talent.level; break
			case 'HERO_MAGIC_RESISTANCE' : a.legendary_magehunter_c = talent.level; break
			
			case 'GUARDIAN' : a.legendary_legpaladin_a = talent.level; break
			case 'MASTER_DEFENDER_2' : a.legendary_legpaladin_b = talent.level; break
			case 'DIVINE_INSPIRATION' : a.legendary_legpaladin_c = talent.level; break
			
			case 'GUARDIAN_2' : a.legendary_ethernalnight_a = talent.level; break
			case 'MILITARY_ENGINEERING' : a.legendary_ethernalnight_b = talent.level; break
			case 'ETERNAL_DARKNESS' : a.legendary_ethernalnight_c = talent.level; break
			
			case 'ETERNAL_DARKNESS_2' : a.legendary_kingundead_a = talent.level; break
			case 'SUPREME_SUMMONER' : a.legendary_kingundead_b = talent.level; break
			case 'RUTHLESS_3' : a.legendary_kingundead_c = talent.level; break
			
			case 'SUPREME_SUMMONER_2' : a.legendary_legmagician_a = talent.level; break
			case 'DIVINE_INSPIRATION_2' : a.legendary_legmagician_b = talent.level; break
			case 'GUARDIAN_3' : a.legendary_legmagician_c = talent.level; break
			
			case 'RUTHLESS_2' : a.legendary_dragonkinght_a = talent.level; break
			case 'GREAT_DESTROYER' : a.legendary_dragonkinght_b = talent.level; break
			case 'MASTER_FIGHTER_3' : a.legendary_dragonkinght_c = talent.level; break
		}
	},
	
	prepare_heros : function(a,heros) 
	{
		var self = this;
		a.faction = self._factions[heros.factionEntityTagName];
		a.statut = 1;
		a.heros = 1;
		a.niveau = heros._level;
		a.archetype = self._archetypes[heros.heroTrainingEntityTagName];
		a.malus_attaque = 0;
	},
	
	prepare_artefacts : function(a,artefacts) 
	{
		var self = this;
		var id, slot, artefacts = artefacts || [];
		artefacts.forEach(function(artefact)
			{
				slot = self._slots[artefact.artefactEntity.bodyPart];
				id = artefact.artefactEntity.id;
				/*if(self.set_artefacts_fixer['_'+id])
				{
					id = self.set_artefacts_fixer['_'+id];
				}*/
				a.artefacts[slot] = id;
			}
		);
	},
	
	herediteFunction : function() 
	{
		var self = this;
		MMHKPLUS.getElement("Ajax").getProfileFrame(MMHKPLUS.getElement("Player").get("playerId"),
			function(json)
			{
				json.d[Object.keys(json.d)[0]].playerHeredityAbilityList.forEach(function(comp)
					{
						self.heredite.competences.push(comp);
						var voie = comp.heredityAbilityEntity.rankingPath.substr(0,1).toLowerCase();
						if (comp.bonus == true) 
						{
							self.heredite.cv[voie] = 3;
						}
						else if (comp.malus == true)  
						{
							self.heredite.cv[voie] = 1;
						}
						else  
						{
							self.heredite.cv[voie] = 2;
						}
					}
				);
			}
		);
	},
		
	bonusFunction : function() 
	{
		var self = this;
		if(MMHKPLUS.getElement("Player").isInAlliance())
		{
			MMHKPLUS.getElement("Ajax").getAllianceFrame(MMHKPLUS.getElement("Player").get("allianceId"),
				function(json)
				{
					var key = Object.keys(json.d)[0];
					self.bonus.data.graal = json.d[key].cumulTear || 0;
					var ability = json.d[key].runningAbility;
					self.bonus.data.cri = (ability && ability.abilityEntityId==1)?ability.level:0;
					self.bonus.data.def = (ability && ability.abilityEntityId==2)?ability.level:0;
				}
			);
		}
		var cities = MMHKPLUS.getElement("Player").getCities();

		cities.forEach(function(city)
			{
				if(city.content)
				{
					city = city.content;
					if(city && city.id && city.tmpBuiltCityBuilding && city.tmpBuiltCityBuilding[23])
					{
						MMHKPLUS.getElement("Ajax").getMagicGuildFrame(city.id,
							function(json)
							{
								var skills = json.d[Object.keys(json.d)[0]].spellStackList;
								if(skills[8] && skills[8].attachedSpellEntity.magicSchoolLevel == 5)
								{
									self.bonus.data.ecoles[self._ecoles[skills[8].attachedSpellEntity.magicSchoolEntityTagName]]++;
								}
							}
						);
					}
				}
				
			}
		);
	},

	encode_donnees_combat : function(donnees) 
	{
		var self = this;
        var triplets=[];
        var version=5;
        triplets[0]|=(version&63)<<18;
        triplets[0]|=(donnees.d.lieu&3)<<16;
        triplets[0]|=(donnees.a.statut&1)<<15;
        triplets[0]|=(donnees.a.heros&1)<<14;
        triplets[0]|=(donnees.a.cri_de_guerre&3)<<12;
        triplets[0]|=(donnees.a.inspiration&3)<<10;
        triplets[0]|=(donnees.a.dolmens&15)<<6;
        triplets[0]|=(donnees.a.niveau&63);
        triplets[1]|=(donnees.a.artefacts[0]&2047)<<13;
        triplets[1]|=(donnees.a.tacticien&3)<<11;
        triplets[1]|=(donnees.a.artefacts[1]&2047);
        triplets[2]|=(donnees.a.artefacts[2]&2047)<<13;
        triplets[2]|=(donnees.a.ecuyer&3)<<11;
        triplets[2]|=(donnees.a.artefacts[3]&2047);
        triplets[3]|=(donnees.a.artefacts[4]&2047)<<13;
        triplets[3]|=(donnees.a.tireur_elite&3)<<11;
        triplets[3]|=(donnees.a.artefacts[5]&2047);
        triplets[4]|=(donnees.a.artefacts[6]&2047)<<13;
        triplets[4]|=(donnees.a.commandant_infanterie&3)<<11;
        triplets[4]|=(donnees.a.artefacts[7]&2047);
        triplets[5]|=(donnees.a.logisticien&3)<<22;
        triplets[5]|=(donnees.a.harangueur&3)<<20;
        triplets[5]|=(donnees.a.sapeur&3)<<18;
        triplets[5]|=(donnees.a.massacreur&3)<<16;
        triplets[5]|=(donnees.a.instinct[0]&3)<<14;
        triplets[5]|=(donnees.a.expert[0]&3)<<12;
        triplets[5]|=(donnees.a.instinct[1]&3)<<10;
        triplets[5]|=(donnees.a.expert[1]&3)<<8;
        triplets[5]|=(donnees.a.instinct[2]&3)<<6;
        triplets[5]|=(donnees.a.expert[2]&3)<<4;
        triplets[5]|=(donnees.a.instinct[3]&3)<<2;
        triplets[5]|=(donnees.a.expert[3]&3);
        triplets[6]|=(donnees.a.bonus_ecole[0]&15)<<20;
        triplets[6]|=(donnees.a.bonus_ecole[1]&15)<<16;
        triplets[6]|=(donnees.a.bonus_ecole[2]&15)<<12;
        triplets[6]|=(donnees.a.bonus_ecole[3]&15)<<8;
        triplets[6]|=(donnees.a.larmes&31)<<3;
        triplets[6]|=(donnees.a.faction&7);
        triplets[7]|=(donnees.a.mhr.signe&1)<<23;
        triplets[7]|=(donnees.a.mhr.valeur&131071)<<6;
        triplets[7]|=(donnees.a.archetype&15)<<2;
        triplets[7]|=(donnees.a.arcanes&3);
        triplets[8]|=(donnees.d.mhr.signe&1)<<23;
        triplets[8]|=(donnees.d.mhr.valeur&131071)<<6;
        triplets[8]|=(donnees.d.larmes&31)<<1;
        triplets[9]|=(donnees.d.statut&1)<<23;
        triplets[9]|=(donnees.d.heros&1)<<22;
        triplets[9]|=(donnees.d.fortification&3)<<20;
        triplets[9]|=(donnees.d.dolmens&15)<<16;
        triplets[9]|=(donnees.d.forts&7)<<13;
        triplets[9]|=(donnees.d.fort_principal&1)<<12;
        triplets[9]|=(donnees.d.ralliement&3)<<10;
        triplets[9]|=(donnees.d.inspiration&3)<<8;
        triplets[9]|=(donnees.d.archetype&15)<<4;
        triplets[9]|=(donnees.d.faction&7)<<1;
        triplets[10]|=(donnees.d.bonus_ecole[0]&15)<<20;
        triplets[10]|=(donnees.d.bonus_ecole[1]&15)<<16;
        triplets[10]|=(donnees.d.bonus_ecole[2]&15)<<12;
        triplets[10]|=(donnees.d.bonus_ecole[3]&15)<<8;
        triplets[10]|=(donnees.d.arcanes&3)<<6;
        triplets[10]|=(donnees.d.niveau&63);
        triplets[11]|=(donnees.d.artefacts[0]&2047)<<13;
        triplets[11]|=(donnees.d.tacticien_defenseur&3)<<11;
        triplets[11]|=(donnees.d.artefacts[1]&2047);
        triplets[12]|=(donnees.d.artefacts[2]&2047)<<13;
        triplets[12]|=(donnees.d.ecuyer_defenseur&3)<<11;
        triplets[12]|=(donnees.d.artefacts[3]&2047);
        triplets[13]|=(donnees.d.artefacts[4]&2047)<<13;
        triplets[13]|=(donnees.d.expert_tirs_barrage&3)<<11;
        triplets[13]|=(donnees.d.artefacts[5]&2047);
        triplets[14]|=(donnees.d.artefacts[6]&2047)<<13;
        triplets[14]|=(donnees.d.inebranlable&3)<<11;
        triplets[14]|=(donnees.d.artefacts[7]&2047);
        triplets[15]|=(donnees.d.logisticien&3)<<22;
        triplets[15]|=(donnees.d.bon_payeur&3)<<20;
        triplets[15]|=(donnees.d.batisseur_fortifications&3)<<18;
        triplets[15]|=(donnees.d.massacreur&3)<<16;
        triplets[15]|=(donnees.d.instinct[0]&3)<<14;
        triplets[15]|=(donnees.d.expert[0]&3)<<12;
        triplets[15]|=(donnees.d.instinct[1]&3)<<10;
        triplets[15]|=(donnees.d.expert[1]&3)<<8;
        triplets[15]|=(donnees.d.instinct[2]&3)<<6;
        triplets[15]|=(donnees.d.expert[2]&3)<<4;
        triplets[15]|=(donnees.d.instinct[3]&3)<<2;
        triplets[15]|=(donnees.d.expert[3]&3);
        for (var c=0;c<self._camps_abr.length;c++) 
        {
            for (var p = 1; p < 8; p++)
            {
                var u = donnees[self._camps_abr[c]].troupes[p].unite;
                if (u == -1) u = 255;
                triplets[15+p+(c*7)] |= (u & 255) << 16;
                triplets[15+p+(c*7)] |= (donnees[self._camps_abr[c]].troupes[p].nombre & 65535);
            }
        }
        triplets[30]|=(donnees.a.sort[0].id&63)<<18;
        triplets[30]|=(donnees.a.sort[0].tour&15)<<14;
        triplets[30]|=(donnees.a.sort[1].id&63)<<6;
        triplets[30]|=(donnees.a.sort[1].tour&15)<<2;
        triplets[30]|=(donnees.saison&12) >> 2;
        triplets[31]|=(donnees.d.sort[0].id&63)<<18;
        triplets[31]|=(donnees.d.sort[0].tour&15)<<14;
        triplets[31]|=(donnees.d.sort[1].id&63)<<6;
        triplets[31]|=(donnees.d.sort[1].tour&15)<<2;
        triplets[31]|=(donnees.saison&3);
        triplets[32]|=(donnees.a.butin_de_guerre&15)<<20;
        triplets[32]|=(donnees.a.relever_les_morts&15)<<16;
        triplets[32]|=(donnees.a.resistance_magique&15)<<12;
        triplets[32]|=(donnees.a.moral_eleve&15)<<8;
        triplets[32]|=(donnees.a.resurrection&15)<<4;
        triplets[32]|=(donnees.a.tir_de_barrage&15);
        triplets[33]|=(donnees.a.heros_superieur&15)<<20;
        triplets[33]|=(donnees.a.maitrise_des_sorts&15)<<16;
        triplets[33]|=(donnees.a.revelation_de_caracteristiques&15)<<12;
        triplets[33]|=(donnees.d.butin_de_guerre&15)<<8;
        triplets[33]|=(donnees.d.relever_les_morts&15)<<4;
        triplets[33]|=(donnees.d.resistance_magique&15);
        
        triplets[34]|=(donnees.d.moral_eleve&15)<<20;
        triplets[34]|=(donnees.d.resurrection&15)<<16;
        triplets[34]|=(donnees.d.tir_de_barrage&15)<<12;
        triplets[34]|=(donnees.d.heros_superieur&15)<<8;
        triplets[34]|=(donnees.d.maitrise_des_sorts&15)<<4;
        triplets[34]|=(donnees.d.revelation_de_caracteristiques&15);
        
        triplets[35]|=(donnees.a.classement_voies&7)<<21; // D > W > H
        triplets[35]|=(donnees.d.classement_voies&7)<<18; // D > W > H
        triplets[35]|=(donnees.a.malus_attaque&63)<<12; // attack malus
        if(donnees.a.statut==0){
            triplets[35]|=(donnees.a.antimagie&15)<<8;
            triplets[35]|=(donnees.a.baliste&15)<<4;
            triplets[35]|=(donnees.a.pieges&15)
        }
        
        if(donnees.d.statut==0){
            triplets[35]|=(donnees.d.antimagie&15)<<8;
            triplets[35]|=(donnees.d.baliste&15)<<4;
            triplets[35]|=(donnees.d.pieges&15)
        }

        triplets[36]|=(donnees.a.legendary_sovereign_a&3)<<21;
        triplets[36]|=(donnees.a.legendary_sovereign_b&3)<<18;
        triplets[36]|=(donnees.a.legendary_sovereign_c&3)<<15;
        triplets[36]|=(donnees.a.legendary_legwarrior_a&3)<<12;
        triplets[36]|=(donnees.a.legendary_legwarrior_b&3)<<9;
        triplets[36]|=(donnees.a.legendary_legwarrior_c&3)<<6;
        triplets[36]|=(donnees.a.legendary_magehunter_a&3)<<3;
        triplets[36]|=(donnees.a.legendary_magehunter_b&3);

        triplets[37]|=(donnees.a.legendary_magehunter_c&3)<<21;
        triplets[37]|=(donnees.a.legendary_legpaladin_a&3)<<18;
        triplets[37]|=(donnees.a.legendary_legpaladin_b&3)<<15;
        triplets[37]|=(donnees.a.legendary_legpaladin_c&3)<<12;
        triplets[37]|=(donnees.a.legendary_ethernalnight_a&3)<<9;
        triplets[37]|=(donnees.a.legendary_ethernalnight_b&3)<<6;
        triplets[37]|=(donnees.a.legendary_ethernalnight_c&3)<<3;
        triplets[37]|=(donnees.a.legendary_kingundead_a&3);

        triplets[38]|=(donnees.a.legendary_kingundead_b&3)<<21;
        triplets[38]|=(donnees.a.legendary_kingundead_c&3)<<18;
        triplets[38]|=(donnees.a.legendary_legmagician_a&3)<<15;
        triplets[38]|=(donnees.a.legendary_legmagician_b&3)<<12;
        triplets[38]|=(donnees.a.legendary_legmagician_c&3)<<9;
        triplets[38]|=(donnees.a.legendary_dragonkinght_a&3)<<6;
        triplets[38]|=(donnees.a.legendary_dragonkinght_b&3)<<3;
        triplets[38]|=(donnees.a.legendary_dragonkinght_c&3);

        triplets[39]|=(donnees.d.legendary_sovereign_a&3)<<21;
        triplets[39]|=(donnees.d.legendary_sovereign_b&3)<<18;
        triplets[39]|=(donnees.d.legendary_sovereign_c&3)<<15;
        triplets[39]|=(donnees.d.legendary_legwarrior_a&3)<<12;
        triplets[39]|=(donnees.d.legendary_legwarrior_b&3)<<9;
        triplets[39]|=(donnees.d.legendary_legwarrior_c&3)<<6;
        triplets[39]|=(donnees.d.legendary_magehunter_a&3)<<3;
        triplets[39]|=(donnees.d.legendary_magehunter_b&3);

        triplets[40]|=(donnees.d.legendary_magehunter_c&3)<<21;
        triplets[40]|=(donnees.d.legendary_legpaladin_a&3)<<18;
        triplets[40]|=(donnees.d.legendary_legpaladin_b&3)<<15;
        triplets[40]|=(donnees.d.legendary_legpaladin_c&3)<<12;
        triplets[40]|=(donnees.d.legendary_ethernalnight_a&3)<<9;
        triplets[40]|=(donnees.d.legendary_ethernalnight_b&3)<<6;
        triplets[40]|=(donnees.d.legendary_ethernalnight_c&3)<<3;
        triplets[40]|=(donnees.d.legendary_kingundead_a&3);

        triplets[41]|=(donnees.d.legendary_kingundead_b&3)<<21;
        triplets[41]|=(donnees.d.legendary_kingundead_c&3)<<18;
        triplets[41]|=(donnees.d.legendary_legmagician_a&3)<<15;
        triplets[41]|=(donnees.d.legendary_legmagician_b&3)<<12;
        triplets[41]|=(donnees.d.legendary_legmagician_c&3)<<9;
        triplets[41]|=(donnees.d.legendary_dragonkinght_a&3)<<6;
        triplets[41]|=(donnees.d.legendary_dragonkinght_b&3)<<3;
        triplets[41]|=(donnees.d.legendary_dragonkinght_c&3);

        var code='';
        for (var t=0;t<=41;t++) {
            code+=self._base64.charAt((triplets[t]>>18)&63);
            code+=self._base64.charAt((triplets[t]>>12)&63);
            code+=self._base64.charAt((triplets[t]>>6)&63);
            code+=self._base64.charAt((triplets[t])&63);
        }
        return code;
	},
	
	isHeroAtackuer : function( frame, isDefence ) 
	{
		var self = this;
		var heroAttaqant = true;
		if ( frame && frame.unitStackLevelSelectElement && frame.content && frame.content.unitStackByLevel ) 
		{	
			var selectedLevel = frame.unitStackLevelSelectElement.value;
			if ( selectedLevel >= 0 ) 
			{
				var levelParams = frame.content.unitStackByLevel[selectedLevel];
				if ( levelParams.combatType == "DEFENSE" )
					heroAttaqant = false;
			}
		}
		if ( frame && isDefence == 1 )
			heroAttaqant = false;
		return heroAttaqant;
	},
	
	getJactariButtonLink : function( frame, isDefence )
	{
		var self = this;
		if ( frame ) 
		{
			if ( isDefence != 1 )
				var n = document.getElementById('permalien_jactari');
			else
				var n = document.getElementById('permalien_jactari_defencer');
		}
		return n;
	},

	permalien : function(frame,spy_attaquer,spy_defenser,spy_city_defense)
	{
		var self = this;
		var heroAttaqant = self.isHeroAtackuer( frame, spy_attaquer );
		var jactariButton = self.getJactariButtonLink( frame, spy_attaquer );
		var donnees = 
			{
				saison:0,
				a : 
					{ statut:1, dolmens:0, cri_de_guerre:0, inspiration:0, heros:0, niveau:1, faction:0, archetype:0, artefacts:[0,0,0,0,0,0,0,0],
						tacticien:0, ecuyer:0, tireur_elite:0, commandant_infanterie:0, logisticien:0, harangueur:0, sapeur:0, massacreur:0,
						instinct:[0,0,0,0], expert:[0,0,0,0], arcanes:0, bonus_ecole:[0,0,0,0], larmes:0, mhr:{signe:0, valeur:0},
						sort:[ {id:-1, tour:1}, {id:-1, tour:2} ],
						troupes:[ {}, {unite:255,nombre:0}, {unite:255,nombre:0}, {unite:255,nombre:0}, {unite:255,nombre:0}, {unite:255,nombre:0}, {unite:255,nombre:0}, {unite:255,nombre:0} ],
						butin_de_guerre:0, relever_les_morts:0, resistance_magique:0, moral_eleve:0, resurrection:0, tir_de_barrage:0, heros_superieur:0,
						maitrise_des_sorts:0, revelation_de_caracteristiques:0, classement_voies:0
					},
				d : 
					{
						statut:0, lieu:0, fortification:0, forts:0, fort_principal:0, dolmens:0, ralliement:0, inspiration:0, heros:0, niveau:1,
						faction:0, archetype:0, artefacts:[0,0,0,0,0,0,0,0],
						tacticien_defenseur:0, ecuyer_defenseur:0, expert_tirs_barrage:0, inebranlable:0, logisticien:0, bon_payeur:0, batisseur_fortifications:0, massacreur:0,
						instinct:[0,0,0,0], expert:[0,0,0,0], arcanes:0, bonus_ecole:[0,0,0,0], larmes:0, mhr:{signe:0, valeur:0},
						sort:[ {id:-1, tour:1}, {id:-1, tour:2} ],
						troupes:[ {}, {unite:255,nombre:0}, {unite:255,nombre:0}, {unite:255,nombre:0}, {unite:255,nombre:0}, {unite:255,nombre:0}, {unite:255,nombre:0}, {unite:255,nombre:0} ],
						butin_de_guerre:0, relever_les_morts:0, resistance_magique:0, moral_eleve:0, resurrection:0, tir_de_barrage:0, heros_superieur:0,
						maitrise_des_sorts:0, revelation_de_caracteristiques:0, classement_voies:0
					}
			};
		
		donnees.saison = MMHKPLUS.getElement("Player").get("season");	
		if(donnees.saison < 3)
			donnees.saison = 3;
		if ( !heroAttaqant )
		{
			donnees.a.statut = 0;	
			donnees.d.statut = 1;
		}
		
		if ( heroAttaqant ) 
		{
			var playerHero = donnees.a;
			var versusHero = donnees.d;
		} 
		else 
		{
			var playerHero = donnees.d;
			var versusHero = donnees.a;
		}
		

		if ( self.bonus.data && self.bonus.data.graal ) 
			playerHero.larmes = self.bonus.data.graal;
		if ( self.bonus.data && self.bonus.data.cri )
			playerHero.cri_de_guerre = self.bonus.data.cri;
		if ( self.bonus.data && self.bonus.data.def )
			playerHero.ralliement = self.bonus.data.def;
		if ( frame )		
			playerHero.bonus_ecole = self.bonus.data.ecoles;
		else 
		{
			var playerHeroes = MMHKPLUS.getElement("Player").getHeroes();
			var isMyHero = false;
			var tmpAttacker = spy_attaquer.hero || spy_attaquer;
			playerHeroes.forEach(function(h)
				{
					if(tmpAttacker.id == h.content.id)
						isMyHero = true;
				}
			);
			if ( spy_attaquer.bonus && isMyHero)
				donnees.a.bonus_ecole = self.bonus.data.ecoles;
			else
				donnees.d.bonus_ecole = self.bonus.data.ecoles;
		}
		
		if ( frame )
			var hero = (frame.linkedHero || frame.hero || frame.selectedHero);	
		var heros = frame ? hero.content : (spy_attaquer.hero || spy_attaquer);
		self.prepare_heros( playerHero, heros );
		
        // dont understand how correctly apply this code, try here
        heros.isMainHero = heros.id ? ($('#Hero' + heros.id + ' .heroMainHeroBorder').length > 0) : undefined;
        
		if ( !frame ) 
		{
			if ( spy_attaquer.bonus ) 
			{
				var talents = spy_attaquer.bonus.skills;
				if ( talents !== undefined ) 
				{
					for (var t = 0; t < talents.length; t++)
					{
						var talent = talents[t];
						self.prepare_talent(donnees.a, talent);
					}
				}
				var artefacts = spy_attaquer.bonus.artefacts;    
				self.prepare_artefacts(donnees.a, artefacts);
			}
		}
		else if  ( heros.heroBonuses )
		{
			var talents = heros.heroBonuses.skills.local;
			if ( talents !== undefined ) 
			{
				for (var t = 0; t < talents.length; t++) 
				{
					var talent = talents[t];
					self.prepare_talent(playerHero, talent);
				}
			}
			var artefacts = heros.heroBonuses.artefacts.local; 
			self.prepare_artefacts(playerHero, artefacts);
		}
		else if ( MMHKPLUS.HOMMK.elementPool.obj.HeroFrame && MMHKPLUS.HOMMK.elementPool.obj.HeroFrame.obj[heros.id] ) 
		{
			var h = MMHKPLUS.HOMMK.elementPool.obj.HeroFrame.obj[heros.id].content;
			var talents = h.heroSkillList;
			if (talents !== undefined) 
			{
				for (var t = 0; t < talents.length; t++)
				{
					var talent = talents[t];
					self.prepare_talent(playerHero, talent);
				}
			}
			var artefacts = h.equipedArtefacts;
			self.prepare_artefacts(playerHero, artefacts);
		}
		
		if ( heros.isMainHero ) 
		{
			self.heredite.competences.forEach(function(competence)
				{
					var c_nom = competence.heredityAbilityEntity.tagName;
					var c_niveau = competence.level;
					playerHero[self._competences_hereditaires[c_nom]] = c_niveau;
				}
			);
			var cv = self.heredite.cv;
			var c = 0;
			if (cv.d == 0 && cv.w > 0 && cv.h > 0) cv.d = 6 - cv.w - cv.h;
			if (cv.d > 0 && cv.w == 0 && cv.h > 0) cv.w = 6 - cv.d - cv.h;
			if (cv.d > 0 && cv.w > 0 && cv.h == 0) cv.h = 6 - cv.w - cv.d;
			if (cv.d > 0 && cv.w == 0 && cv.h == 0 && cv.d != 2) c = ((cv.d == 3)?1:6);
			if (cv.d == 0 && cv.w > 0 && cv.h == 0 && cv.w != 2) c = ((cv.w == 3)?3:5);
			if (cv.d == 0 && cv.w == 0 && cv.h > 0 && cv.h != 2) c = ((cv.h == 3)?6:1);
			if (cv.d > 0 && cv.w > 0 && cv.h > 0) {
				if (cv.d == 3) c = ((cv.w == 2)?1:2);
				if (cv.w == 3) c = ((cv.d == 2)?3:4);
				if (cv.h == 3) c = ((cv.d == 2)?5:6);
			}
			playerHero.classement_voies = c;
		}
		
		if ( frame )
			var sorts = frame.RoundSpellStackList ? frame.RoundSpellStackList.elementList : [];
		else
			var sorts = heros.spellStackList || heros.spellBookSpellStackList || []; 
			
		for (var i = 0; i < sorts.length; i++)
		{
			var sort = sorts[i].content;
			if(sort)
			{
				playerHero.sort[i].id = self._sorts[sort.spellEntityTagName];
				playerHero.sort[i].tour = sort.roundPosition;
			}
		}
		
		if(sorts.length == 2)
		{
			if(hasProperty(sorts[0], "content") && hasProperty(sorts[1], "content"))
			{
				if(sorts[0].content.attachedSpellEntity.magicSchoolLevel < sorts[1].content.attachedSpellEntity.magicSchoolLevel )
				{
					var tmp = playerHero.sort[0];
					playerHero.sort[0] = playerHero.sort[1];
					playerHero.sort[1] = tmp;
				}
			}
			else if(hasProperty(sorts[0], "attachedSpellEntity") && hasProperty(sorts[1], "attachedSpellEntity"))
			{
				if(sorts[0].attachedSpellEntity.magicSchoolLevel < sorts[1].attachedSpellEntity.magicSchoolLevel )
				{
					var tmp = {content : playerHero.sort[0]};
					playerHero.sort[0] = {content : playerHero.sort[1]};
					playerHero.sort[1] = tmp;
				}
			}
		}
		
		if ( frame )
			var troupes = (frame.attackerUnitStackList || frame.heroUnitStackList || hero.unitStackList).elementList;
		else
			var troupes = heros.attachedUnitStackList0 || heros.attachedUnitStackList || [];
				
		for (var t = 0; t < troupes.length; t++)
		{
			var troupe = troupes[t].content || troupes[t];
			var troupePosition = troupe.stackPosition || troupe.powerPosition || t+1;
			playerHero.troupes[troupePosition] = self.prepare_troupe(troupe);
		}
		
		var troupes = [];
		if ( MMHKPLUS.getElement("Player").isPVEWorld() && frame.mainElementId.substring(0,8) == "HaltFrame".substring(0,8) ) 
		{
			var heroMoveId = frame.haltList.options[frame.haltList.options.selectedIndex].value;
			var worldMoveId = 0;
			
			for ( var i in frame.content.heroMoves ) 
			{
				if(i != undefined)
					if ( frame.content.heroMoves[i].id == heroMoveId ) 
					{
						worldMoveId = frame.content.heroMoves[i].masterHeroMoveId;
						break;
					}
			}
		
			var regionListAnswer = 0;
			var masterMoveId = 0;
			if ( worldMoveId ) 
			{
				if ( MMHKPLUS.HOMMK.elementPool.obj.HeroMove.obj[heroMoveId] )
					masterMoveId = MMHKPLUS.HOMMK.elementPool.obj.HeroMove.obj[heroMoveId].content.masterHeroMove;
				else 
				{
					var moveListsAnswer ;
					MMHKPLUS.getElement("Ajax").getHeroMove(
						MMHKPLUS.getElement("Player").get("worldId"), 
						frame.content.heroMoves[i].haltX, 
						frame.content.heroMoves[i].haltY,
						2, 2, 
						function(json)
						{
							moveListsAnswer = json;
						},
						true
					);
					MMHKPLUS.getElement("Ajax").getRegion(
						MMHKPLUS.getElement("Player").get("worldId"), 
						Math.floor( frame.content.heroMoves[i].haltX ) - 5,
						Math.floor( frame.content.heroMoves[i].haltY ) - 5,
						10, 10, 
						function(json)
						{
							$.extend(moveListsAnswer, moveListsAnswer, json);
						},
						true
					);

					regionListAnswer = moveListsAnswer.d['WorldMap' + MMHKPLUS.getElement("Player").get("worldId") + 'RegionList'];
					var moveList = moveListsAnswer.d['WorldMap' + MMHKPLUS.getElement("Player").get("worldId") + 'HeroMoveList'];
					for ( var curMove = 0; curMove < moveList.length; curMove++ ) 
					{
						if ( moveList[curMove].masterHeroMoveId == worldMoveId ) 
						{
							masterMoveId = moveList[curMove].masterHeroMove;
							break;
						}
					}
				}
			}
			var creviceRegionId = 0;
			if ( masterMoveId ) 
			{
				var regionsList = MMHKPLUS.HOMMK.elementPool.obj.Region.obj;
				for ( var i in regionsList ) 
				{
					if(i != undefined)
						if ( (regionsList[i].content.x == masterMoveId.x1 && regionsList[i].content.y == masterMoveId.y1 ) || (regionsList[i].content.x == masterMoveId.x2 && regionsList[i].content.y == masterMoveId.y2 ) ) 
						{
							if ( regionsList[i].content && regionsList[i].content.rB && regionsList[i].content.rB.rBE && regionsList[i].content.rB.rBE.tN ) 
							{
								if ( regionsList[i].content.rB.rBE.tN.substring(0,12) == "RIFT_PILLAGE".substring(0,12) ) 
								{
									creviceRegionId = regionsList[i].content;
									break;
								}
							}
						}
				}
				if ( !creviceRegionId ) 
				{
					for ( var i in regionListAnswer ) 
					{
						if(i != undefined)
							if ( (regionListAnswer[i].x == masterMoveId.x1 && regionListAnswer[i].y == masterMoveId.y1 ) || (regionListAnswer[i].x == masterMoveId.x2 && regionListAnswer[i].y == masterMoveId.y2 ) ) 
							{
								if ( regionListAnswer[i].rB && regionListAnswer[i].rB.rBE && regionListAnswer[i].rB.rBE.tN ) 
								{
									if ( regionListAnswer[i].rB.rBE.tN.substring(0,12) == "RIFT_PILLAGE".substring(0,12) ) 
									{
										creviceRegionId = regionListAnswer[i];
										break;
									}
								}
							}
					}
				}
			}
			
			if ( creviceRegionId ) 
			{
				MMHKPLUS.getElement("Ajax").getRiftRegionBuildingFrame(creviceRegionId.id, function(json) { creviceInfo = json ; }, true);
				if ( creviceInfo && creviceInfo.d && creviceInfo.d['RiftRegionBuildingFrame'+creviceRegionId.id] && creviceInfo.d['RiftRegionBuildingFrame'+creviceRegionId.id].regionBuildingHeroList ) 
				{
					var creviceHeroList = creviceInfo.d['RiftRegionBuildingFrame'+creviceRegionId.id].regionBuildingHeroList;
					for ( var curHero in creviceHeroList ) 
					{
						if(curHero != undefined)
							if ( creviceHeroList[curHero].id == masterMoveId.heroId ) 
							{
								for ( var t = 0; t < creviceHeroList[curHero].attachedUnitStackList.length; t++ ) 
								{
									var troupe = creviceHeroList[curHero].attachedUnitStackList[t];
									var position = t + 1;
									versusHero.troupes[position] = self.prepare_troupe(troupe);
								}
								versusHero.faction = self._factions["DUNGEON"];
								versusHero.statut = 1;
								versusHero.heros = 1;
								versusHero.niveau = 30;
								versusHero.archetype = self._archetypes["MERCENARY"];
								versusHero.malus_attaque = 0;
								
								if ( heroAttaqant )
									donnees.d.lieu = 3;
								break;
							}
					}
				}
			}
		} 
		else if ( frame ) 
		{
			var troupes = (tmp=(frame.defenderUnitStackList || frame.npcUnitStackList))?tmp.elementList:[];
			if ( frame.content && frame.content.zoneBuilding && frame.content.zoneBuilding.attachedUnitStackList )
				troupes = frame.content.zoneBuilding.attachedUnitStackList;
		}
		else 
		{
			var defenderHero = (spy_defenser.hero || spy_defenser);
			var troupes = defenderHero.attachedUnitStackList0 || defenderHero.attachedUnitStackList || [];
		}

		var reconnaissances;
		if ( frame )
			reconnaissances = frame.content.scoutingResultList;
		else 
		{		
			donnees.d.statut = 1;
			if (spy_city_defense)
				donnees.d.fortification = self._fortifications[spy_city_defense];
            var talents = defenderHero.heroSkillList || defenderHero.skills || [];
            if (talents !== undefined) 
            {
                for (var t = 0; t < talents.length; t++)
                {
                    var talent = talents[t];
                    self.prepare_talent(donnees.d, talent);
                }
            }
			self.prepare_heros(donnees.d, defenderHero);
			self.prepare_artefacts(donnees.d, defenderHero.artefactList);
		}
		if ( reconnaissances && reconnaissances.length >= 1 )
		{
			var reco = reconnaissances[0].contentJSON;
			donnees.d.statut = 1;
			if ( reco.cityFortificationTagName )
				donnees.d.fortification = self._fortifications[reco.cityFortificationTagName];
			if ( reco.heroList && reco.heroList.length >= 1 ) 
			{
				var heros = reco.heroList[0];
				for (var h = 0; h < reco.heroList.length; h++)
				{
					if (reco.heroList[h].defense > heros.defense)
						heros = reco.heroList[h];
				}
				self.prepare_heros(donnees.d, heros);
				self.prepare_artefacts(donnees.d, heros.artefactList);
			}
		}
		
		if ( frame && frame.content && frame.content.unitStackList && frame.content.unitStackList[0] ) 
		{
			if ( frame.content.unitStackList[0].heroId ) 
			{
				versusHero.statut = 1;
				versusHero.heros = 1;
				if ( frame.content.unitStackList[0].factionEntityTagName)
					versusHero.faction = self._factions[frame.content.unitStackList[0].factionEntityTagName];
			}
		}
		for ( var t = 0; t < troupes.length; t++ )
		{
			var troupe = troupes[t].content || troupes[t];
			var position = troupe.powerPosition || troupe.stackPosition || t+1;
			versusHero.troupes[position] = self.prepare_troupe(troupe);
		}
		
		if ( frame && frame.unitStackLevelSelectElement && frame.content && frame.content.unitStackByLevel ) 
		{
			
			var selectedLevel = frame.unitStackLevelSelectElement.value;
			if ( selectedLevel >= 0 ) 
			{
				var levelParams = frame.content.unitStackByLevel[selectedLevel];
				var defenceName = String( levelParams.defenseName );
				
				versusHero.antimagie = levelParams.spellEfficiencyDecrease / 10;
				versusHero.pieges = levelParams.traps/3;
				if ( versusHero.antimagie == 0 && versusHero.pieges == 0 )
					versusHero.baliste = defenceName.match( /\d+/g );
			}
		}

		self.internalLastPermalien = self.url_combat + '?info=' + self.encode_donnees_combat(donnees);
		if(jactariButton)
			jactariButton.href = self.internalLastPermalien;
		return true;
	},
	
	lastPermalien : function()
	{
		return this.internalLastPermalien;
	},
	
	unload : function()
	{
		//this.set_artefacts_fixer = null;
		this.base_url = null;
		this.url_combat = null;

		this._base64 = null;
		this._camps = null;
		this._camps_abr = null;
		this._factions = null;
		this._ecoles = null;
		this._rangs = null;
		this._neutres = null;
		this._archetypes = null;
		this._slots = null;
		this._sorts = null;
		this._competences_hereditaires = null;
		this._fortifications = null;
		this.internalLastPermalien = null;
	}
});
