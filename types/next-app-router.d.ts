/**
 * Oprava typů Next.js App Router
 * 
 * Tento soubor opravuje chybu typů v Next.js App Router, kde generované typy očekávají Promise<SegmentParams>
 * místo SegmentParams jako typ pro params.
 */

// Přepíšeme definice z Next.js App Router, aby správně používaly SegmentParams bez Promise
declare module 'next/navigation' {
  export interface PageProps {
    params?: Record<string, string>;
    searchParams?: Record<string, string | string[]>;
  }
  
  export interface LayoutProps {
    children?: React.ReactNode;
    params?: Record<string, string>;
  }

  // Přidání definic pro useRouter a notFound
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    refresh: () => void;
    prefetch: (href: string) => void;
    back: () => void;
    forward: () => void;
  };

  export function notFound(): never;
}

// Deklarace pro route handlery v App Router
declare module 'next/dist/server/future/route-modules/app-route/module' {
  interface RouteModule {
    GET?: (req: Request, context: { params: Record<string, string> }) => Promise<Response>;
    POST?: (req: Request, context: { params: Record<string, string> }) => Promise<Response>;
    PUT?: (req: Request, context: { params: Record<string, string> }) => Promise<Response>;
    DELETE?: (req: Request, context: { params: Record<string, string> }) => Promise<Response>;
    PATCH?: (req: Request, context: { params: Record<string, string> }) => Promise<Response>;
    HEAD?: (req: Request, context: { params: Record<string, string> }) => Promise<Response>;
    OPTIONS?: (req: Request, context: { params: Record<string, string> }) => Promise<Response>;
  }
}
