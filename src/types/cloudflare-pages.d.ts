interface PagesFunction<Env = unknown> {
  (context: EventContext<Env, string, unknown>): Promise<Response> | Response;
}

interface EventContext<Env, P extends string = string, D extends Record<string, unknown> = Record<string, unknown>> {
  env: Env;
  params: Record<P, string>;
  data: D;
  request: Request;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
}

declare global {
  const PagesFunction: {
    prototype: PagesFunction;
    new(): PagesFunction;
  };
} 