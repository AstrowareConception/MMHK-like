# Génération régionale : proposition de conception suite aux réponses P0

**Rectificatif C02 (23/10/2026) :** le placement des sites spéciaux ne doit plus être interprété comme une distance minimale aléatoire entre types : **tous les types de reliques suivent une même trame quasi régulière**, avec décalage maximal de deux cases. La conception active figure dans [le laboratoire](10-LABS-HEREDITE-MONDE.md).

**Statut : proposition de game design déléguée Q12/Q15, à valider par simulation ; elle ne reproduit pas un algorithme Ubisoft identifié.**

Références : [réponses Q07–Q22](../decisions/DECISIONS-P0-2026-10-23.md), [RM-REG-001…011](../../data/rules/early-game.rules.json) et [profil S2 de projet](../../data/rules/mmhk-like-s2-policy-draft.json).

## 1. Région de départ — règle décidée

La première cité d'un joueur dispose de quatre mines, de quatre types distincts : **or, bois, minerai et ressource rare principale de faction**. Pour le premier prototype **Havre**, cette rare est le **cristal**. Les mines occupent quatre cases distinctes, à l'exclusion du centre de la région 5×5.

La dotation en mines est indépendante des stocks de ressources et des troupes initiales ; les valeurs de ces derniers seront rattachées à un profil S2 dès que possible. La force des PNJ défendant chaque case est proportionnée à la distance au centre, conformément à Q16.

## 2. Régions ordinaires ultérieures — proposition à tester

Nous devons générer des ensembles de quatre mines avec une **contrainte combinatoire absolue** :
- quatre ressources toutes distinctes ; ou
- trois ressources distinctes dont **une seule apparaît deux fois**.

Les compositions **A,A,B,B**, **A,A,A,B** et **A,A,A,A** sont systématiquement interdites. **Aucun type ne doit obligatoirement apparaître** : il peut ne pas y avoir d'or, de bois ou de minerai. Les quatre ressources rares ont des poids strictement identiques.

Je propose l'algorithme suivant, **uniquement pour un profil expérimental** :

1. Tirer une forme de composition : **82 % de quatre types distincts**, **18 % de trois types dont une paire**. Ce taux de doublons est une hypothèse de simulation, *pas* une mesure du jeu d'origine.
2. Tirer les types distincts **sans remplacement** parmi les sept ressources, en pondérant or=1,6 ; bois=1,5 ; minerai=1,5 ; et **chacune** des quatre ressources rares=1,0. Ces poids sont modifiables par profil ; ils favorisent les matières courantes sans les imposer.
3. Si la forme choisie contient une paire, sélectionner la ressource répétée parmi les trois types retenus, au prorata de leur poids. Ne jamais autoriser une seconde paire.
4. Mélanger les quatre occurrences avant de leur attribuer des positions régionales pour ne pas toujours rapprocher la ressource la plus abondante de la cité.

Cette proposition conserve une équiprobabilité **symétrique entre les quatre rares** (mêmes poids) ; elle ne prétend pas que chaque rare a autant de probabilité que l'or, le bois ou le minerai. Le contrôle d'équité doit mesurer les fréquences marginales et les corrélations sur des milliers de régions avant de retenir ces valeurs.

## 3. Emplacements des mines — proposition déléguée Q15

Pour favoriser une progression lisible sans créer des régions identiques :

- Cité centrale fixe : **[2,2]**.
- **Deux mines** sont tirées aléatoirement sans remplacement sur les huit positions de la première couronne (distance de Chebyshev 1).
- **Deux mines** sont tirées sur les seize positions de la deuxième couronne (distance de Chebyshev 2).
- Les quatre positions ne peuvent se superposer à la cité ni entre elles. La disposition des ressources sur ces emplacements est mélangée avec la graine de région.
- Les **quatre mines de départ** suivent la même distribution spatiale pour éviter un avantage géométrique inutile, tout en conservant leurs quatre ressources imposées.

Le choix **2 près / 2 loin** est une proposition : il facilite l'accès à deux premiers objectifs et réserve d'autres défis en périphérie. Il ne signifie pas qu'Ubisoft utilisait cette géométrie ; des études visuelles du jeu original pourront conduire à l'ajuster.

## 4. Simulation de la difficulté des PNJ

La difficulté doit croître depuis le centre, et non suivre arbitrairement la valeur marchande de la ressource. Proposition :

- Première couronne : plage de PNJ de difficulté basse (adaptée aux T1–T3).
- Deuxième couronne : plage plus élevée, variant autour d'un niveau-cible.
- Une mine particulièrement rare ou doublée ne reçoit **pas automatiquement** une garnison indépassable.
- Les nombres de créatures, multiplicateurs de puissance et chances de butin restent à obtenir du catalogue S2 ou d'un équilibrage validé.

La production d'une mine commence dès sa libération. Une case déjà exploitée ne reçoit jamais un groupe de PNJ revenu spontanément. Le retour des PNJ sur les cases abandonnées dépend d'un **délai X**, encore à choisir, et le risque d'exploitation répétitive XP/artéfacts doit être testé.

## 5. Distribution à l'échelle du monde

La carte est **torique**. Toute mesure de distance aux sites, villes et régions proches doit utiliser le déplacement court autour des bords de la carte.

Les nouveaux joueurs sans code ami seront répartis progressivement dans les zones moins occupées : proposition de découper la carte en secteurs de densité, puis d'utiliser des candidats admissibles choisis dans les secteurs les moins chargés, avec un léger hasard de position. Les codes amis utilisent une **fenêtre préférée de 4–10 cases**, puis un élargissement progressif comme décidé.

Les sites spéciaux conservent **des répartitions de types globalement équilibrées** et des distances minimales entre sites, mais le traitement de la valeur « quinze cases » reste à clarifier (tous les types ou seulement les sites identiques). **Aucune implantation définitive des sites spéciaux n'est donc actée dans ce document.**

## 6. Expériences nécessaires avant validation

- Produire au moins **10 000 régions synthétiques** pour chaque profil de pondération et publier leurs répartitions.
- Vérifier **100 % de respect** des contraintes « trois ou quatre types », « une seule paire au maximum » et « deux cases de même mine interdites ».
- Comparer les distributions de ressources entre les régions de départ et les régions colonisables ordinaires.
- Mesurer les temps nécessaires pour libérer les mines des deux couronnes avec une armée T1–T3 sous le même moteur de combat.
- Sur un monde torique d'essai, mesurer collisions de spawn, espace restant pour coloniser, distances d'implantation avec amis et présence des sites spéciaux.

**Statut :** algorithme et pondérations **proposés**, pas adoptés comme valeurs historiques ; aucune simulation numérique n'a encore été exécutée.
