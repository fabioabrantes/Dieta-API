import { Knex } from 'knex'
// ou faça apenas:
// import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string;
      name: string;
      email: string;
      github: string;
      created_at: string;
      session_id?: string;
    }
    meals: {
      id: string
      name: string
      description: string
      date: Date
      time: string
      user_id: string
      is_Diet: boolean
      created_at: Date
      updated_at: Date
    }
  }
}