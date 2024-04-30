// FastifyRequestContext
import 'fastify';

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      id: string;
      session_id?: string;
      name: string;
      email: string;
      github:string;
      created_at: string;
    }
  }
}