import {resend} from '@/lib/resend'
import VerificationEmail from '../../emailes/VerificationEmail'
import { ApiResponse } from '@/types/apiResponse'

export async function sendVerificationEmail(username: string, email: string, verifyCode: string): Promise<ApiResponse<null>> {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Mystry Message | Your Verification Code',
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    return {
      success: true,
      message: 'Verification email sent successfully.',
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      message: 'Failed to send verification email.',
    };
  }
}
