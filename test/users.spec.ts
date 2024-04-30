import { afterAll, beforeAll, it, describe, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { execSync } from 'node:child_process';

describe('user routes', () => {
  beforeAll(async () => { // essa função só executa uma única vez antes da execução de todos os testes
    await app.ready(); // os plugins do app são asyncronos. então precisamos esperar carrega-los antes de executar todos os testes
  });

  afterAll(async () => {
    await app.close(); // fechar o app assim que todos os testes finalizarem
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')// função do node que executa commandos no terminal
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {// as funções it e test fazem a mesma coisa. mas é melhor usar it para ficar mais semântico a leitura
    await request(app.server)// aqui cria o server sem usar o listen
      .post('/users')
      .send({
        name: "new user",
        email: 'fad@email.com',
        github: 'https://github.com/fabioabrantes',
      })
      .expect(201);
  });
});



