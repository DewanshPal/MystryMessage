import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();
    //currently logged in user
    const session = await getServerSession(authOptions);
    const user:User = session?.user;
    if(!session || !user) {
        return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const { acceptMessage } = await request.json();
    try{
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessage },
            { new: true } //return the updated document
        );

        if (!updatedUser) {
        // User not found
        return Response.json(
            {
            success: false,
            message: 'Unable to find user to update message acceptance status',
            },
            { status: 404 }
        );
        }

        return Response.json(
        {
            success: true,
            message: 'Message acceptance status updated successfully',
            updatedUser,
        },
        { status: 200 }
        );

    } catch(error)
    {
        console.error('Error updating acceptMessage:', error);
        return Response.json(
            {
                success: false,
                message: 'Error updating acceptMessage',
            },
            { status: 500 }
        );
    }

}

export async function GET(request: Request) {
    await dbConnect();
    //currently logged in user
    const session = await getServerSession(authOptions);
    const user:User = session?.user;
    if(!session || !user) {
        return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    try{
        const existingUser = await UserModel.findById(userId);

        if (!existingUser) {
        // User not found
        return Response.json(
            {
            success: false,
            message: 'Unable to find user to get message acceptance status',
            },
            { status: 404 }
        );
        }

        return Response.json(
        {
            success: true,
            message: 'Message acceptance status fetched successfully',
            isAcceptingMessage: existingUser.isAcceptingMessage,
        },
        { status: 200 }
        );

    } catch(error)
    {
        console.error('Error fetching acceptMessage:', error);
        return Response.json(
            {
                success: false,
                message: 'Error fetching acceptMessage',
            },
            { status: 500 }
        );
    }   
}
