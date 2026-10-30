import type {ReactNode} from "react";
type Props={
  title:string;eyebrow?:string;children:ReactNode;footer?:ReactNode;
  className?:string;testId?:string;decorativeSymbol?:string;id?:string;
};
/** Framed HUD panel. No business state or browser API. */
export function GamePanel({title,eyebrow,children,footer,className="",
  testId,decorativeSymbol="⚜",id}:Props){
  return <section className={"gui-panel "+className} data-testid={testId} id={id}>
    <header className="gui-panel-title">
      <span aria-hidden="true">{decorativeSymbol}</span>
      <div>{eyebrow&&<small>{eyebrow}</small>}<h2>{title}</h2></div>
    </header>
    <div className="gui-panel-content">{children}</div>
    {footer&&<footer className="gui-panel-footer">{footer}</footer>}
  </section>;
}
