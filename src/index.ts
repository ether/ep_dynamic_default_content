import Ajv, {type JTDDataType} from 'ajv/dist/jtd';
import {isContext, logger, setLogger, type Awaitable, type Context, type Logger} from './common';
import * as mariadb from './mariadb';
import * as javascript from './javascript';

const ajv = new Ajv();

const settingsSchema = {
  discriminator: 'type',
  mapping: {
    mariadb: {properties: {mariadb: mariadb.schema}},
    javascript: {properties: {javascript: javascript.schema}},
  },
} as const;
type PluginSettings = JTDDataType<typeof settingsSchema>;
const validSettings = ajv.compile<PluginSettings>(settingsSchema);

let handler: {
  init(): Awaitable<void>;
  handle(ctx: Context): Awaitable<void>;
  shutdown(): Awaitable<void>;
} | null = null;

export const init_ep_dynamic_default_content = async (hookName, {logger}: {logger?: Logger}) => {
  if (logger != null) setLogger(logger);
};

type LoadSettingsContext = {settings: Record<string, unknown>};
export const loadSettings = async (hookName, ctx: LoadSettingsContext): Promise<void> => {
  const {settings: {ep_dynamic_default_content: settings}} = ctx;
  if (handler != null) {
    await handler.shutdown();
    handler = null;
  }
  if (!validSettings(settings)) {
    const errMsg = validSettings.errors.map((e) => JSON.stringify(e)).join('\n');
    logger.error(`invalid settings: ${errMsg}`);
    return;
  }
  switch (settings.type) {
    case 'mariadb': handler = new mariadb.Handler(settings.mariadb); break;
    case 'javascript': handler = new javascript.Handler(settings.javascript); break;
    default: ((exhaustivenessCheck: never) => {})(settings);
  }
  await handler.init();
  logger.info('configured');
};

export const padDefaultContent = async (hookName: string, ctx: Context): Promise<void> => {
  if (handler == null || !isContext(ctx)) return;
  await handler.handle(ctx);
};

export const shutdown = async (hookName: string, ctx: unknown): Promise<void> => {
  if (handler != null) {
    await handler.shutdown();
    handler = null;
  }
};
