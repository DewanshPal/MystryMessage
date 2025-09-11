import {Message} from '@/model/user.model'
export interface ApiResponse<T> {
  success:boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>; 
}
