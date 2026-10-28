import type { RegionView } from "../lib/server-api";
import { resolveAssetUrl } from "../lib/assets/runtime";

const MINE_LABELS: Record<string,string> = {
  gold: "Or", wood: "Bois", ore: "Minerai", crystal: "Cristal",
  gems: "Gemmes", sulfur: "Soufre", mercury: "Mercure",
};
export function RegionScene({ region }: { region: RegionView }) {
  const topological = region.surrounding_world_regions;
  const historicRegion=resolveAssetUrl("region.background");
  return (
    <section className="region-scene-container" aria-labelledby="region-view-title">
      <div className="map-section-heading">
        <div>
          <span className="eyebrow">RÉGION · VUE 5 × 5</span>
          <h2 id="region-view-title">Autour de {region.city_name}</h2>
        </div>
        <span className="map-section-legend">25 emplacements schématiques</span>
      </div>
      <svg className="region-scene" viewBox="0 0 680 500" role="group"
        aria-label="Projection provisoire de 25 emplacements régionaux dont la ville est au centre">
        <defs>
          <linearGradient id="region-ground" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#56765f"/>
            <stop offset="100%" stopColor="#304f49"/>
          </linearGradient>
        </defs>
        <rect width="680" height="500" rx="9" fill="#203a42"/>
        {historicRegion && <image href={historicRegion} x="0" y="0" width="680" height="500" preserveAspectRatio="xMidYMid slice" /> }
        <path d="M0 220 L200 90 L400 150 L680 65 L680 500 L0 500 Z"
          fill="#496b67" opacity=".62"/>
        {region.cells.map((cell) => {
          // Screen-space isometric projection only; these are NOT actual
          // historical object or resource positions.
          const cx = 340 + (cell.i - cell.j) * 57;
          const cy = 116 + (cell.i + cell.j) * 36;
          const polygon = `${cx},${cy-35} ${cx+57},${cy} ${cx},${cy+35} ${cx-57},${cy}`;
          const owned = cell.kind === "owned_city";
          return (
            <g key={`${cell.i}-${cell.j}`}>
              <polygon points={polygon}
                fill={owned ? "#a48b60" : "url(#region-ground)"}
                stroke={owned ? "#f4dba0" : "#8aa28b"} strokeWidth={owned ? 3 : 1}
                fillOpacity={owned ? 1 : historicRegion ? .32 : .9}/>
              {owned ? (
                <a href={`/cities/${region.city_id}`} aria-label={`Entrer dans la ville ${region.city_name}`}>
                  <title>{region.city_name} · entrer en ville</title>
                  <path d={`M${cx-22} ${cy+8} L${cx-22} ${cy-30} L${cx} ${cy-51} L${cx+22} ${cy-30} L${cx+22} ${cy+8}Z`}
                    fill="#dfc388" stroke="#253c42" strokeWidth="2"/>
                  <path d={`M${cx-12} ${cy-30} L${cx} ${cy-55} L${cx+12} ${cy-30}Z`}
                    fill="#725d4b" stroke="#253c42" strokeWidth="1.5"/>
                  <rect x={cx-6} y={cy-11} width="12" height="20" fill="#435358"/>
                  <text x={cx} y={cy+31} textAnchor="middle" fill="#fff3d1"
                    fontSize="12" stroke="#172e36" strokeWidth="3" paintOrder="stroke">
                    Ville
                  </text>
                </a>
              ) : (
                <text x={cx} y={cy+4} textAnchor="middle" fill="#b9c7ae" fontSize="12">?</text>
              )}
            </g>
          );
        })}
        <rect x="10" y="455" width="382" height="32" rx="4" fill="#10232ccc"/>
        <text x="22" y="475" fill="#e5d8b2" fontSize="11">
          Les cases ? n'ont pas encore de données de terrain vérifiées.
        </text>
      </svg>
      <div className="region-legend">
        <div>
          <strong>Mines rattachées à cette cité</strong>
          <p>{region.mine_types_unlocated.map((key) => MINE_LABELS[key] ?? key).join(" · ") || "Aucune mine enregistrée"}</p>
          <small>Types connus en base ; leur emplacement sur les 25 cases n'est pas connu.</small>
        </div>
        <div>
          <strong>Régions du monde voisines (topologie torique)</strong>
          <div className="region-neighbors">
            {topological.map((cell) => (
              <span key={`${cell.dx}:${cell.dy}`} className={cell.is_current ? "current" : ""}
                title={cell.is_current ? "Région actuelle" : "Coordonnées uniquement ; aucune reconnaissance disponible"}>
                {cell.x},{cell.y}
              </span>
            ))}
          </div>
          <small>Ces coordonnées sont des régions du monde, pas les 25 cases ci-dessus.</small>
        </div>
      </div>
    </section>
  );
}
