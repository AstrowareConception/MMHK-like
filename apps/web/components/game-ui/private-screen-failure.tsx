import Link from "next/link";

type Props={scope:string;status:number;retryHref:string};

/** Render an access-safe failure without a GameShell or server-derived
 * city/world information. Authentication and ownership remain API decisions.
 * 401 redirects and 404 notFound are handled by the calling route. */
export function PrivateScreenFailure({scope,status,retryHref}:Props){
  const denied=status===403;
  return <main className="shell mmhk-private-error-shell">
    <section className="mmhk-private-error" role="region"
      aria-labelledby="private-failure-heading" data-testid="private-screen-failure"
      data-failure-kind={denied?"forbidden":"unavailable"}>
      <span className="eyebrow">ROYAUME · {scope.toUpperCase()}</span>
      <h1 id="private-failure-heading">
        {denied?"Accès à cet écran refusé":"Service momentanément indisponible"}
      </h1>
      <p role="alert">{denied?
        "Le serveur ne vous autorise pas à consulter cet écran. Aucune information privée n’est affichée.":
        "Les données de cet écran sont momentanément indisponibles. Votre session est conservée et aucune opération de jeu n’a été lancée."}
      </p>
      <p>{denied?
        "Revenez à vos mondes ou contactez l’administrateur si cet accès devrait être autorisé.":
        "Réessayez lorsque le serveur répondra de nouveau. Cette action ne modifie ni les ressources ni les ordres en cours."}
      </p>
      <nav aria-label="Actions de reprise" className="mmhk-private-error-actions">
        {/* Hard GET navigation bypasses any RSC payload prefetched during
            the outage; it must not resubmit a game command. */}
        {!denied&&<a href={retryHref} className="mmhk-private-retry"
          data-testid="private-screen-retry">Réessayer l’affichage</a>}
        <Link href="/">Revenir à mes mondes</Link>
      </nav>
    </section>
  </main>;
}
