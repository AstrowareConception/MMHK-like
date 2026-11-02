"use client";

import {useEffect,useState} from "react";
import {GameDialog} from "./game-dialog";

/** Local-only integration fixture to exercise actual GameDialog props in
 * Chromium, including a disabled close button and zero focusable children. */
export function DialogQaHarness(){
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [mode,setMode]=useState<"empty"|"transition">("empty");
  const [closes,setCloses]=useState(0);
  useEffect(()=>{
    const finish=()=>setBusy(false);
    window.addEventListener("mmhk-qa-release-dialog",finish);
    return ()=>window.removeEventListener("mmhk-qa-release-dialog",finish);
  },[]);
  function launch(next:"empty"|"transition"){
    setMode(next);setBusy(next==="empty");setOpen(true);
  }
  return <main className="shell">
    <h1>Recette locale des fenêtres</h1>
    <button type="button" data-testid="qa-open-busy"
      onClick={()=>launch("empty")}>Ouvrir une fenêtre occupée</button>
    <button type="button" data-testid="qa-open-transition"
      onClick={()=>launch("transition")}>Ouvrir une fenêtre disponible</button>
    <p data-testid="qa-close-count">Fermetures : {closes}</p>
    <GameDialog open={open} busy={busy} title="Contrôle du traitement"
      testId="qa-busy-dialog" onClose={()=>{setCloses(n=>n+1);setOpen(false);}}>
      <p>Cette fenêtre vérifie le focus sans modifier de donnée métier.</p>
      {mode==="transition"&&<button type="button" disabled={busy}
        onClick={()=>setBusy(true)}>Commencer le traitement</button>}
    </GameDialog>
  </main>;
}
