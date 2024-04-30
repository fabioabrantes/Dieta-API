import { afterAll, beforeAll, it, describe, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { execSync } from 'node:child_process';

describe('meals routes', () => {
  beforeAll(async () => {
    await app.ready() // os plugins do app são asyncronos. então precisamos esperar carrega-los antes de executar todos os testes
  });

  afterAll(async () => {
    await app.close() // fechar o app assim que todos os testes finalizarem
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')// funão do node que executa commandos no terminal
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meals', async () => {// as funções it e test fazem a mesma coisa. mas é melhor usar it para ficar mais semântico a leitura
    const createUserResponse = await request(app.server)// aqui cria o server sem usar o listen
      .post('/users')
      .send({
        name: "new user",
        email: 'fad@email.com',
        github: 'https://github.com/fabioabrantes',
      })
      .expect(201);

    const cookies = createUserResponse.get('Set-Cookie');
    if (cookies) {
      await request(app.server)// aqui cria o server sem usar o listen
        .post('/meals')
        .set('Cookie', cookies)
        .send({
          name: 'New meals',
          description: "sandwiche de sardinha com azietona",
          isDiet: true,
          date: "2024-04-25",
          time: "10:35:30"
        })
        .expect(201);
    }
  });
  it('should be able to list all meals', async () => {// as funções it e test fazem a mesma coisa. mas é melhor usar it para ficar mais semântico a leitura
    const createUserResponse = await request(app.server)// aqui cria o server sem usar o listen
      .post('/users')
      .send({
        name: "new user",
        email: 'fad@email.com',
        github: 'https://github.com/fabioabrantes',
      })
      .expect(201);

    const cookies = createUserResponse.get('Set-Cookie');
    if (cookies) {
      await request(app.server)// aqui cria o server sem usar o listen
        .post('/meals')
        .set('Cookie', cookies)
        .send({
          name: 'New meals',
          description: "sandwiche de tripa",
          isDiet: false,
          date: "2024-04-25",
          time: "10:35:30"
        });
      await request(app.server)// aqui cria o server sem usar o listen
        .post('/meals')
        .set('Cookie', cookies)
        .send({
          name: 'New meals',
          description: "sandwiche de tripa",
          isDiet: false,
          date: "2024-04-25",
          time: "10:35:30"
        });

      const listMealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200);

      expect(listMealsResponse.body.meals).toEqual([
        expect.objectContaining({
          name: 'New meals',
          description: "sandwiche de tripa",
          isDiet: 0,
          date: "2024-04-25",
          time: "10:35:30"
        }),
      ]);
    }
  });

});
