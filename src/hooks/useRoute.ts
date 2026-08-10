import { useCallback, useEffect, useState } from "react";
import type { Route } from "../types/content";

const ROUTES: Route[] = ["/", "/work", "/about", "/playground"];

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
