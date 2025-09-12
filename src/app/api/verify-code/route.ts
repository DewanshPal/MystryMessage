import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { verifySchema } from "@/schemas/verifySchema";

export async function POST(request: Request) {
    await dbConnect();

    try{
        const {code,email} = await request.json();
    }
}
