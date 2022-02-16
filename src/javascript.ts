import {type JTDDataType} from 'ajv/dist/jtd';
import {type Context, type Optional} from './common';

export const schema = {
  properties: {
    handle: {type: 'string'},
  },
  optionalProperties: {
    settings: {},
    init: {type: 'string'},
    shutdown: {type: 'string'},
  },
} as const;
type Settings = JTDDataType<typeof schema>;

type State = unknown;
type InitFn = (settings: unknown) => Promise<State>;
type HandleFn = (state: State, ctx: Context) => Promise<void>;
type ShutdownFn = (state: State) => Promise<void>;

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
const asyncFn = async function () {};
type AsyncFunction = {new (...args: string[]): typeof asyncFn};
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const AsyncFunction: AsyncFunction = Object.getPrototypeOf(asyncFn).constructor;

export class Handler {
  readonly #settings: unknown;
  readonly #init: Optional<InitFn> = null;
  readonly #handle: HandleFn;
  #shutdown: Optional<ShutdownFn> = null;
  #state: Optional<State> = null;

  constructor({settings, init, handle, shutdown}: Settings) {
    this.#settings = settings;
    if (init != null) this.#init = new AsyncFunction('settings', init);
    this.#handle = new AsyncFunction('state', 'ctx', handle);
    if (shutdown != null) this.#shutdown = new AsyncFunction('state', shutdown);
  }

  async init(): Promise<void> {
    if (this.#init == null) return;
    this.#state = await this.#init(this.#settings);
  }

  async handle(ctx: Context): Promise<void> {
    await this.#handle(this.#state, ctx);
  }

  async shutdown(): Promise<void> {
    if (this.#shutdown != null) {
      await this.#shutdown(this.#state);
      this.#shutdown = null;
    }
  }
}
