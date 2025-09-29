"use client"
import React from 'react'
import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'
import axios , { AxiosError }   from 'axios'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import {useState} from 'react'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { signInSchema } from '@/schemas/signInSchema'
import { signIn } from 'next-auth/react'


function page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  //zod implementation
  const register = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues:{
      identifier: '',
      password: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
   const result= await signIn('credentials',{
      identifier : data.identifier,
      password : data.password,
      redirect : false
    })
    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast.error('Invalid username or password');
      } else {
        toast.error(result.error);
      }
    }
    if(result?.url)
    {
      router.replace("/dashboard");
    }
  };


  return (
     <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign in to start your anonymous adventure</p>
        </div>
        <Form {...register}>
          <form onSubmit={register.handleSubmit(onSubmit)} className="space-y-6">
           
            <FormField
              name="identifier"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="identifier" />
                  <p className='text-muted text-sm'>We will send you a verification code</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className='w-full' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Not a member?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default page