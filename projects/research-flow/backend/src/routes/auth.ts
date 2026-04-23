import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { getUserAccessToken, getUserInfo } from '../feishu/client.js';
import { generateToken, AuthUser, asyncHandler, getPrisma, AppError } from '../middleware.js';

export const authRouter = Router();

const FEISHU_APP_ID = process.env.FEISHU_APP_ID;

authRouter.post(
  '/feishu/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code) {
      throw new AppError(400, 'Authorization code required');
    }

    const tokenData = await getUserAccessToken(code);
    const userAccessToken = tokenData.access_token;

    const feishuUser = await getUserInfo(userAccessToken);

    const openId = feishuUser.open_id;
    const name = feishuUser.name || feishuUser.en_name || 'Unknown';
    const avatarUrl = feishuUser.avatar_url || '';
    const email = feishuUser.email || '';

    const prisma = getPrisma(req);

    let user = await prisma.user.findUnique({
      where: { feishuId: openId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          feishuId: openId,
          name,
          avatar: avatarUrl,
          email,
          role: 'PHD',
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          avatar: avatarUrl,
          email: email || user.email,
        },
      });
    }

    const authUser: AuthUser = {
      id: user.id,
      feishuOpenId: openId,
      name: user.name,
      avatarUrl: user.avatar || undefined,
      email: user.email || undefined,
      role: user.role,
      labId: user.labId || undefined,
    };

    const token = generateToken(authUser);

    res.json({
      token,
      refreshToken: tokenData.refresh_token,
      user: authUser,
    });
  }),
);

authRouter.get(
  '/me',
  asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Not authenticated');
    }

    const { authMiddleware } = await import('../middleware.js');
    // Re-use auth middleware to verify token
    const token = authHeader.slice(7);
    if (token.startsWith('dev-mock-token-')) {
      res.json({
        id: 'dev-user-1',
        feishuOpenId: 'dev-open-id-1',
        name: '测试用户',
        role: 'PHD',
        labId: 'dev-lab-1',
      });
      return;
    }

    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'rf-dev-jwt-secret';
    try {
      const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
      const prisma = getPrisma(req);
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        include: { lab: true },
      });
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      res.json({
        id: user.id,
        feishuOpenId: user.feishuId,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        role: user.role,
        labId: user.labId,
        lab: user.lab,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(401, 'Invalid token');
    }
  }),
);

authRouter.patch(
  '/:id/role',
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || (req.user.role !== 'ADVISOR' && req.user.role !== 'ADMIN')) {
      throw new AppError(403, 'Only advisors can change roles');
    }

    const { role } = req.body;
    const validRoles: string[] = ['ADVISOR', 'POSTDOC', 'PHD', 'MASTER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new AppError(400, `Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const prisma = getPrisma(req);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: role as Role },
    });

    res.json(user);
  }),
);

authRouter.get(
  '/feishu/authorize-url',
  asyncHandler(async (req: Request, res: Response) => {
    const redirectUri = req.query.redirect_uri as string || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`;
    const state = req.query.state as string || '';

    const url = `https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=${FEISHU_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    res.json({ url });
  }),
);