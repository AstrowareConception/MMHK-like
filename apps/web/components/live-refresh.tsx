"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Revalidate the authenticated server-side city view from PostgreSQL.
 * The client never predicts stock changes or completion times as truth.
 * Pauses when the tab is hidden; avoid polling off-screen pages.
 */
export function LiveRefresh({ intervalSeconds = 10 }: { intervalSeconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [router, intervalSeconds]);

  return (
    <p className="live-refresh-status" aria-live="off">
      Actualisation automatique des ressources et des chantiers
      toutes les {intervalSeconds} secondes lorsque cet onglet est visible.
    </p>
  );
}
