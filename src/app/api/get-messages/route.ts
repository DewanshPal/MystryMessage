import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect();
    //currently logged in user
    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    
    console.log('=== GET MESSAGES DEBUG ===');
    console.log('Session:', JSON.stringify(session, null, 2));
    console.log('User object:', JSON.stringify(user, null, 2));
    console.log('User ID:', user?.id);
    
    if(!session || !user) {
        return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!user.id) {
        console.log('❌ User ID is missing from session');
        return Response.json({ success: false, message: 'User ID missing from session' }, { status: 400 });
    }

    try {
        const userId = new mongoose.Types.ObjectId(user.id);
        console.log('Converted userId:', userId);
    } catch (error) {
        console.log('❌ Invalid user ID format:', user.id);
        return Response.json({ success: false, message: 'Invalid user ID format' }, { status: 400 });
    }

    const userId = new mongoose.Types.ObjectId(user.id);
    try{
        const user = await UserModel.aggregate([
            { $match : { _id: userId}},
            {
                $unwind: {
                    path: "$message",
                    preserveNullAndEmptyArrays: true
                }

            },
            {
                $sort: { "message.createdAt": -1 }
            },
            {
                $group:{_id:"$_id",message:{$push:"$message"}}
            }
        ]).exec();

        console.log('Aggregation result:', JSON.stringify(user, null, 2));

            if (!user || user.length === 0) {
            console.log('❌ No user found with ID:', userId);
            return Response.json(
                    { message: 'User not found', success: false },
                    { status: 404 }
                );
            }
            return Response.json(
                {
                    success: true,
                    message: 'Messages fetched successfully',
                    messages: user?.[0]?.message ?? [] //optional chaining to handle undefined
                },
                { status: 200
                }
            )
        } catch(error){
        console.error('❌ Error in get-messages:', error);
        return Response.json(
            {
                success: false,
                message: 'Error fetching messages',
            },
            { status: 500 }
        );
        }
}