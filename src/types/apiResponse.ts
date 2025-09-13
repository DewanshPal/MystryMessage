import {Message} from '@/model/user.model'
export interface ApiResponse<T> {
  success:boolean;
  message: string;
  isAcceptingMessage?: boolean;
  messages?: Array<Message>; 
}
