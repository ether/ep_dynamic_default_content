import {type JTDDataType} from 'ajv/dist/jtd';
import {logger, type Context} from './common';
import {createPool, type Pool, type PoolConfig} from 'mariadb';

export const schema = {
  properties: {
    config: {},
    sql: {type: 'string'},
  },
} as const;

type Settings = JTDDataType<typeof schema>;

type QueryReturn = Awaited<ReturnType<Pool['query']>> & {
    meta: unknown[];
};
type Results = [string][] & {meta: unknown[]};
const isResults = (rows: QueryReturn): rows is Results => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Pool.query's return value is not well typed, so we have to silence ESLint. :( */
  const meta = rows?.meta;
  if (!Array.isArray(rows)) return false;
  if (!Array.isArray(meta) || meta.length === 0) return false;
  if (meta.length > 1) logger.warn('query returned multiple columns; using the first column');
  // The column metadata for the first column could be examined to see if it describes a string, but
  // that's too complicated (meta[0].type can be one of many different string types, including
  // blobs). Just check to see if there's a string in the first column of the first row (if
  // present).
  if (rows.length === 0) return true; // Assume first col would be a string if there was a row.
  const [row] = rows;
  if (!Array.isArray(row) || row.length === 0) return false;
  return typeof row[0] === 'string';
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
};

export class Handler {
  readonly #pool: Pool;
  readonly #sql: string;

  constructor({config, sql}: Settings) {
    this.#pool = createPool(config as string | PoolConfig);
    this.#sql = sql;
  }

  async init(): Promise<void> {
    // Make sure we can connect to the database.
    const conn = await this.#pool.getConnection();
    await conn.release();
  }

  async handle(ctx: Context): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Pool.query's return value is not well typed.
    const rows: QueryReturn = await this.#pool.query({
      namedPlaceholders: true,
      rowsAsArray: true,
      sql: this.#sql,
    }, {
      authorId: ctx.authorId,
      padId: ctx.pad.id,
    });
    if (!isResults(rows)) {
      logger.warn('query returned unexpected type');
      return;
    }
    if (rows.length === 0) return;
    if (rows.length > 1) logger.warn('query returned multiple rows; using the first row');
    ctx.content = rows[0][0];
  }

  async shutdown(): Promise<void> {
    await this.#pool.end();
  }
}
