import UserModel from '@/model/user.model';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { Message } from '@/model/user.model';
import { NextRequest } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/options';
import mongoose from 'mongoose';

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  const paramsd = await params;
  const messageId = paramsd?.messageid;
  
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;
  
  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  console.log('Delete request for messageId:', messageId);
  console.log('User ID:', _user.id);

  try {
    // Convert messageId to ObjectId if it's a valid ObjectId string
    let messageObjectId;
    try {
      messageObjectId = new mongoose.Types.ObjectId(messageId);
    } catch (e) {
      return Response.json(
        { message: 'Invalid message ID format', success: false },
        { status: 400 }
      );
    }

    // Convert user ID to ObjectId - use _user.id (not _user._id)
    const userId = new mongoose.Types.ObjectId(_user.id);

    const updateResult = await UserModel.updateOne(
      { _id: userId },
      { $pull: { message: { _id: messageObjectId } } }
    );

    console.log('Update result:', updateResult);

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'Message deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return Response.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}