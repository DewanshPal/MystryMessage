import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from "@/helper/sendVerification";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json();

        // Check if the user already exists
        const existingUserVerifiedByAnswer = await UserModel.findOne({ username , isVerified: true });

        if (existingUserVerifiedByAnswer) {
            return Response.json({ success: false, message: 'Username or Email already exists' }, { status: 400 });
        }

        //
        const existingUserByEmail = await UserModel.findOne({ email});

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserByEmail)
        {
            if(existingUserByEmail.isVerified)
            {
                return Response.json({ success: false, message: 'Username or Email already exists' }, { status: 400 });
            }
            else
            {
                // Update the existing unverified user's details
                const hashedPassword=await bcrypt.hash(password, 10);
                const expiryDate = new Date()
                expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry time to 1 hour from now

                existingUserByEmail.username = username;
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = expiryDate;

                await existingUserByEmail.save();

            }
        }
        else{
            const hashedPassword=await bcrypt.hash(password, 10);
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry time to 1 hour from now
            // Create a new user
            const newUser= new UserModel({
                    username,
                    email,
                    password: hashedPassword,
                    verifyCode: verifyCode,
                    verifyCodeExpiry: expiryDate,
                    isVerified: false,
                    isAcceptingMessage: true,
                    message: []
            });

            await newUser.save();
        }

            //send Verification Email
            const emailResponse=await sendVerificationEmail(username, email, verifyCode);

            if(!emailResponse.success)
            {
                return Response.json({ success: false, message: emailResponse.message }, { status: 500 });
            }
            else
            {
                return Response.json({ success: true, message: 'User registered successfully. Verification email sent.' }, { status: 201 });
            }
        } catch (error) {
        console.log('Error in signup route:', error);
        return Response.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}