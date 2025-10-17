import mongoose, {Document, Schema} from 'mongoose'


export interface IOtp extends Document{
    identifier:string;
    otp:string;
    expiresAt:Date;
}


const otpSchema = new Schema({
   identifier:{type:String, required:true},
   otp:{type:String, required:true},
   expiresAt:{type:Date, required:true}
})

const Otp = mongoose.model<IOtp>("Otp", otpSchema);

export default Otp;