import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/db';
import { logAction } from '../utils/auditLogger';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const username = req.params.username as string;
    const user = await prisma.user.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        username: true,
        bio: true,
        profilePhotoUrl: true,
        createdAt: true,
        posts: {
          where: { isSuspended: false },
          include: { 
            file: true,
            author: { select: { id: true, username: true, profilePhotoUrl: true } }
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { bio, profilePhotoUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { bio, profilePhotoUrl },
    });

    await logAction(userId, 'UPDATE_PROFILE', 'USER', userId, (req as any).clientIp);

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and include a capital letter, a small letter, a number, and a special character.' 
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    await logAction(userId, 'UPDATE_PASSWORD', 'USER', userId, (req as any).clientIp);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { agreedToTerms, shareIP } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { agreedToTerms, shareIP },
    });

    await logAction(userId, 'UPDATE_SETTINGS', 'USER', userId, (req as any).clientIp);

    if (agreedToTerms === false) {
      res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
      return res.status(200).json({ message: 'Terms retracted. Logged out.', user: updatedUser });
    }

    res.status(200).json({ message: 'Settings updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // 1. Find or create the generic "Deleted Account" user
    let deletedUser = await prisma.user.findFirst({
      where: { username: 'Deleted Account' }
    });

    if (!deletedUser) {
      deletedUser = await prisma.user.create({
        data: {
          username: 'Deleted Account',
          email: `deleted-${Date.now()}@system.local`,
          password: 'SYSTEM_GENERATED_PASSWORD', 
          role: 'USER',
          agreedToTerms: true
        }
      });
    }

    // 2. Reassign all posts to the "Deleted Account" user
    await prisma.post.updateMany({
      where: { authorId: userId },
      data: { authorId: deletedUser.id }
    });

    // 3. Finally delete the actual user account
    await prisma.user.delete({
      where: { id: userId },
    });

    await logAction(null, 'DELETE_ACCOUNT', 'USER', userId, (req as any).clientIp);

    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
