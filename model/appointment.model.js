import mongoose from "mongoose" ;
const appointmentSchema = new  mongoose.Schema({
          patientId:
          {
            type:mongoose.Schema.Types.ObjectId,
            ref:"patient"
          },
          doctorId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
          },
          name:{
            type:String,
            required:true
          },
          email:{
            type:String,
            required:true,
            
          },
          status:{
            type:String,
            enum : ["pending", "confirm", "completed", "reject", "cancelled"],
            default : "pending"         
          },
          meetingReason :{
            type : String
          },
        
          createdDate :{
            type:Date,
            default:Date.now
          },

          apmtDate :{
            type : Date,
            required : true
          },
          apmtTime :{
            type : String,
            required : true
          },
          apmtDay:{
            type:String,
            required:true
          },
          mobile:{
            type:String,
          }
})

export const Appointment = mongoose.model("appointment",appointmentSchema);