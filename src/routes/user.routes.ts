import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";

import { knex } from "../infra/database/connection";

export async function usersRoutes(app: FastifyInstance) {

  app.post('/', async (request, reply) => {

    const createUsersBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      github: z.string()
    });
    const validationSchema = createUsersBodySchema.safeParse(request.body);
    if (!validationSchema.success) {
      return reply.status(400).send({ message: validationSchema.error.errors });
    }

    const { name, email, github } = validationSchema.data;

    const userExist = await knex('users').where({ email }).first();
    if (userExist) {
      return reply.status(400).send({ error: 'User already exists' });
    }

    let sessionId = request.cookies.sessionId;
    const newSessionId = randomUUID();
    if (!sessionId) {
      reply.setCookie('sessionId', newSessionId, {
        path: '/',// aqui diz quais rotas vão ter o cookie. neste caso todas
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    } else {
      const existUserWithSessionBD = await knex('users').where({ session_id: sessionId }).first();
      if (existUserWithSessionBD) {
        reply.clearCookie('sessionId', { path: '/', });
        reply.setCookie('sessionId', newSessionId, {
          path: '/',// aqui diz quais rotas vão ter o cookie. neste caso todas
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
    }


    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      github,
      session_id: newSessionId
    });

    return reply.status(201).send({ message: "usuário cadastrado realizada com sucesso" });
  });

  app.post("/getsession", async (request, reply) => {
    const createUsersBodySchema = z.object({
      email: z.string().email(),
    });

    const validationSchema = createUsersBodySchema.safeParse(request.body);
    if (!validationSchema.success) {
      return reply.status(400).send({ message: validationSchema.error.errors });
    }

    const { email } = validationSchema.data;
    const userExist = await knex('users').where({ email }).first();

    if (!userExist) {
      return reply.status(400).send({ message: 'Error: User already not exists' });
    }

    let sessionId = userExist.session_id;

    if (sessionId) {
      reply.setCookie('sessionId', sessionId, {
        path: '/',// aqui diz quais rotas vão ter o cookie. neste caso todas
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
    return reply.status(200).send({ message: 'session realizado com sucesso' });
  });
}