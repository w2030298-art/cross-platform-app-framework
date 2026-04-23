import { Router } from 'express';
import { asyncHandler, validateBody, getPrisma, AppError } from '../middleware.js';
import { createEquipmentSchema, createBookingSchema } from '../validators.js';
import { BookingStatus } from '@prisma/client';

export const equipmentRouter = Router();

equipmentRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const labId = req.query.labId as string;
    if (!labId) throw new AppError(400, 'labId required');
    const equipment = await prisma.equipment.findMany({
      where: { labId },
      include: { bookings: { where: { status: BookingStatus.APPROVED } } },
    });
    res.json(equipment);
  }),
);

equipmentRouter.post(
  '/',
  validateBody(createEquipmentSchema),
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    if (req.user!.role !== 'ADVISOR' && req.user!.role !== 'ADMIN') {
      throw new AppError(403, 'Only advisors or admins can add equipment');
    }
    const equipment = await prisma.equipment.create({
      data: { ...req.body, labId: req.user!.labId! },
    });
    res.status(201).json(equipment);
  }),
);

equipmentRouter.post(
  '/:id/book',
  validateBody(createBookingSchema),
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const equipmentId = req.params.id;

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) throw new AppError(404, 'Equipment not found');

    const conflict = await prisma.equipmentBooking.findFirst({
      where: {
        equipmentId,
        status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
        OR: [
          { startTime: { lte: req.body.endTime }, endTime: { gte: req.body.startTime } },
        ],
      },
    });
    if (conflict) throw new AppError(409, 'Time slot conflicts with existing booking');

    const booking = await prisma.equipmentBooking.create({
      data: {
        equipmentId,
        userId: req.user!.id,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        purpose: req.body.purpose,
      },
    });
    res.status(201).json(booking);
  }),
);

equipmentRouter.get(
  '/:id/bookings',
  asyncHandler(async (req, res) => {
    const prisma = getPrisma(req);
    const bookings = await prisma.equipmentBooking.findMany({
      where: { equipmentId: req.params.id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { startTime: 'desc' },
    });
    res.json(bookings);
  }),
);