import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { verifySchema } from "@/schemas/verifySchema";
import {z} from "zod";

export async function POST(request: Request) {
    await dbConnect();

    try{
        const {username, code} = await request.json();
        const result = verifySchema.safeParse({code});
        
        if(!result.success) {
            const tree = z.treeifyError(result.error);
            const codeError = tree.properties?.code?.errors || [];
            return Response.json({ success: false, message: codeError?.length>0 ? codeError.join(", ") : "Invalid verification code" }, { status: 400 });
        }

        const user = await UserModel.findOne({ username, verifyCode: code });
        
        if (!user) {
            return Response.json({ success: false, message: 'Invalid verification code or username' }, { status: 400 });
        }
        if (user.isVerified) {
            return Response.json({ success: false, message: 'User is already verified' }, { status: 400 });
        }
        if (user.verifyCodeExpiry && user.verifyCodeExpiry < new Date()) {
            return Response.json({ success: false, message: 'Verification code has expired' }, { status: 400 });
        }

        user.isVerified = true;
        await user.save();
        return Response.json({ success: true, message: 'User verified successfully' }, { status: 200 });   

    } catch(error)
    {
        console.error('Error verifying code:', error);
        return Response.json(
            {
                success: false,
                message: 'Error checking verification code',
            },
            { status: 500 }
        );
    }
}
