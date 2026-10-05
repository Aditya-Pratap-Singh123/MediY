const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

// =====================================
// BOOK APPOINTMENT
// =====================================
const bookAppointment = async (req, res) => {
    try {
        // Only patients can book appointments
        if (req.user.role !== "patient") {
            return res.status(403).json({
                message: "Only patients can book appointments"
            });
        }

        const {
            doctorId,
            date,
            time,
            reason
        } = req.body;

        // Check required fields
        if (!doctorId || !date || !time) {
            return res.status(400).json({
                message: "Doctor, date and time are required"
            });
        }

        // Check patient exists
        const patient = await User.findById(req.user.id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        // Check doctor exists
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // =====================================
        // CHECK DOCTOR AVAILABILITY
        // =====================================

        const selectedDate = new Date(date);

        if (isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];

        const dayName = days[selectedDate.getDay()];

        // Find availability for selected day
        const availability = doctor.availability.find(
            (slot) =>
                slot.day.toLowerCase() === dayName.toLowerCase()
        );

        if (!availability) {
            return res.status(400).json({
                message: `Doctor is not available on ${dayName}`
            });
        }

        // Convert booking time into minutes
        const [bookingHour, bookingMinute] =
            time.split(":").map(Number);

        const bookingMinutes =
            bookingHour * 60 + bookingMinute;

        const [startHour, startMinute] =
            availability.startTime.split(":").map(Number);

        const [endHour, endMinute] =
            availability.endTime.split(":").map(Number);

        const startMinutes =
            startHour * 60 + startMinute;

        const endMinutes =
            endHour * 60 + endMinute;

        // Check if requested time is inside availability
        if (
            bookingMinutes < startMinutes ||
            bookingMinutes >= endMinutes
        ) {
            return res.status(400).json({
                message: `Doctor is available from ${availability.startTime} to ${availability.endTime}`
            });
        }

        // Check 30-minute slot
        if ((bookingMinutes - startMinutes) % 30 !== 0) {
            return res.status(400).json({
                message: "Please select a valid 30-minute slot"
            });
        }

        // =====================================
        // CHECK IF SLOT IS ALREADY BOOKED
        // =====================================

        const existingAppointment = await Appointment.findOne({
            doctorId,
            date,
            time,
            status: {
                $in: ["pending", "accepted"]
            }
        });

        if (existingAppointment) {
            return res.status(400).json({
                message: "This time slot is already booked"
            });
        }

        // =====================================
        // CREATE APPOINTMENT
        // =====================================

        const appointment = await Appointment.create({
            patientId: req.user.id,
            doctorId,
            date,
            time,
            reason: reason || "",
            status: "pending"
        });

        res.status(201).json({
            message: "Appointment booked successfully",
            appointment
        });

    } catch (error) {
        console.error("Book Appointment Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// GET PATIENT APPOINTMENTS
// =====================================
const getPatientAppointments = async (req, res) => {
    try {
        if (req.user.role !== "patient") {
            return res.status(403).json({
                message: "Only patients can access this"
            });
        }

        const appointments = await Appointment.find({
            patientId: req.user.id
        })
            .populate({
                path: "doctorId",
                populate: {
                    path: "userId",
                    select: "name email phone"
                }
            })
            .sort({
                date: 1,
                time: 1
            });

        res.status(200).json({
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error(
            "Get Patient Appointments Error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// GET DOCTOR APPOINTMENTS
// =====================================
const getDoctorAppointments = async (req, res) => {
    try {
        // Only doctors can access this
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                message: "Only doctors can access appointments"
            });
        }

        // Find doctor's profile
        const doctor = await Doctor.findOne({
            userId: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        // Find appointments for this doctor
        const appointments = await Appointment.find({
            doctorId: doctor._id
        })
            .populate(
                "patientId",
                "name email phone"
            )
            .sort({
                date: 1,
                time: 1
            });

        res.status(200).json({
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error(
            "Get Doctor Appointments Error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// UPDATE APPOINTMENT STATUS
// =====================================
const updateAppointmentStatus = async (req, res) => {
    try {
        // Only doctors can update appointment status
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                message: "Only doctors can update appointment status"
            });
        }

        const { appointmentId } = req.params;
        const { status } = req.body;

        // Allowed statuses
        if (
            !["accepted", "rejected", "completed"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        // Find doctor profile
        const doctor = await Doctor.findOne({
            userId: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        // Find appointment
        const appointment = await Appointment.findById(
            appointmentId
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Make sure appointment belongs to this doctor
        if (
            appointment.doctorId.toString() !==
            doctor._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only update your own appointments"
            });
        }

        // Update status
        appointment.status = status;

        await appointment.save();

        res.status(200).json({
            message: `Appointment ${status} successfully`,
            appointment
        });

    } catch (error) {
        console.error(
            "Update Appointment Status Error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// CANCEL APPOINTMENT
// =====================================
const cancelAppointment = async (req, res) => {
    try {
        // Only patients can cancel
        if (req.user.role !== "patient") {
            return res.status(403).json({
                message: "Only patients can cancel appointments"
            });
        }

        const { appointmentId } = req.params;

        // Find appointment
        const appointment = await Appointment.findById(
            appointmentId
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Make sure appointment belongs to this patient
        if (
            appointment.patientId.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                message: "You can only cancel your own appointments"
            });
        }

        // Cannot cancel completed/rejected/cancelled
        if (
            ["completed", "rejected", "cancelled"].includes(
                appointment.status
            )
        ) {
            return res.status(400).json({
                message: `Appointment is already ${appointment.status}`
            });
        }

        // Cancel appointment
        appointment.status = "cancelled";

        await appointment.save();

        res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment
        });

    } catch (error) {
        console.error(
            "Cancel Appointment Error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// GET AVAILABLE SLOTS
// =====================================
const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                message: "Doctor ID and date are required"
            });
        }

        // Find doctor
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        // Convert date to day name
        const selectedDate = new Date(date);

        if (isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];

        const dayName = days[selectedDate.getDay()];

        // Find doctor's availability
        const availability = doctor.availability.find(
            (slot) =>
                slot.day.toLowerCase() === dayName.toLowerCase()
        );

        if (!availability) {
            return res.status(200).json({
                date,
                day: dayName,
                availableSlots: []
            });
        }

        // Generate 30-minute slots
        const slots = [];

        const [startHour, startMinute] =
            availability.startTime.split(":").map(Number);

        const [endHour, endMinute] =
            availability.endTime.split(":").map(Number);

        let currentMinutes =
            startHour * 60 + startMinute;

        const endMinutes =
            endHour * 60 + endMinute;

        while (currentMinutes < endMinutes) {
            const hour = Math.floor(currentMinutes / 60);
            const minute = currentMinutes % 60;

            const time =
                `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

            slots.push(time);

            currentMinutes += 30;
        }

        // Find already booked slots
        const bookedAppointments = await Appointment.find({
            doctorId,
            date,
            status: {
                $in: ["pending", "accepted"]
            }
        }).select("time");

        const bookedTimes = bookedAppointments.map(
            (appointment) => appointment.time
        );

        // Remove booked slots
        const availableSlots = slots.filter(
            (slot) => !bookedTimes.includes(slot)
        );

        res.status(200).json({
            date,
            day: dayName,
            availableSlots
        });

    } catch (error) {
        console.error(
            "Get Available Slots Error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// EXPORTS
// =====================================
module.exports = {
    bookAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    getAvailableSlots
};