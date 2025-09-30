import mongoose , {Schema, Document} from 'mongoose';

export interface Message extends Document{
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content:{
        type:String,
        required:true
    },
    createdAt:
    {
        type:Date,
        required:true,
        default:Date.now
    }
})

export interface User extends Document{
    username:string;
    email:string;
    password:string;
    verifyCode:string;
    verifyCodeExpiry:Date;
    isVerified:boolean;
    isAcceptingMessage:boolean;
    googleSignIn:boolean;
    message:Message[]

}

const UserSchema: Schema<User> = new Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
        trim:true,
        unique:true
    },
    email:
    {
        type:String,
        required:[true,"Email is required"],
        //regex pattern for email address 
        match: [/.+\@.+\..+/, "please use a valid email address"]

    },
    password:
    {
        type:String,
        required: function () {
            return !this.googleSignIn; // only required if NOT Google
        },
        default: ""
    },
    verifyCode:
    {
        type:String,
        required: function () {
            return !this.googleSignIn; // only required if NOT Google
        },
        default: ""
    },
    verifyCodeExpiry:
    {
        type:Date,
        required: function () {
            return !this.googleSignIn; // only required if NOT Google
        },
    },
    isVerified:
    {
        type:Boolean,
        default:false
    },
    isAcceptingMessage:
    {
        type:Boolean,
        default:true
    },
    googleSignIn:
    {
        type: Boolean,
        default: false, // will be true if user registers via Google
    },
    message: [MessageSchema]

})

const UserModel = (mongoose.models.User) as mongoose.Model<User> || mongoose.model<User>("User",UserSchema)

export default UserModel