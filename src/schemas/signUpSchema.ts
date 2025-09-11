import {z} from 'zod'

export const usernameValidation = z.
string()
.min(2,"Username must be atleast 2 characters")
.max(20,"Usernam e must be no more than 20 characters")
.regex(/^[a-zA-Z0-9_]+$/,"Username must not contain special character")

export const signUpSchema = z.object(
    {
        username: usernameValidation,
        email: z.email({message:"Invalid Email address"}),
        password: z.string().min(6,{message:"password must be at least 6 characters"})
    }
)