"use client";

import {useEffect,useId,useRef,useState} from "react";
import type {KeyboardEvent,ReactNode} from "react";
import {createPortal} from "react-dom";

type Props={
  open:boolean;
  title:string;
  eyebrow?:string;
  children:ReactNode;
  footer?:ReactNode;
  onClose:()=>void;
  busy?:boolean;
  closeLabel?:string;
  testId?:string;
  size?:"compact"|"regular"|"wide";
};

/** A real modal, not a floating HTML form: focus trap, Escape, focus return,
 * non-dismissible server requests, and body scroll lock. The actual game
 * mutations remain on the server and never occur when the dialog is opened.
 */
export function GameDialog({open,title,eyebrow,children,footer,onClose,busy=false,
  closeLabel="Fermer la fenêtre",testId,size="regular"}:Props){
  const titleId=useId();
  const detailRef=useRef<HTMLDivElement>(null);
  const openerRef=useRef<HTMLElement|null>(null);
  const closeRef=useRef<HTMLButtonElement>(null);
  const [mounted,setMounted]=useState(false);
  useEffect(()=>setMounted(true),[]);
  useEffect(()=>{
    if(!open||!mounted)return;
    openerRef.current=document.activeElement instanceof HTMLElement?
      document.activeElement:null;
    const current=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const focus=window.requestAnimationFrame(()=>closeRef.current?.focus());
    return ()=>{
      window.cancelAnimationFrame(focus);
      document.body.style.overflow=current;
      openerRef.current?.focus();
    };
  },[open,mounted]);

  function keyDown(event:KeyboardEvent<HTMLDivElement>){
    if(event.key==="Escape"){
      event.stopPropagation();
      if(!busy)onClose();
      return;
    }
    if(event.key!=="Tab")return;
    const root=detailRef.current;
    if(!root)return;
    const focusable=Array.from(root.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )).filter(el=>el.getClientRects().length>0);
    if(!focusable.length){event.preventDefault();root.focus();return;}
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){
      event.preventDefault();last.focus();
    }else if(!event.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){
      event.preventDefault();first.focus();
    }
  }
  if(!open||!mounted)return null;
  return createPortal(
    <div className="gui-modal-overlay" onMouseDown={event=>{
      if(event.target===event.currentTarget&&!busy)onClose();
    }} data-testid={testId?testId+"-overlay":undefined}>
      <div ref={detailRef} className={"gui-window gui-window--"+size}
        role="dialog" aria-modal="true" aria-labelledby={titleId}
        aria-busy={busy} onKeyDown={keyDown} tabIndex={-1} data-testid={testId}>
        <header className="gui-window-header">
          <span className="gui-window-crest" aria-hidden="true">⚜</span>
          <div>
            {eyebrow&&<span className="gui-eyebrow">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button ref={closeRef} type="button" className="gui-window-close"
            onClick={onClose} disabled={busy} aria-label={closeLabel}
            title={closeLabel}>×</button>
        </header>
        <div className="gui-window-body">{children}</div>
        {footer&&<footer className="gui-window-footer">{footer}</footer>}
      </div>
    </div>,document.body
  );
}
