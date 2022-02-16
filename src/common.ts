export type Awaitable<T> = T | Promise<T> | PromiseLike<T>;
export type Optional<T> = T | null | undefined;

type LogLevels = 'debug' | 'info' | 'log' | 'warn' | 'error';
export type Logger = {
  [L in LogLevels]: (this: Logger, ...args: unknown[]) => unknown;
};
export let logger: Logger = console;
export const setLogger = (l: Logger): void => { logger = l; };

export type Context = {
  pad: {id: string};
  authorId: string;
  type: 'text';
  content: string;
};
export const isContext = (ctx: Context): ctx is Context => (
  typeof ctx?.pad?.id === 'string' && typeof ctx.authorId === 'string');
