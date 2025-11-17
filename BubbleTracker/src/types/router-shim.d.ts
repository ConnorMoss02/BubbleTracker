import type React from "react";

declare module "react-router-dom" {
  export type NavigateOptions = { replace?: boolean };

  export function BrowserRouter(props: { children?: React.ReactNode }): React.ReactElement;
  export function Routes(props: { children?: React.ReactNode }): React.ReactElement | null;
  export function Route(props: { path: string; element: React.ReactNode }): null;
  export function Link(
    props: React.PropsWithChildren<{ to: string; className?: string; target?: string; rel?: string }>
  ): React.ReactElement;
  export function useNavigate(): (to: string, options?: NavigateOptions) => void;
  export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T;
}
