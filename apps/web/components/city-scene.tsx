import Link from "next/link";
import type { ConstructionCatalog, CityDetail } from "../lib/server-api";

// These few anchor points come from the archived HAVEN CITYVIEW_CONF
// data/analysis/original-city-layouts-4.1.3.json (2013 client 4.1.3-MTR).
// The full scene and styling are OUR ORIGINAL PLACEHOLDER; no Ubisoft graphics.
const anchorPositions = [
  { code: "village_hall", label: "Hôtel du village", x: 304, y: 138 },
  { code: "town_hall", label: "Hôtel de ville", x: 304, y: 111 },
  { code: "tavern", label: "Taverne", x: 339, y: 355 },
  { code: "marketplace", label: "Marché", x: 203, y: 345 },
  { code: "resource_silo", label: "Silo", x: 153, y: 364 },
  { code: "fort", label: "Fort", x: 273, y: 417 },
  { code: "recruit_t1", label: "Caserne T1", x: 523, y: 430 },
  { code: "recruit_t2", label: "Caserne T2", x: 282, y: 239 },
] as const;

export function CityScene({
  city, catalog,
}: {
  city: CityDetail;
  catalog?: ConstructionCatalog;
}) {
  const buildings = catalog?.buildings ?? [];
  const staged = anchorPositions.flatMap((spot) => {
    const matching = buildings.find((b) => b.building_code === spot.code);
    return matching ? [{ ...spot, ...matching }] : [];
  });
  const unmatched = buildings.filter(
    (building) => !anchorPositions.some((spot) => spot.code === building.building_code),
  );
  return (
    <section className="city-scene-section" aria-labelledby="city-scene-heading">
      <div className="city-scene-header">
        <div>
          <span className="eyebrow">VILLE · HAVRE · VUE SCHÉMATIQUE</span>
          <h2 id="city-scene-heading">{city.name}</h2>
          <p>Région {city.x} · {city.y} — implantation isométrique expérimentale</p>
        </div>
        <Link href="#urban-construction" className="scene-action">
          Chantiers et bâtiments
        </Link>
      </div>
      <div className="city-scene-frame">
        <div className="city-scene-art"
          aria-label={`Vue illustrative de ${city.name}, avec ${staged.length} bâtiments placés selon les ancres identifiées`}>
          <div className="city-scene-sky" aria-hidden="true"/>
          <div className="city-scene-distant" aria-hidden="true"/>
          <div className="city-scene-ground" aria-hidden="true"/>
          <div className="city-scene-road" aria-hidden="true"/>
          <div className="city-scene-wall" aria-hidden="true"/>
          <div className="city-scene-tower left" aria-hidden="true"/>
          <div className="city-scene-tower right" aria-hidden="true"/>
          {staged.map((spot) => (
            <a
              className={`city-scene-marker ${spot.active ? "active" : "inactive"}`}
              href="#urban-construction"
              key={spot.code}
              style={{ left: `${(spot.x / 680) * 100}%`, top: `${(spot.y / 552) * 100}%` }}
              aria-label={`${spot.label}, niveau ${spot.level}, ${spot.active ? "actif" : "inactif"}`}
              title={`${spot.label} · niveau ${spot.level}`}
            >
              <span className="city-marker-spire" aria-hidden="true"/>
              <span className="city-marker-name">{spot.label} · niv. {spot.level}</span>
            </a>
          ))}
          {catalog?.active && (
            <a className="city-scene-job" href="#urban-construction">
              <span aria-hidden="true">⚒</span> Chantier en cours
            </a>
          )}
          <span className="city-scene-corner">SCÈNE 680 × 552 · GABARIT HISTORIQUE</span>
        </div>
      </div>
      <p className="city-scene-disclaimer">
        Décor original de substitution. Seuls certains points d'ancrage proviennent
        des configurations archivées du client MMHK. Aucun sprite Ubisoft
        n'est intégré à cette page sans validation préalable des droits.
      </p>
      {unmatched.length > 0 && (
        <p className="city-scene-unmapped">
          Bâtiments enregistrés sans correspondance graphique vérifiée :
          {" "}{unmatched.map((b) => `${b.building_code} (niveau ${b.level})`).join(", ")}.
          Ils restent accessibles dans le panneau des constructions.
        </p>
      )}
    </section>
  );
}
