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

  function focusableControls(){
    const root=detailRef.current;
    if(!root)return [];
    return Array.from(root.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )).filter(el=>el.getClientRects().length>0 &&
      !el.closest('[inert],[aria-hidden="true"]'));
  }

  function focusFirstAvailable(){
    // An initially busy window may have NO enabled controls (its close
    // button is disabled). The dialog itself is the accessible fallback.
    (focusableControls()[0]??detailRef.current)?.focus();
  }

  useEffect(()=>{
    if(!open||!mounted)return;
    const root=detailRef.current;
    if(!root)return;
    openerRef.current=document.activeElement instanceof HTMLElement?
      document.activeElement:null;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    // Keep programmatic focus changes and background keyboard navigation
    // inside the active modal, even when no control is enabled.
    const onFocusIn=(event:FocusEvent)=>{
      if(event.target instanceof Node&&!root.contains(event.target))
        focusFirstAvailable();
    };
    document.addEventListener("focusin",onFocusIn);
    const frame=window.requestAnimationFrame(focusFirstAvailable);
    return ()=>{
      window.cancelAnimationFrame(frame);
      document.removeEventListener("focusin",onFocusIn);
      document.body.style.overflow=previousOverflow;
      openerRef.current?.focus();
    };
  },[open,mounted]);

  useEffect(()=>{
    if(!open||!mounted)return;
    const root=detailRef.current;
    if(!root)return;
    const active=document.activeElement;
    // Toggling busy can disable the currently focused submit or close
    // button. Do not leave keyboard focus on the page behind the overlay.
    if(!root.contains(active)||
      active instanceof HTMLButtonElement&&active.disabled)
      focusFirstAvailable();
    else if(!busy&&active===root)closeRef.current?.focus();
  },[open,mounted,busy]);

  function keyDown(event:KeyboardEvent<HTMLDivElement>){
    if(event.key==="Escape"){
      event.stopPropagation();
      event.preventDefault();
      if(!busy)onClose();
      return;
    }
    if(event.key!=="Tab")return;
    const root=detailRef.current;
    if(!root)return;
    const focusable=focusableControls();
    if(!focusable.length){event.preventDefault();root.focus();return;}
    const first=focusable[0],last=focusable[focusable.length-1];
    if(document.activeElement===root){
      event.preventDefault();
      (event.shiftKey?last:first).focus();
    }else if(event.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){
      event.preventDefault();last.focus();
    }else if(!event.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){
      event.preventDefault();first.focus();
    }
  }
  if(!open||!mounted)return null;
  return createPortal(
    <div className="gui-modal-overlay" onClick={event=>{
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
