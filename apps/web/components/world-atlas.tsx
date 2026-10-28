import type { City, World } from "../lib/server-api";

export function WorldAtlas({
  world, cities,
}: {
  world: World;
  cities: City[];
}) {
  // Render only cities explicitly returned by the owner's private API.
  const dim = world.world_size;
  const mapX = (x: number) => 36 + ((x - 0.5) / dim) * 608;
  const mapY = (y: number) => 34 + ((y - 0.5) / dim) * 432;
  return (
    <section className="world-atlas-wrap" aria-labelledby="world-atlas-heading">
      <div className="map-section-heading">
        <div>
          <span className="eyebrow">ATLAS · CARTE DU MONDE</span>
          <h2 id="world-atlas-heading">Mes positions dans le monde</h2>
        </div>
        <span className="map-section-legend">Carte torique · {dim} × {dim}</span>
      </div>
      <svg className="world-atlas" viewBox="0 0 680 500"
        role="group"
        aria-label={`Atlas schématique de ${world.name}, avec ${cities.length} villes du joueur uniquement`}>
        <defs>
          <linearGradient id="world-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#294657"/>
            <stop offset="55%" stopColor="#1b3444"/>
            <stop offset="100%" stopColor="#102430"/>
          </linearGradient>
          <pattern id="world-grid" width="76" height="54" patternUnits="userSpaceOnUse">
            <path d="M 76 0 L 0 0 0 54" stroke="#b8b19c" strokeOpacity=".15" strokeWidth="1" fill="none"/>
          </pattern>
        </defs>
        <rect x="12" y="12" width="656" height="476" rx="8" fill="url(#world-gradient)"/>
        <rect x="36" y="34" width="608" height="432" fill="url(#world-grid)" stroke="#ad9363" strokeWidth="1.5"/>
        <path d="M36 240 H644 M340 34 V466" stroke="#d2b782" strokeOpacity=".22" strokeDasharray="5 9"/>
        <text x="44" y="29" fill="#c8b17d" fontSize="11">NORD</text>
        <text x="44" y="479" fill="#c8b17d" fontSize="10">Bords du monde connectés · représentation non géographique</text>
        {cities.map((city) => {
          const x = mapX(city.x);
          const y = mapY(city.y);
          return (
            <a href={`/cities/${city.city_id}/region`} key={city.city_id}
              aria-label={`Ouvrir la région de ${city.name}, coordonnées ${city.x}, ${city.y}`}>
              <title>{city.name} ({city.x}, {city.y})</title>
              <circle cx={x} cy={y} r="15" fill="#d2a75b" opacity=".24"/>
              <path d={`M ${x} ${y-13} L ${x+10} ${y} L ${x} ${y+13} L ${x-10} ${y} Z`}
                fill="#e6ca8e" stroke="#1b2831" strokeWidth="2"/>
              <circle cx={x} cy={y} r="3" fill="#263b44"/>
              <text x={x} y={y+28} fill="#f5e7c2" fontSize="12"
                textAnchor="middle" stroke="#20303a" strokeWidth="3" paintOrder="stroke">
                {city.name}
              </text>
            </a>
          );
        })}
      </svg>
      <p className="map-qualification">
        Repères de vos villes uniquement. Les positions ennemies, les frontières,
        le terrain et le brouillard de guerre ne sont pas encore restitués.
        La grille et les couleurs sont une représentation originale provisoire.
      </p>
    </section>
  );
}
