import Link from "next/link";
export type GameTab={id:string;label:string;href?:string;disabled?:boolean};
export function GameTabs({items,active,label="Sections du royaume"}:{
  items:GameTab[];active:string;label?:string;
}){
  return <nav className="gui-tabs" aria-label={label}>
    {items.map(item=>item.disabled||!item.href?
      <span key={item.id} className="gui-tab gui-tab--disabled" aria-disabled="true">
        {item.label}</span>:
      <Link key={item.id} href={item.href}
        className={"gui-tab"+(active===item.id?" gui-tab--active":"")}
        aria-current={active===item.id?"page":undefined}>{item.label}</Link>)}
  </nav>;
}
