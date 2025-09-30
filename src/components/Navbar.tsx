"use client"
import React from 'react'
import Link from 'next/link'
import { useSession , signOut} from 'next-auth/react'
import {User} from 'next-auth';


const Navbar=() => {
    const {data:session} = useSession();
    console.log(session);
    const user:User = session?.user;    
    
  return (
    <nav className='bg-gray-800 p-4 text-white flex justify-between'>
        <div className='text-lg font-bold'>
            <Link href='/'>Mystry Message</Link>
        </div>
        <div>
            {session ? (
                <div className='flex items-center space-x-4'>
                    <span>Welcome, {user?.email}</span>
                    <button 
                        onClick={() => signOut()}
                        className='bg-red-500 px-3 py-1 rounded hover:bg-red-600 cursor-pointer'
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <div className='space-x-4'>
                    <Link href='/sign-in' className='bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 cursor-pointer'>Sign In</Link>
                    <Link href='/sign-up' className='bg-green-500 px-3 py-1 rounded hover:bg-green-600 cursor-pointer'>Register</Link>
                </div>
            )}
        </div>
    </nav>

  )
}

export default Navbar