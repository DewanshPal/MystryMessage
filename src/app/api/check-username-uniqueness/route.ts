import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import {z} from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({
    username : usernameValidation
})

export async function GET(request: Request) {

    await dbConnect();

    try {
         const {searchParams} = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username')
        }
        // Validate the username using Zod schema
        const result = usernameQuerySchema.safeParse(queryParams);

        if(!result.success) {
            const tree = z.treeifyError(result.error);
            const usernameError = tree.properties?.username?.errors || [];
            return Response.json({ success: false, message: usernameError?.length>0 ? usernameError.join(", ") : "Invalid username" }, { status: 400 });
        }

        const {username} = result.data;
        const existingUser = await UserModel.findOne({username,isVerified:true})

        if(existingUser) {
            return Response.json({ success: false, message: "Username is already taken" }, { status: 400 });
        }

            
    } catch (error) {
        console.error('Error checking username uniqueness:', error);
         return Response.json(
        {
            success: false,
            message: 'Error checking username',
        },
        { status: 500 }
        );
    }
}
