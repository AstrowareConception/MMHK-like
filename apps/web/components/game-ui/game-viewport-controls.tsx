"use client";

import {useEffect,useState} from "react";

const STORAGE="mmhk.player.view-density";
type Density="comfortable"|"compact";

/** Player-owned HUD view preferences. The game scene is the viewport;
 * navigation and treasury remain visible while the content scrolls inside it.
 */
export function GameViewportControls(){
  const [density,setDensity]=useState<Density>("comfortable");
  const [fullscreen,setFullscreen]=useState(false);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const shell=document.getElementById("mmhk-game-viewport");
    const initial=window.localStorage.getItem(STORAGE)==="compact"?"compact":"comfortable";
    setDensity(initial);shell?.setAttribute("data-game-density",initial);
    const check=()=>setFullscreen(document.fullscreenElement===shell);
    document.addEventListener("fullscreenchange",check);
    setReady(true);
    return ()=>document.removeEventListener("fullscreenchange",check);
  },[]);
  const change=(next:Density)=>{
    setDensity(next);
    document.getElementById("mmhk-game-viewport")?.setAttribute("data-game-density",next);
    try{window.localStorage.setItem(STORAGE,next);}catch{/* private browsing */}
  };
  const toggle=async()=>{
    const shell=document.getElementById("mmhk-game-viewport");
    if(!shell)return;
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else await shell.requestFullscreen();
    }catch{/* Fullscreen can be denied by the browser; no fake success. */}
  };
  return <div className="gui-viewport-controls" role="group"
    aria-label="Affichage du royaume" data-testid="game-viewport-controls">
    <span aria-hidden="true">ÉCRAN</span>
    <button type="button" disabled={!ready} aria-pressed={density==="comfortable"}
      onClick={()=>change("comfortable")} title="Affichage confortable">Normal</button>
    <button type="button" disabled={!ready} aria-pressed={density==="compact"}
      onClick={()=>change("compact")} title="Afficher plus d'éléments du jeu">Compact</button>
    <button type="button" disabled={!ready} onClick={toggle}
      aria-label={fullscreen?"Quitter le plein écran":"Passer le royaume en plein écran"}
      title={fullscreen?"Quitter le plein écran":"Plein écran"}>
      {fullscreen?"⇱ Réduire":"⛶ Plein écran"}
    </button>
  </div>;
}
