import { useCallback, useEffect, useState } from "react";
import type { Destination, Route } from "../types/content";

const ROUTES: Route[] = ["/", "/work", "/about", "/playground"];

/**
 * Whether a destination is a page this app renders.
 *
 * Not every destination is: the lamp post leads to a PDF sitting in `public/`,
 * which the browser fetches for itself. Anything this returns false for must
 * not be pushed onto the history stack -- doing so would swap the garden for a
 * route that does not exist and land on the "/" fallback.
 */
export function isRoute(href: Destination): href is Route {
  return (ROUTES as string[]).includes(href);
}

function read(): Route {
  const p = window.location.pathname.replace(/\/+$/, "") || "/";
  return (ROUTES as string[]).includes(p) ? (p as Route) : "/";
}

/**
 * The whole of this site's navigation.
 *
 * Four routes and no nested state, so a router library would be all cost and
 * no benefit. Real paths rather than hashes, which means a static host must
 * fall back to index.html for unknown paths -- see the README.
 */
export function useRoute() {
  const [route, setRoute] = useState<Route>(read);

  useEffect(() => {
    const onPop = () => setRoute(read());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = useCallback((next: Route) => {
    if (next === read()) return;
    window.history.pushState(null, "", next);
    setRoute(next);
    window.scrollTo(0, 0);
  }, []);

  return { route, go };
}
