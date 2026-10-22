# Catalogues de référence extraits

Généré par `tools/extract-reference.mjs`. Source [CODE-01](../research/SOURCES.md#code-01), commit `e8d862d82741986759b88012421aed8e8175e26e`. Ces tables sont une photographie communautaire de 2013; elles ne prouvent pas la disponibilité de chaque entrée dans toutes les saisons. Descriptions mécaniques et données dérivées sous GPL-3.0-or-later. Voir [le dictionnaire](../../data/README.md).

## Sorts

Le coefficient n’est pas une quantité de dégâts universelle. Il dépend du type, de la cible, de l’unité et des multiplicateurs d’arme. Le JSON conserve ces champs.

| i | Nom | École | Cercle | Type | Coefficient | Effet déclaré |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Poing de la colère | invocation | 1 | Dégâts | 0.7 | Inflige X point de dégâts par point de magie à chaque unité du peloton ennemi au cours du tour choisi. |
| 1 | Essaim | invocation | 1 | Invocation | 110 | Invoque un peloton de cavalerie d'une puissance équivalente à X par point de magie. |
| 2 | Piège de feu | invocation | 2 | Dégâts | 0.3 | Réduit de X % par point de magie la puissance du peloton ennemi au cours du tour choisi. Ce sort est 50 % moins efficace lorsqu'il est lancé sur des tireurs. |
| 3 | Animation de cadavre | invocation | 2 | Résurrection | 0.45 | Ressuscite un montant égal à X % par point de magie du nombre de créatures dispersées au cours d'un tour. Le sort ne fonctionne que si au moins une créature du peloton est vivante à la fin du tour. Les créatures invoquées disparaissent à la fin du combat. |
| 4 | Séisme | invocation | 3 | Altération | 0.5 | Réduit de X % par point de magie l'efficacité des défenses d'une cité ou d'une région pendant tout le restant d'une bataille. |
| 5 | Forces fantomatiques | invocation | 3 | Invocation | 130 | Invoque un peloton de tireurs d'une puissance équivalente à X par point de magie. |
| 6 | Invocation d'élémentaires | invocation | 4 | Invocation | 200 | Invoque un peloton d'infanterie d'une puissance équivalente à X par point de magie. |
| 7 | Mur de flammes | invocation | 4 | Dégâts | 1.35 | Inflige X point de dégâts par point de magie à chaque unité du peloton ennemi au cours du tour choisi. |
| 8 | Invocation de phénix | invocation | 5 | Invocation | 0.22 | Invoque un peloton de cavalerie d'une puissance équivalente à X % de la puissance de l'armée ennemie, par point de magie. |
| 9 | Hex de faiblesse | ténèbres | 1 | Altération | 0.35 | Réduit de X par point de magie l'attaque du héros ennemi. |
| 10 | Infection | ténèbres | 1 | Dégâts | 0.5 | Inflige X point de dégâts par point de magie à toutes les unités de tous les pelotons ennemis. |
| 11 | Hex de contracture | ténèbres | 2 | Altération | 0.25 | Réduit de X par point de magie la défense du héros ennemi. |
| 12 | Maladie | ténèbres | 2 | Dégâts | 0.7 | Inflige X point de dégâts par point de magie à toutes les unités de tous les pelotons ennemis. |
| 13 | Hex de vulnérabilité | ténèbres | 3 | Altération | 0.35 | Réduit de X par point de magie la défense du héros ennemi. |
| 14 | Hex d'épuisement | ténèbres | 3 | Altération | 0.5 | Réduit de X par point de magie l'attaque du héros ennemi. |
| 15 | Peste | ténèbres | 4 | Dégâts | 0.9 | Inflige X point de dégâts par point de magie à toutes les unités de tous les pelotons ennemis. |
| 16 | Hex de défaillance | ténèbres | 4 | Altération | 0.6 | Réduit de X par point de magie l'attaque du héros ennemi. |
| 17 | Fléau | ténèbres | 5 | Dégâts | 0.2 | Anéantit X % par point de magie des unités de tous les pelotons ennemis. |
| 18 | Grâce de force | lumière | 1 | Amélioration | 0.3 | Augmente de X par point de magie l'attaque de toutes les unités d'un peloton au cours du tour choisi. |
| 19 | Grâce d'endurance | lumière | 1 | Amélioration | 0.35 | Augmente de X % par point de magie la défense d'un peloton au cours du tour choisi. |
| 20 | Grâce d'immunité | lumière | 2 | Amélioration | 0.6 | Augmente de X par point de magie la défense de toutes les unités d'un peloton au cours du tour choisi. Ce sort est 50 % plus efficace sur les pelotons de cavalerie. |
| 21 | Grâce de rapidité | lumière | 2 | Amélioration | 0.21 | Augmente de X % par point de magie l'attaque d'un peloton au cours du tour choisi. |
| 22 | Grâce de puissance | lumière | 3 | Amélioration | 0.6 | Augmente de X par point de magie l'attaque de toutes les unités d'un peloton au cours du tour choisi. |
| 23 | Grâce de déflexion | lumière | 3 | Amélioration | 0.45 | Augmente de X % par point de magie la défense d'un peloton au cours du tour choisi. Ce sort est 50 % plus efficace face à un peloton de tireurs ennemis. |
| 24 | Téléportation | lumière | 4 | Amélioration | 0.28 | Augmente de X % par point de magie l'attaque d'un peloton au cours du tour choisi. Ce sort est 50 % moins efficace sur les pelotons de tireurs. |
| 25 | Mot de lumière | lumière | 4 | Dégâts | 160 | Inflige X points de dégâts par point de magie au peloton ennemi au cours du tour choisi. |
| 26 | Résurrection | lumière | 5 | Résurrection | 0.4 | Ressuscite un montant égal à X % des créatures encore en vie à la fin du tour. Le sort n'est lancé que si au moins une créature du peloton est vivante à la fin du tour. |
| 27 | Stalagmites | destruction | 1 | Dégâts | 0.7 | Inflige X point de dégâts par point de magie à chaque unité du peloton ennemi au cours du tour choisi. |
| 28 | Flèches des arcanes | destruction | 1 | Dégâts | 130 | Inflige X points de dégâts par point de magie au peloton ennemi au cours du tour choisi. |
| 29 | Trait de glace | destruction | 2 | Dégâts | 0.25 | Réduit de X % par point de magie la puissance du peloton ennemi au cours du tour choisi. |
| 30 | Foudre | destruction | 2 | Dégâts | 0.9 | Inflige X point de dégâts par point de magie à chaque unité du peloton ennemi au cours du tour choisi. |
| 31 | Cercle d'hiver | destruction | 3 | Dégâts | 1.2 | Inflige X point de dégâts par point de magie à chaque unité du peloton ennemi au cours du tour choisi. |
| 32 | Boule de feu | destruction | 3 | Dégâts | 0.325 | Réduit de X % par point de magie la puissance du peloton ennemi au cours du tour choisi. |
| 33 | Pluie de météores | destruction | 4 | Dégâts | 1.7 | Inflige X point de dégâts par point de magie à chaque unité du peloton ennemi au cours du tour choisi. |
| 34 | Chaine de foudre | destruction | 4 | Dégâts | 180 | Inflige X points de dégâts par point de magie au peloton ennemi au cours du tour choisi. |
| 35 | Choc terrestre | destruction | 5 | Dégâts | 0.4 | Réduit de X % par point de magie la puissance du peloton ennemi au cours du tour choisi. |

## Talents

Les groupes 0–12 ont une carrière nommée. Les groupes 13–20 correspondent aux extensions légendaires du calculateur; le nom de carrière manque dans `_carrieres`. Les valeurs incluent généralement le rang 0.

| Carrière/groupe | Talent | Valeurs | Effet déclaré |
| --- | --- | --- | --- |
| Architecte | Contremaitre | [0,9,18,27] | Augmente de X % la vitesse de construction et d'amélioration des bâtiments et des mines. |
| Architecte | Expert en balistique | [0,9,18,27] | Augmente de X % la puissance de bombardement des catapultes. |
| Architecte | Bâtisseur de fortifications | [0,3,6,9] | Augmente de X % le bonus des fortifications. |
| Architecte | Sapeur | [0,3,6,9] | Réduit de X % le bonus de fortifications de l'ennemi. |
| Barbare | Chasseur d'éclaireurs | [0,3,6,9] | Gagne X niveaux en détectant des éclaireurs ennemis. |
| Barbare | Massacreur | [0,3,6,9] | Augmente de X % les pertes de l'ennemi au combat. |
| Barbare | Pilleur | [0,21,42,63] | Augmente de X % la quantité de ressources pillées. |
| Bâtisseur | Intendant | [0,3,6,9] | Augmente de X % la production de ressources communes. |
| Bâtisseur | Alchimiste | [0,3,6,9] | Augmente de X % la production de ressources rares. |
| Bâtisseur | Chercheur d'or | [0,3,6,9] | Augmente de X % la production d'or. |
| Bâtisseur | Bon payeur | [0,5,10,15] | Augmente de X la défense de toutes les unités. |
| Chevalier | Tacticien défenseur | [0,1,2,3] | Augmente de X % la défense de toutes les unités. |
| Chevalier | Écuyer défenseur | [0,5,10,15] | Augmente de X % la défense de toutes les unités de cavalerie en cas de bonus de troupe. |
| Chevalier | Expert en tirs de barrage | [0,5,10,15] | Augmente de X % la défense de toutes les unités de tireurs en cas de bonus de troupe. |
| Chevalier | Inébranlable | [0,5,10,15] | Augmente de X % la défense de toutes les unités d'infanterie en cas de bonus de troupe. |
| Chevalier | Logisticien | [0,2,4,6] | Réduit de X % les pertes d'unités au combat. |
| Clerc | Instinct lumineux | [0,2,4,6] | Fait gagner X points de magie lors du lancement de sorts de l'École de la lumière. |
| Clerc | Maitre des arcanes | [0,1,3,5] | Permet de lancer un sort supplémentaire, limité au cercle X. |
| Clerc | Scribe | [0,1,2,3] | Augmente de X le nombre de sorts dans le livre de sorts. |
| Clerc | Expert de la lumière | [0,6,12,18] | Augmente de X % l'efficacité des sorts de l'École de la lumière. |
| Combattant | Tacticien | [0,1,2,3] | Augmente de X % l'attaque de toutes les unités. |
| Combattant | Écuyer | [0,5,10,15] | Augmente de X % l'attaque de toutes les unités de cavalerie en cas de bonus de troupe. |
| Combattant | Tireur d'élite | [0,5,10,15] | Augmente de X % l'attaque de toutes les unités de tireurs en cas de bonus de troupe. |
| Combattant | Commandant d'infanterie | [0,5,10,15] | Augmente de X % l'attaque de toutes les unités d'infanterie en cas de bonus de troupe. |
| Invocateur | Instinct d'invocateur | [0,2,4,6] | Fait gagner X points de magie lors du lancement de sorts de l'École de l'invocation. |
| Invocateur | Maitre des arcanes | [0,1,3,5] | Permet de lancer un sort supplémentaire, limité au cercle X. |
| Invocateur | Scribe | [0,1,2,3] | Augmente de X le nombre de sorts dans le livre de sorts. |
| Invocateur | Expert de l'invocation | [0,6,12,18] | Augmente de X % l'efficacité des sorts de l'École de l'invocation. |
| Magicien de la destruction | Instinct destruction | [0,2,4,6] | Fait gagner X points de magie lors du lancement de sorts de l'École de la destruction. |
| Magicien de la destruction | Maitre des arcanes | [0,1,3,5] | Permet de lancer un sort supplémentaire, limité au cercle X. |
| Magicien de la destruction | Scribe | [0,1,2,3] | Augmente de X le nombre de sorts dans le livre de sorts. |
| Magicien de la destruction | Expert de destruction | [0,6,12,18] | Augmente de X % l'efficacité des sorts de l'École de la destruction. |
| Magicien des ténèbres | Instinct ténébreux | [0,2,4,6] | Fait gagner X points de magie lors du lancement de sorts de l'École des ténèbres. |
| Magicien des ténèbres | Maitre des arcanes | [0,1,3,5] | Permet de lancer un sort supplémentaire, limité au cercle X. |
| Magicien des ténèbres | Scribe | [0,1,2,3] | Augmente de X le nombre de sorts dans le livre de sorts. |
| Magicien des ténèbres | Expert des ténèbres | [0,6,12,18] | Augmente de X % l'efficacité des sorts de l'École des ténèbres. |
| Marchand | Commerçant | [0,9,18,27] | Augmente de X % le prix de vente au marchand des ressources. |
| Marchand | Caravanier | [0,50,100,150] | Augmente de X % la contenance des caravanes. |
| Marchand | Éleveur de mules | [0,50,100,150] | Augmente de X % la vitesse des caravanes. |
| Meneur | Chef charismatique | [0,1,2,3] | Augmente de +X la production quotidienne de toutes les unités, à l'exception de celles de rang 7. |
| Meneur | Maitre entraineur | [0,9,18,27] | Augmente de X % la vitesse de recrutement de toutes les unités, à l'exception de celles de rang 7. |
| Meneur | Diplomate | [0,9,18,27] | Augmente de X % les chances de recruter des unités neutres. |
| Meneur | Harangueur | [0,5,10,15] | Augmente de X l'attaque de toutes les unités. |
| Rôdeur | Maitre espion | [0,5,10,15] | L'éclaireur gagne X niveaux en effectuant des reconnaissances. |
| Rôdeur | Coureur | [0,9,18,27] | Permet d'atteindre plus rapidement une destination. Augmente de X % la vitesse des éclaireurs. |
| Rôdeur | Expert des renseignements | [0,21,42,63] | Augmente de X % la vitesse des reconnaissances. |
| Tenancier | Pilier de comptoir | [0,9,18,27] | Réduit de X % les coûts dans les tavernes. |
| Tenancier | Enrôleur | [0,1,2,3] | Augmente de X le nombre de points de compétence possédé par les héros lors de leur recrutement. |
| Tenancier | Enrôleur charismatique | [0,45,90,135] | Augmente de X % les troupes accompagnant les héros lors de leur recrutement. |
| Tenancier | Offreur de tournées | [0,3,6,9] | Réduit de X % les coûts de maintenance. |
| groupe 13 (extension) | Maître Harangueur | [0,10,20,30] | Augmente l'attaque de toutes les unités de 10/20/30 |
| groupe 13 (extension) | Maître Combattant | [0,4,8,12] | Augmente l'attaque du héros de 4%/8%/12% |
| groupe 13 (extension) | Sans-pitié | [0,4,8,12] | Augmente les pertes ennemies de 4%/8%/12% après une bataille lorsque le héros est en attaque |
| groupe 14 (extension) | Maître Combattant | [0,4,8,12] | Augmente l'attaque du héros de 4%/8%/12% |
| groupe 14 (extension) | Maître Défendeur | [0,4,8,12] | Augmente la défense du héros de 4%/8%/12% |
| groupe 14 (extension) | Briseur de Murs | [0,5,10,15] | Réduit le bonus de fortifications de la cité ennemie 5%/10%/15% |
| groupe 15 (extension) | Cri Démoralisant | [0,5,10,15] | Diminue l'attaque du héros ennemi 5%/10%/15% |
| groupe 15 (extension) | Résistance | [0,5,10,15] | Diminue la magie du héros ennemi de 5%/10%/15% |
| groupe 15 (extension) | Immunité aux sorts | [0,10,20,30] | Réduit l'efficacité des sorts ennemis visant le héros, son armée ou ses fortifications de 10%/20%/30% |
| groupe 16 (extension) | Gardien | [0,3,6,9] | Réduit de 3%/6%/9% les pertes d'unités après une bataille lorsque le héros est en défense |
| groupe 16 (extension) | Maître Défendeur | [0,4,8,12] | Augmente la défense du héro de 4%/8%/12% |
| groupe 16 (extension) | Inspiration Divine | [0,10,20,30] | Augmente de 10%/20%/30% l'efficacité des sorts de l'École de la Lumière |
| groupe 17 (extension) | Gardien | [0,3,6,9] | Réduit de 3%/6%/9% les pertes d'unités après une bataille lorsque le héros est en défense |
| groupe 17 (extension) | Génie Militaire | [0,4,8,12] | Augmente de 4%/8%/12% le bonus des fortifications de la cité |
| groupe 17 (extension) | Nuit Éternelle | [0,10,20,30] | Augmente de 10%/20%/30% l'efficacité des sorts de l'École des Ténèbres |
| groupe 18 (extension) | Nuit Éternelle | [0,10,20,30] | Augmente de 10%/20%/30% l'efficacité des sorts de l'École des Ténèbres |
| groupe 18 (extension) | Invocateur Suprême | [0,10,20,30] | Augmente de 10%/20%/30% l'efficacité des sorts de l'École de l'Invocation |
| groupe 18 (extension) | Sans-pitié | [0,4,8,12] | Augmente de 4%/8%/12% les pertes ennemies après une bataille lorsque le héros est en attaque |
| groupe 19 (extension) | Invocateur Suprême Supérieur | [0,10,20,30] | Augmente de 10%/20%/30% l'efficacité des sorts de l'École de l'Invocation |
| groupe 19 (extension) | Inspiration Divine | [0,10,20,30] | Augmente de 10%/20%/30% l'efficacité des sorts de l'École de la Lumière |
| groupe 19 (extension) | Gardien | [0,3,6,9] | Réduit de 3%/6%/9% les pertes d'unités après une bataille lorsque le héros est en défense |
| groupe 20 (extension) | Sans-pitié | [0,4,8,12] | Augmente de 4%/8%/12% les pertes ennemies après une bataille lorsque le héros est en attaque |
| groupe 20 (extension) | Grand Destructeur | [0,10,20,30] | Augmente de 10%/20%/30% l'efficacité des sorts de l'École de la Destruction |
| groupe 20 (extension) | Maître Combattant | [0,4,8,12] | Augmente de 4%/8%/12% l'attaque du héros |
