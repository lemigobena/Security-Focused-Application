import prisma from './db';

export const logAction = async (
  userId: number | null,
  action: string,
  entity: string,
  entityId: number | null,
  ip: string | null
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        ip,
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};
