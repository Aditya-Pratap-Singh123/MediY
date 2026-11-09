
const express = require("express");

const {
    bookAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    getAvailableSlots,
    requestReschedule,
    respondToReschedule
} = require("../controllers/appointmentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET AVAILABLE SLOTS
router.get("/slots", getAvailableSlots);

// PATIENT BOOKS APPOINTMENT
router.post("/book", protect, bookAppointment);

// PATIENT APPOINTMENTS
router.get("/patient", protect, getPatientAppointments);

// DOCTOR APPOINTMENTS
router.get("/doctor", protect, getDoctorAppointments);

// DOCTOR ACCEPT / REJECT / COMPLETE
router.patch("/:appointmentId/status", protect, updateAppointmentStatus);

// PATIENT CANCELS APPOINTMENT
router.patch("/:appointmentId/cancel", protect, cancelAppointment);

// PATIENT REQUESTS RESCHEDULE
router.patch("/:appointmentId/reschedule", protect, requestReschedule);

// DOCTOR APPROVES / REJECTS RESCHEDULE
router.patch("/:appointmentId/reschedule/respond", protect, respondToReschedule);

module.exports = router;
