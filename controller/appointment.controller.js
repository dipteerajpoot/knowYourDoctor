import { Appointment } from "../model/appointment.model.js";
import { User } from "../model/user.model.js";
// PATIENT: Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const { name, email, doctorId, apmtDate, apmtTime, apmtDay, meetingReason } = req.body;
    const { patientId } = req.user;
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const isAvailable = doctor.doctorInfo.availability.some(slot => {
      const slotday = slot.day.toLowerCase();
      const slotFrom = changeToMinut(slot.from);
      const slotTo = changeToMinut(slot.to);
      const reqstedDay = apmtDay.toLowerCase();
      const requestedTime = changeToMinut(apmtTime);

      return (slotday === reqstedDay && requestedTime >= slotFrom && requestedTime < slotTo);
    });

    if (!isAvailable) {
      return res.status(400).json({ error: "Doctor is not available at the selected time" });
    }

    const BookedAllready = await Appointment.findOne({ doctorId, apmtTime, apmtDay, apmtDate })

    if (BookedAllready)
      return res.status(400).json({ error: "Already booked in this time slot" });

    const appointment = new Appointment({
      name,
      email,
      doctorId,
      patientId,
      apmtDate,
      apmtTime,
      apmtDate,
      meetingReason
    });

    await appointment.save();
    return res.status(201).json({ message: "Appointment request sent", appointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const changeToMinut = (time) => {
  const [hr, min] = time.split(":").map(Number);
  return hr * 60 + min;
};


/// PATIENT: Update Appointment (Only if pending)

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, apmtDate, apmtTime, apmtDay, meetingReason } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (appointment.patientId.toString() !== req.user.patientId)
      return res.status(403).json({ message: "Unauthorized User" });

    if (appointment.status !== "pending")
      return res.status(400).json({ message: "Only pending appointments can be updated" });

    const doctor = await appointment.findById(doctor);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const isAvailable = doctor.doctorInfo.availability.some(slot => {
      const slotday = slot.

        return(slot.day = apmtDay && apmtTime >= slot.from >= apmtTime && slot.to <= apmtDate);
    });

    if (!isAvailable) {
      return res.status(400).json({ error: "Doctor is not available at the selected time" });
    }

    const BookedAllready = await Appointment.findOne({ doctorId, apmtTime, apmtDay, apmtDate })

    if (BookedAllready)
      return res.status(400).json({ error: "Already booked in this time slot" });

    appointment.name = name;
    appointment.email = email;
    appointment.apmtDate = apmtDate;
    appointment.apmtTime = apmtTime;
    appointment.apmtDay = apmtDay;
    appointment.meetingReason = meetingReason;
    await appointment.save();
    res.status(200).json({ message: "Appointment updated", appointment });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// PATIENT & Doctor : Cancel Appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });

    if (appointment.patientId.toString() !== req.user.patientId)
      return res.status(403).json({ error: "Unauthorized User" });

    appointment.status = "cancelled";
    await appointment.save();
    res.status(200).json({ message: "Appointment cancelled" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// 
// COMMON: View Appointments (role based) 
// 
export const viewAppointments = async (req, res) => {
  try {
    const { role } = req.user;
    const filter = role === "doctor" ? { doctorId: req.user.doctorId } : { patientId: req.user.patientId };

    const appointments = await Appointment.find(filter)
      .populate(role === "doctor" ? "patientId" : "doctorId", "name email");

    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found" });
    }

    res.status(200).json({ message: "Appointments", appointments });
  } catch (error) {
    console.error(error);
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
      return res.status(403).json({ error: "Unauthorized Docture" });

    if (appointment.status !== "pending")
      return res.status(400).json({ error: "Only pending appointments can be updated" });

    appointment.status = status;
    await appointment.save();

    return res.status(200).json({ message: "Appointment Confirmed", appointment });
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

    appointment.status = "completed";
    await appointment.save();

    return res.status(200).json({ message: "Appointment marked as completed", appointment });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// ADMIN or SYSTEM: Hard Delete Appointment

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    return res.status(200).json({ message: "Appointment deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
