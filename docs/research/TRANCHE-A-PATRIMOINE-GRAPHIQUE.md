# Tranche A : patrimoine graphique et sécurité

Inventaire reproductible : node tools/audit-graphic-assets.mjs. Tests : node --test tools/tests/asset-audit.test.mjs.

Le répertoire CDN contient 3 891 fichiers sur la branche main du 28 octobre 2026, dont 1 090 empreintes Git distinctes (environ 1 033 chemins logiques). L'ancien catalogue documentaire ne couvre pas cette récupération massive. Sur 175 fichiers de fond et calques de villes attendus, seul HAVEN/TAVERN.gif est actuellement confirmé. Les scènes AcidCave ont tous leurs bâtiments dessinés : ce ne sont pas des fonds vierges.

Les trois JSON produits dans data/asset-catalog/generated (inventaire détaillé, doublons SHA-256, manquants prioritaires) restent locaux et ignorés par Git. Les données de transparence ne sont qu'indicatives. La détection de similarité perceptuelle n'est pas effectuée. Les provenances déduites des chemins ne constituent pas une licence.

ALERTE : data/assets-recovered/cdn-bulk est déjà suivi par Git dans ce dépôt PUBLIC. La règle d'exclusion ajoutée ne retire pas les fichiers existants de l'index ni des commits antérieurs. Une purge d'historique exige une opération séparée et une autorisation explicite. Aucun nouveau fichier historique ne doit être ajouté au répertoire public apps/web/public.

## Similarité visuelle optionnelle

Après génération du catalogue local, installer Pillow, puis lancer : python3 tools/perceptual-duplicates.py. Le résultat local data/asset-catalog/generated/perceptual-candidates.json contient des paires candidates de dHash64 avec seuil de Hamming et tolérance dimensionnelle. Ce ne sont pas des doublons confirmés : validation humaine indispensable. Un test synthétique vérifie des PNG visuellement identiques mais différents octet par octet.
