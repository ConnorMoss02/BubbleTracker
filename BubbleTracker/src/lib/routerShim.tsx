import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type RouterContextValue = {
  pathname: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);
const ParamsContext = createContext<Record<string, string>>({});

function getPathname() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname || "/";
}

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>(() => getPathname());

  useEffect(() => {
    const handler = () => setPathname(getPathname());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      if (typeof window === "undefined") return;
      if (options?.replace) {
        window.history.replaceState({}, "", to);
      } else {
        window.history.pushState({}, "", to);
      }
      setPathname(getPathname());
    },
    []
  );

  const value = useMemo(() => ({ pathname, navigate }), [pathname, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

type RouteProps = {
  path: string;
  element: React.ReactNode;
};

export function Routes({ children }: { children: React.ReactNode }) {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("Routes must be used inside BrowserRouter");

  let matchedElement: React.ReactNode = null;
  let params: Record<string, string> = {};

  React.Children.forEach(children, (child) => {
    if (matchedElement) return;
    if (!React.isValidElement<RouteProps>(child)) return;
    const match = matchPath(child.props.path, ctx.pathname);
    if (match) {
      matchedElement = child.props.element;
      params = match;
    }
  });

  return <ParamsContext.Provider value={params}>{matchedElement}</ParamsContext.Provider>;
}

export function Route(_props: RouteProps) {
  return null;
}

export function Link({ to, children, className, target, rel }: { to: string; children: React.ReactNode; className?: string; target?: string; rel?: string }) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      className={className}
      target={target}
      rel={rel}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

export function useNavigate() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useNavigate must be used inside BrowserRouter");
  return ctx.navigate;
}

export function useParams<T extends Record<string, string>>() {
  return useContext(ParamsContext) as T;
}

function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  if (pattern === "*") return {};
  const patternSegments = normalize(pattern).split("/").filter(Boolean);
  const pathSegments = normalize(pathname).split("/").filter(Boolean);

  if (patternSegments.length === 0 && pathSegments.length === 0) return {};
  if (patternSegments.length !== pathSegments.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternSegments.length; i += 1) {
    const expected = patternSegments[i];
    const actual = pathSegments[i];
    if (expected.startsWith(":")) {
      params[expected.slice(1)] = decodeURIComponent(actual ?? "");
    } else if (expected !== actual) {
      return null;
    }
  }

  return params;
}

function normalize(path: string) {
  if (!path) return "";
  if (path === "/") return "";
  return path.replace(/^\/+|\/+$|\s+/g, "");
}
