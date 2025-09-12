import {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/user.model';
import bcrypt from 'bcryptjs';
import { is } from 'zod/locales';

export const authOptions : NextAuthOptions = {
    providers:[
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
                            {email:credentials.identifier.email},
                            {username:credentials.identifier.username}
                        ]
                    })

                    if(!user)
                    {
                        throw new Error('No user found with the given email or username');
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
        async jwt({token,user}){
            if(user)
            {
                token._id=user._id?.toString();
                token.username=user?.username;
                token.isVerified=user?.isVerified;
                token.isAcceptingMessage=user?.isAcceptingMessage;
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