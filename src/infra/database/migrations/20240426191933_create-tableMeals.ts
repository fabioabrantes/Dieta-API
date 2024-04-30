import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', table => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.boolean('is_Diet').notNullable();
    table.date('date').notNullable();
    table.time('time').notNullable();
    table.uuid('user_id').references('users.id').notNullable().onDelete("Cascade");
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}

