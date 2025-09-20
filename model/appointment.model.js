import mongoose from "mongoose";
const appointmentSchema = new mongoose.Schema({
  patientId:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,

  },
  status: {
    type: String,
    enum: ["pending", "confirm", "completed", "reject", "cancelled"],
    default: "pending"
  },
  meetingReason: {
    type: String
  },

  createdDate: {
    type: Date,
    default: Date.now
  },

  apmtDate: {
    type: Date,
    required: true

  },

  apmtTime: {
    type: String,
    required: true,
    // unique:true,
  },
  apmtDay: { type: String },
  cancelReason: {
    type: String,
    default: ""
  },
  mobile: {
    type: String,
  },
  cancelledBy: {
    type: String,
    enum: ["doctor", "patient", ""],
    default: ""
  }
})

export const Appointment = mongoose.model("appointment", appointmentSchema);