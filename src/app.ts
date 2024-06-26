import fastify from 'fastify';
import cookie from '@fastify/cookie';

import { usersRoutes } from './routes/user.routes';
import { mealRoutes } from './routes/meal.routes';


export const app = fastify();

app.register(cookie);

app.register(usersRoutes, { prefix: 'users', });

app.register(mealRoutes, { prefix: 'meals', });