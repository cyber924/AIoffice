import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import { handleApiRequest } from './apiHandler';

dotenv.config();

/**
 * Vercel Serverless Function Default Export
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  return handleApiRequest(req, res);
}
