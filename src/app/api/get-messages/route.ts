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
    if(!session || !user) {
        return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
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

            if (!user || user.length === 0) {
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
        console.error('Error getting acceptMessage:', error);
        return Response.json(
            {
                success: false,
                    message: 'Error getting acceptMessage',
                },
                { status: 500 }
            );
        }
}