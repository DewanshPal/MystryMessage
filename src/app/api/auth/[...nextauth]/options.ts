import {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/user.model';
import bcrypt from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';
import crypto from 'crypto';

export const authOptions : NextAuthOptions = {
    providers:[
        GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
        CredentialsProvider({
            id:'credentials',
            name:'Credentials',
            credentials:{
                username:{label:'Username',type:'text'},
                password:{label:'Password',type:'password'}
            },
            async authorize(credentials:any): Promise<any> {
                await dbConnect();
                try{
                   const user = await UserModel.findOne({
                        $or:[
                            {email:credentials.identifier},
                            {username:credentials.identifier}
                        ]
                    })

                    if(!user)
                    {
                        throw new Error('No user found with the given email or username');
                    }
                    if (user.password === "12345678" && user.googleSignIn) {
                        throw new Error('Please log in with Google and set a password first.');
                    }
                    if(!user.isVerified)
                    {
                        throw new Error('Please verify your account before login');
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password,user.password)
                    if(isPasswordValid)
                    {
                        return user;
                    }
                    else{
                        throw new Error('Invalid password');
                    }
                } catch(err:any)
                {
                    throw new Error(err);
                }
            }
        })
    ],
    callbacks:{
        async signIn({ user , account }) {
        if (account?.provider === 'google'){
            await dbConnect();

        const existingUser = await UserModel.findOne({ email: user.email });

        if (!existingUser) {
            const formattedUsername = user.name?.replace(/\s+/g, '').toLowerCase();
            await UserModel.create({
            email: user.email,
            password: "12345678", // No password for Google sign-in users
            verifyCode: crypto.randomBytes(16).toString("hex"), // No verification code needed
            verifyCodeExpiry: new Date(), // No expiry needed
            username: formattedUsername,
            isVerified: true, // Google is trusted
            googleSignIn: true
            });
        } else if (!existingUser.googleSignIn) {
            existingUser.googleSignIn = true;
            existingUser.isVerified = true; // Google users have verified emails
            await existingUser.save();
      }
    }

        return true;
    },
        async jwt({token,user,account}){
            if(user)
            {
                // For Google OAuth users, we need to fetch the user from database
                if (account?.provider === 'google') {
                    await dbConnect();
                    const dbUser = await UserModel.findOne({ email: user.email });
                    if (dbUser) {
                        token._id = dbUser._id?.toString();
                        token.username = dbUser.username;
                        token.isVerified = dbUser.isVerified;
                        token.isAcceptingMessage = dbUser.isAcceptingMessage;
                    }
                } else {
                    // For credentials login, user object already has database fields
                    token._id=user._id?.toString();
                    token.username=user?.username;
                    token.isVerified=user?.isVerified;
                    token.isAcceptingMessage=user?.isAcceptingMessage;
                }
            }
            return token;
        },
        async session({session,token})
        {
            if(token)
            {
                session.user.id=token._id as string;
                session.user.username=token.username as string;
                session.user.isVerified=token.isVerified as boolean;
                session.user.isAcceptingMessage=token.isAcceptingMessage as boolean;
            }
            return session;
        }
    },
    pages:{
        signIn:'/sign-in',
    },
    session:{
        strategy:'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,

}