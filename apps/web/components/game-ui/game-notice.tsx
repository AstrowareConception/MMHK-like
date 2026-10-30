import type {ReactNode} from "react";

export type GameNoticeTone="success"|"error"|"info"|"warning";
/** Persistent in-world feedback for authoritative server results.
 * Do not use success unless the server has confirmed a command.
 */
export function GameNotice({tone="info",title,children,testId}:{
  tone?:GameNoticeTone;title:string;children?:ReactNode;testId?:string;
}){
  const symbols:Record<GameNoticeTone,string>={
    success:"✓",error:"!",info:"i",warning:"⚠"
  };
  return <div role={tone==="error"?"alert":"status"}
    aria-live={tone==="error"?"assertive":"polite"}
    className={"gui-notice gui-notice--"+tone} data-testid={testId}>
    <span className="gui-notice-symbol" aria-hidden="true">{symbols[tone]}</span>
    <div><strong>{title}</strong>{children&&<p>{children}</p>}</div>
  </div>;
}
