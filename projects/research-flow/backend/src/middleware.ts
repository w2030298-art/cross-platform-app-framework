import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rf-dev-jwt-secret';

export interface AuthUser {
  id: string;
  feishuOpenId: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  role: string;
  labId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      prisma?: PrismaClient;
    }
  }
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, details: err.details });
    return;
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}

export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
      return;
    }
    req.query = result.data as any;
    next();
  };
}

export function getPrisma(req: Request): PrismaClient {
  return req.app.get('prisma');
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);

  // Dev mock token support
  if (token.startsWith('dev-mock-token-')) {
    req.user = {
      id: 'dev-user-1',
      feishuOpenId: 'dev-open-id-1',
      name: '测试用户',
      role: 'PHD',
      labId: 'dev-lab-1',
    };
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token.startsWith('dev-mock-token-')) {
      req.user = {
        id: 'dev-user-1',
        feishuOpenId: 'dev-open-id-1',
        name: '测试用户',
        role: 'PHD',
        labId: 'dev-lab-1',
      };
      next();
      return;
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
      req.user = payload;
    } catch {}
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}