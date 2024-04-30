import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";

import { checkSessionIdExists } from '../middlewares/check-session-id-exists';
import { knex } from "../infra/database/connection";
import { userInfo } from "node:os";

export async function mealRoutes(app: FastifyInstance) {

  app.addHook('preHandler', checkSessionIdExists);

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      time: z.string(),
      isDiet: z.boolean(),
    });

    const validationSchema = createMealBodySchema.safeParse(request.body);
    if (!validationSchema.success) {
      return reply.status(400).send({ message: validationSchema.error.errors });
    }

    const { name, description, date, time, isDiet } = validationSchema.data;
    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_Diet: isDiet,
      date,
      time,
      user_id: request.user?.id
    });

    return reply.status(201).send({ message: "Refeição cadastrada com sucesso" });
  });

  app.get('/', async (request, reply) => {
    const meals = await knex('meals').where({ user_id: request.user?.id }).select().orderBy('date', 'desc');

    return reply.status(200).send({ meals });
  })

  app.get('/:id', async (request, reply) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealsParamsSchema.parse(request.params);
    const meal = await knex('meals').where({ id, user_id: request.user?.id }).first();

    if (!meal) {
      return reply.status(404).send({ message: 'Refeição não encontrada' })
    }

    return reply.status(200).send(meal);
  });

  app.delete('/:id', async (request, reply) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealsParamsSchema.parse(request.params);

    const amountRow = await knex('meals').where({ id, user_id: request.user?.id }).delete();
    if (amountRow === 0) {
      
      return reply.status(404).send({ message: 'Error: Refeição não existe ' });
    }

    console.log(amountRow);
    return reply.status(200).send({ message: "Refeição removida com sucesso" });
  });

  app.put('/:id', async (request, reply) => {
    const putMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = putMealsParamsSchema.parse(request.params);

    const editMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      time: z.string(),
      isDiet: z.boolean(),
    });

    const validationSchema = editMealBodySchema.safeParse(request.body);

    if (!validationSchema.success) {
      return reply.status(400).send({ message: validationSchema.error.errors })
    }

    const { name, description, date, time, isDiet } = validationSchema.data;

    const countRows = await knex('meals').where({ id, user_id: request.user?.id }).update({
      name,
      description,
      date,
      time,
      is_Diet: isDiet,
    });

    if (countRows === 0) {
      console.log(countRows);
      return reply.status(404).send({ message: 'Error: Refeição não encontrda para atualizar' });
    }

    console.log(countRows);
    return reply.status(200).send({ message: "Refeição atualizada com sucesso" });
  });

  app.get('/summary', async (request, reply) => {
    const totalMealsOnDiet = await knex('meals')
      .where({ user_id: request.user?.id, is_Diet: true })
      .count('id', { as: 'totalOnDiet' })
      .first();

    const totalMealsOffDiet = await knex('meals')
      .where({ user_id: request.user?.id, is_Diet: false })
      .count('id', { as: 'totalOffDiet' })
      .first();

    const meals = await knex('meals')
      .where({ user_id: request.user?.id })
      .orderBy('date', 'desc');

    const { bestOnDietSequence } = meals.reduce((acc, meal) => {
      if (meal.is_Diet) {
        acc.currentSequence += 1
      } else {
        acc.currentSequence = 0
      }

      if (acc.currentSequence > acc.bestOnDietSequence) {
        acc.bestOnDietSequence = acc.currentSequence
      }

      return acc
    },
      { bestOnDietSequence: 0, currentSequence: 0 },
    );

    return reply.send({
      totalMeals: meals.length,
      totalMealsOnDiet: totalMealsOnDiet?.totalOnDiet,
      totalMealsOffDiet: totalMealsOffDiet?.totalOffDiet,
      bestOnDietSequence,
    })
  },
  )

}