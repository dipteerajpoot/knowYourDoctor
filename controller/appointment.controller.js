import { Appointment } from "../model/appointment.model.js";
import { User } from "../model/user.model.js";
// PATIENT: Create Appointment

const getDayFromDate = (dateString) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const date = new Date(dateString);
  return days[date.getDay()];
};
export const createAppointment = async (req, res) => {
  try {
    const { name, email, mobile, doctorId, apmtDate, apmtTime, meetingReason } = req.body;
    console.log("createApt executed");
    const { patientId } = req.user;
    // Find doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ error: "Doctor not found" });
    }
    // Check if doctor is available on the selected date and time
    const isAvailable = doctor.doctorInfo.availability.some(slot => {      
      const requestedDate = apmtDate; // YYYY-MM-DD
      const slotDate = new Date(slot.date).toISOString().split("T")[0];
      if (requestedDate !== slotDate) return false;
      const requestedTime = changeToMinut(apmtTime);
      console.log("error",apmtDate,apmtTime,doctor.doctorInfo.availability);
      return requestedTime >= changeToMinut(slot.from) && requestedTime < changeToMinut(slot.to);
    }); 
    if (!isAvailable) {      
      return res.status(400).json({ error: "Doctor is not available at the selected date/time" });
    } 
    // Check if already booked by another patient in the same slot
    const alreadyBooked = await Appointment.findOne({
      doctorId,
      apmtDate,
      apmtTime
    });
    if (alreadyBooked) {
      return res.status(400).json({ error: "Doctor  is already booked on this time" });
    }
    // Create new appointment
    const apmtDay = getDayFromDate(apmtDate);
    const appointment = new Appointment({
      name,
      email,
      mobile,
      doctorId,
      patientId,
      apmtDate,
      apmtTime,
      apmtDay,
      meetingReason
    });
    await appointment.save();
    return res.status(201).json({ message: "Appointment request sent", appointment });
  } catch (error) {                             
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
// Convert DD-MM-YYYY to YYYY-MM-DD
// function normalizeDate(dateStr) {
//   if (!dateStr) return null;
//   const parts = dateStr.split("-");
//   if (parts.length === 3) {
//     const [dd, mm, yyyy] = parts;
//     return `${yyyy}-${mm}-${dd}`;  // YYYY-MM-DD
//   }
//   return dateStr; // agar already YYYY-MM-DD hai
// }


const changeToMinut = (time) => {
  const [hr, min] = time.split(":").map(Number);
  return hr * 60 + min;
};
                                                  

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, apmtDate, apmtTime, meetingReason } = req.body;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    // Ensure only the patient who booked can update
    if (appointment.patientId.toString() !== req.user.patientId) {
      return res.status(403).json({ message: "Unauthorized User" });
    }
    // Only pending appointments can be updated
    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be updated" });
    }
    // Get doctor info
    const doctor = await User.findById(appointment.doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ error: "Doctor not found" });
    }
    // Check if doctor is available on the selected date and time
    const isAvailable = doctor.doctorInfo.availability.some(slot => {
      const requestedDate = new Date(apmtDate).toISOString().split("T")[0];
      const slotDate = new Date(slot.date).toISOString().split("T")[0];
      if (requestedDate !== slotDate) return false;
      const requestedTime = changeToMinut(apmtTime);
      const fromTime = changeToMinut(slot.from);
      const toTime = changeToMinut(slot.to);
      if (fromTime < toTime) {
        return requestedTime >= fromTime && requestedTime < toTime;
      }
      return requestedTime >= fromTime || requestedTime < toTime;
    });

    if (!isAvailable) {
      return res.status(400).json({ error: "Doctor is not available at the selected date/time" });
    }

    // Check if same slot already booked (excluding current appointment)
    const alreadyBooked = await Appointment.findOne({
      doctorId: appointment.doctorId,
      apmtDate,
      apmtTime,
      _id: { $ne: appointment._id } // exclude current appointment
    });

    if (alreadyBooked) {
      return res.status(400).json({ error: "This slot is already booked" });
    }

    // Update fields
    const apmtDay = getDayFromDate(apmtDate);
    appointment.name = name;
    appointment.email = email;
    appointment.apmtDate = apmtDate;
    appointment.apmtTime = apmtTime;
    appointment.apmtDay = apmtDay;
    appointment.meetingReason = meetingReason;

    await appointment.save();

    return res.status(200).json({ message: "Appointment updated", appointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// PATIENT & Doctor : Cancel Appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (!cancelReason || cancelReason.trim() === "") {
      return res.status(400).json({ error: "Cancel reason is required" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ error: "Appointment already cancelled" });
    }
    if (appointment.status === "completed") {
      return res.status(400).json({ error: "Completed appointments cannot be cancelled" });
    }

    const { role, doctorId, patientId } = req.user;

    if (role === "doctor") {
      if (appointment.doctorId.toString() !== doctorId) {
        return res.status(403).json({ error: "Unauthorized doctor" });
      }
      appointment.status = "cancelled";
      appointment.cancelReason = cancelReason;
      appointment.cancelledBy = "doctor";
      await appointment.save();
      return res.status(200).json({ message: "Appointment cancelled by doctor", appointment });
    }

    if (role === "patient") {
      if (appointment.patientId.toString() !== patientId) {
        return res.status(403).json({ error: "Unauthorized patient" });
      }

      const now = new Date();
      const apmtDateTime = new Date(`${appointment.apmtDate.toISOString().split("T")[0]}T${appointment.apmtTime}`);
      const diffHours = (apmtDateTime - now) / (1000 * 60 * 60);

      if (appointment.status === "pending" || diffHours >= 12) {
        appointment.status = "cancelled";
        appointment.cancelReason = cancelReason;
        appointment.cancelledBy = "patient";
        await appointment.save();
        return res.status(200).json({ message: "Appointment cancelled by patient", appointment });
      }

      return res.status(400).json({ error: "Cannot cancel confirmed appointment within 12 hours" });
    }

    return res.status(403).json({ error: "Unauthorized role" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getAppointmentsByStatus = async (req, res) => {
  try {
    const { role, doctorId, patientId } = req.user;
    const { status, sort = "asc" } = req.query; // optional query params: status & sort

    // Validate status
    const validStatuses = ["pending", "confirm", "completed", "reject", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Build filter
    const filter = {};
    if (role === "doctor") filter.doctorId = doctorId;
    if (role === "patient") filter.patientId = patientId;
    if (status) filter.status = status;

    // Fetch and sort appointments
    const appointments = await Appointment.find(filter)
      .populate(role === "doctor" ? "patientId" : "doctorId", "name email")
      .sort({ apmtDate: sort === "asc" ? 1 : -1, apmtTime: sort === "asc" ? 1 : -1 });

    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found" });
    }

    return res.status(200).json({ message: "Appointments fetched", appointments });
  } catch (error) {
    console.error("Error fetching appointments by status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};





// COMMON: View Appointments (role based) 

export const viewAppointments = async (req, res) => {
  try {
    const { role, doctorId, patientId } = req.user;
    const filter = role === "doctor" ? { doctorId } : { patientId };

    const appointments = await Appointment.find(filter)
      .populate(role === "doctor" ? "patientId" : "doctorId", "name email")
      .sort({ apmtDate: 1, apmtTime: 1 });

    res.status(200).json({ message: "Appointments retrieved", appointments });
  } catch (error) {
    console.error("View appointments error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// 
// DOCTOR: Confirm or Reject Appointment
// 
export const confirmAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["confirm", "reject"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });

    if (appointment.doctorId.toString() !== req.user.doctorId)
      return res.status(403).json({ error: "Unauthorized Doctor" });

    if (appointment.status !== "pending")
      return res.status(400).json({ error: "Only pending appointments can be updated" });

    appointment.status = status;
    await appointment.save();

    // Optional: populate patient info
    await appointment.populate("patientId", "name email");

    return res.status(200).json({
      message: `Appointment ${status === "confirm" ? "confirmed" : "rejected"}`,
      appointment
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



// DOCTOR: Mark Appointment as Completed

export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (appointment.doctorId.toString() !== req.user.doctorId)
      return res.status(403).json({ message: "Unauthorized" });

    // Restriction: cannot complete cancelled or rejected appointments
    if (["cancelled", "reject"].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot complete an appointment that is ${appointment.status}` });
    }

    if (appointment.status === "completed")
      return res.status(400).json({ message: "Appointment is already completed" });

    appointment.status = "completed";
    await appointment.save();

    await appointment.populate("patientId", "name email");

    return res.status(200).json({ message: "Appointment marked as completed", appointment });
  } catch (error) {
    console.error("Complete appointment error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



// ADMIN or SYSTEM: Hard Delete Appointment

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, doctorId, patientId } = req.user;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    // Restrict deletion based on role
    if (role === "doctor" && appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ error: "Unauthorized doctor" });
    }
    if (role === "patient" && appointment.patientId.toString() !== patientId) {
      return res.status(403).json({ error: "Unauthorized patient" });
    }

    // Optional: prevent deletion if already completed or cancelled
    if (["completed", "cancelled"].includes(appointment.status)) {
      return res.status(400).json({ error: `Cannot delete an appointment that is ${appointment.status}` });
    }

    await Appointment.findByIdAndDelete(id);

    return res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

