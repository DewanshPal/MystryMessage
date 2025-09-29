import UserModel from '@/model/user.model';
import dbConnect from '@/lib/dbConnect';
import { Message } from '@/model/user.model';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, content } = await request.json();
        
        // Validate input

        if (!username || !content) {
            return Response.json({ success: false, message: 'Username and message are required' }, { status: 400 });
        }

        const user = await UserModel.findOne({ username });
        if (!user) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return Response.json({ success: false, message: 'User is not verified' }, { status: 403 });
        }

        // Check if user is accepting messages
        if (!user.isAcceptingMessage) {
            return Response.json({ success: false, message: 'User is not accepting messages' }, { status: 403 });
        }

        const newMessage = {
            content: content,
            createdAt: new Date()
        };
        
        user.message.push(newMessage as Message);
        await user.save();
        
        return Response.json({ success: true, message: 'Message sent successfully' }, { status: 200 });
    } catch (error) {
        console.log('Error sending message:', error);
        return Response.json({ success: false, message: 'Error sending message' }, { status: 500 });
    }
}

