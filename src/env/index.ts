import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV === 'test') { // o vitest possui já essa variavel ambiente
  config({ path: '.env.test' }); // configura com as variaveis ambientes do teste
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']), // é pg pq o knex usa pg no client
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),// transforma em numero
});

const _env = envSchema.safeParse(process.env); // o safeParse não gera o error. o parse() gera. por isso usamos o safeParse para criamos nosso error

if (_env.success === false) {
  console.error('⚠️ Invalid environment variables', _env.error.format())// mostra os erros de quais variaveis

  throw new Error('Invalid environment variables.');
}


export const env = _env.data