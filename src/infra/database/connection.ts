import { Knex, knex as setupKnex } from 'knex';
import { env } from '../../env';

export const config: Knex.Config = {/* pegamos a tipagem do Knex para o intelisense nos ajudar */
  client: env.DATABASE_CLIENT,
  connection: env.DATABASE_CLIENT === 'sqlite' ? { filename: env.DATABASE_URL } : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: "./src/infra/database/migrations"
  },

}

export const knex = setupKnex(config);