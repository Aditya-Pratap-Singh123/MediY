
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

// =====================================
// HELPER: VALIDATE DATE
// TIMEZONE-SAFE DATE VALIDATION
// =====================================
const validateDate = (date) => {
    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        return {
            valid: false,
            message: "Invalid date format. Use YYYY-MM-DD"
        };
    }

    const [year, month, day] = date.split("-").map(Number);

    if (year < 1000 || year > 9999 || month < 1 || month > 12) {
        return {
            valid: false,
            message: "Invalid date"
        };
    }

    const daysInMonth = new Date(
        Date.UTC(year, month, 0)
    ).getUTCDate();

    if (day < 1 || day > daysInMonth) {
        return {
            valid: false,
            message: "Invalid date"
        };
    }

    const selectedDate = new Date(
        Date.UTC(year, month - 1, day)
    );

    return {
        valid: true,
        selectedDate
    };
};


// =====================================
// HELPER: VALIDATE DATE AND TIME SLOT
// =====================================
const validateDoctorSlot = async (
    doctorId,
    date,
    time,
    excludeId = null
) => {
    // Validate date
    const dateValidation = validateDate(date);

    if (!dateValidation.valid) {
        return dateValidation;
    }

    const selectedDate = dateValidation.selectedDate;

    // Validate time
    if (
        typeof time !== "string" ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)
    ) {
        return {
            valid: false,
            message: "Invalid time format. Use HH:MM"
        };
    }

    // Find doctor
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        return {
            valid: false,
            message: "Doctor not found"
        };
    }

    // Get day name using UTC
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const dayName = days[selectedDate.getUTCDay()];

    // Check doctor's availability
    const availability = doctor.availability.find(
        slot =>
            slot.day.toLowerCase() === dayName.toLowerCase()
    );

    if (!availability) {
        return {
            valid: false,
            message: `Doctor is not available on ${dayName}`
        };
    }

    // Convert booking time into minutes
    const [hour, minute] = time.split(":").map(Number);

    const bookingMinutes = hour * 60 + minute;

    const [startHour, startMinute] =
        availability.startTime.split(":").map(Number);

    const [endHour, endMinute] =
        availability.endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Check availability time range
    if (
        bookingMinutes < startMinutes ||
        bookingMinutes >= endMinutes
    ) {
        return {
            valid: false,
            message: `Doctor is available from ${availability.startTime} to ${availability.endTime}`
        };
    }

    // Check 30-minute slot
    if ((bookingMinutes - startMinutes) % 30 !== 0) {
        return {
            valid: false,
            message: "Please select a valid 30-minute slot"
        };
    }

    // Check existing appointment
    const conflictQuery = {
        doctorId,
        date,
        time,
        status: {
            $in: ["pending", "accepted"]
        }
    };

    if (excludeId) {
        conflictQuery._id = {
            $ne: excludeId
        };
    }

    const existingAppointment = await Appointment.findOne(
        conflictQuery
    );

    if (existingAppointment) {
        return {
            valid: false,
            message: "This time slot is already booked"
        };
    }

    return {
        valid: true
    };
};


// =====================================
// BOOK APPOINTMENT
// =====================================
const bookAppointment = async (req, res) => {
    try {
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

        if (!doctorId || !date || !time) {
            return res.status(400).json({
                message: "Doctor, date and time are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                message: "Invalid doctor ID"
            });
        }

        const patient = await User.findById(req.user.id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const validation = await validateDoctorSlot(
            doctorId,
            date,
            time
        );

        if (!validation.valid) {
            return res.status(400).json({
                message: validation.message
            });
        }

        const appointment = await Appointment.create({
            patientId: req.user.id,
            doctorId,
            date,
            time,
            reason: reason || "",
            status: "pending"
        });

        return res.status(201).json({
            message: "Appointment booked successfully",
            appointment
        });

    } catch (error) {
        console.error("Book Appointment Error:", error);

        return res.status(500).json({
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

        return res.status(200).json({
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error("Get Patient Appointments Error:", error);

        return res.status(500).json({
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
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                message: "Only doctors can access appointments"
            });
        }

        const doctor = await Doctor.findOne({
            userId: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        const appointments = await Appointment.find({
            doctorId: doctor._id
        })
            .populate("patientId", "name email phone")
            .sort({
                date: 1,
                time: 1
            });

        return res.status(200).json({
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error("Get Doctor Appointments Error:", error);

        return res.status(500).json({
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
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                message: "Only doctors can update appointment status"
            });
        }

        const {
            appointmentId
        } = req.params;

        const {
            status
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID"
            });
        }

        if (
            !["accepted", "rejected", "completed"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const doctor = await Doctor.findOne({
            userId: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        const appointment = await Appointment.findById(
            appointmentId
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (
            appointment.doctorId.toString() !==
            doctor._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only update your own appointments"
            });
        }

        if (
            status === "accepted" &&
            appointment.status !== "pending"
        ) {
            return res.status(400).json({
                message: "Only pending appointments can be accepted"
            });
        }

        if (
            status === "rejected" &&
            appointment.status !== "pending"
        ) {
            return res.status(400).json({
                message: "Only pending appointments can be rejected"
            });
        }

        if (
            status === "completed" &&
            appointment.status !== "accepted"
        ) {
            return res.status(400).json({
                message: "Only accepted appointments can be completed"
            });
        }

        appointment.status = status;

        await appointment.save();

        return res.status(200).json({
            message: `Appointment ${status} successfully`,
            appointment
        });

    } catch (error) {
        console.error("Update Appointment Status Error:", error);

        return res.status(500).json({
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
        if (req.user.role !== "patient") {
            return res.status(403).json({
                message: "Only patients can cancel appointments"
            });
        }

        const {
            appointmentId
        } = req.params;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID"
            });
        }

        const appointment = await Appointment.findById(
            appointmentId
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (
            appointment.patientId.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                message: "You can only cancel your own appointments"
            });
        }

        if (
            ["completed", "rejected", "cancelled"].includes(
                appointment.status
            )
        ) {
            return res.status(400).json({
                message: `Appointment is already ${appointment.status}`
            });
        }

        appointment.status = "cancelled";
        appointment.rescheduleRequest = undefined;

        await appointment.save();

        return res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment
        });

    } catch (error) {
        console.error("Cancel Appointment Error:", error);

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// PATIENT REQUESTS RESCHEDULE
// =====================================
const requestReschedule = async (req, res) => {
    try {
        if (req.user.role !== "patient") {
            return res.status(403).json({
                message: "Only patients can request rescheduling"
            });
        }

        const {
            appointmentId
        } = req.params;

        const {
            date,
            time
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID"
            });
        }

        if (!date || !time) {
            return res.status(400).json({
                message: "New date and time are required"
            });
        }

        const appointment = await Appointment.findById(
            appointmentId
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (
            appointment.patientId.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                message: "You can only reschedule your own appointments"
            });
        }

        if (
            !["pending", "accepted"].includes(appointment.status)
        ) {
            return res.status(400).json({
                message: "This appointment cannot be rescheduled"
            });
        }

        if (
            appointment.rescheduleRequest?.status === "pending"
        ) {
            return res.status(400).json({
                message: "A reschedule request is already pending"
            });
        }

        if (
            date === appointment.date &&
            time === appointment.time
        ) {
            return res.status(400).json({
                message: "Please select a different date or time"
            });
        }

        const validation = await validateDoctorSlot(
            appointment.doctorId,
            date,
            time,
            appointment._id
        );

        if (!validation.valid) {
            return res.status(400).json({
                message: validation.message
            });
        }

        appointment.rescheduleRequest = {
            date,
            time,
            status: "pending",
            requestedAt: new Date()
        };

        await appointment.save();

        return res.status(200).json({
            message: "Reschedule request sent to doctor",
            appointment
        });

    } catch (error) {
        console.error("Request Reschedule Error:", error);

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// DOCTOR RESPONDS TO RESCHEDULE REQUEST
// =====================================
const respondToReschedule = async (req, res) => {
    try {
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                message: "Only doctors can respond to reschedule requests"
            });
        }

        const {
            appointmentId
        } = req.params;

        const {
            action
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID"
            });
        }

        if (!["approve", "reject"].includes(action)) {
            return res.status(400).json({
                message: "Action must be approve or reject"
            });
        }

        const doctor = await Doctor.findOne({
            userId: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        const appointment = await Appointment.findById(
            appointmentId
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (
            appointment.doctorId.toString() !==
            doctor._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only manage your own appointments"
            });
        }

        if (
            appointment.rescheduleRequest?.status !== "pending"
        ) {
            return res.status(400).json({
                message: "No pending reschedule request found"
            });
        }

        if (
            !["pending", "accepted"].includes(appointment.status)
        ) {
            return res.status(400).json({
                message: "This appointment cannot be rescheduled"
            });
        }

        if (action === "approve") {
            const {
                date,
                time
            } = appointment.rescheduleRequest;

            const validation = await validateDoctorSlot(
                appointment.doctorId,
                date,
                time,
                appointment._id
            );

            if (!validation.valid) {
                return res.status(400).json({
                    message: validation.message
                });
            }

            appointment.date = date;
            appointment.time = time;

            appointment.rescheduleRequest.status = "approved";

        } else {
            appointment.rescheduleRequest.status = "rejected";
        }

        await appointment.save();

        return res.status(200).json({
            message: action === "approve"
                ? "Reschedule request approved"
                : "Reschedule request rejected",
            appointment
        });

    } catch (error) {
        console.error("Respond To Reschedule Error:", error);

        return res.status(500).json({
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
        const {
            doctorId,
            date
        } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                message: "Doctor ID and date are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                message: "Invalid doctor ID"
            });
        }

        // Validate date
        const dateValidation = validateDate(date);

        if (!dateValidation.valid) {
            return res.status(400).json({
                message: dateValidation.message
            });
        }

        const selectedDate = dateValidation.selectedDate;

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
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

        const dayName = days[selectedDate.getUTCDay()];

        const availability = doctor.availability.find(
            slot =>
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

        let currentMinutes = startHour * 60 + startMinute;

        const endMinutes = endHour * 60 + endMinute;

        while (currentMinutes < endMinutes) {
            const hour = Math.floor(currentMinutes / 60);
            const minute = currentMinutes % 60;

            const time =
                `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

            slots.push(time);

            currentMinutes += 30;
        }

        // Find booked appointments
        const bookedAppointments = await Appointment.find({
            doctorId,
            date,
            status: {
                $in: ["pending", "accepted"]
            }
        }).select("time");

        const bookedTimes = bookedAppointments.map(
            appointment => appointment.time
        );

        // Remove booked slots
        const availableSlots = slots.filter(
            slot => !bookedTimes.includes(slot)
        );

        return res.status(200).json({
            date,
            day: dayName,
            availableSlots
        });

    } catch (error) {
        console.error("Get Available Slots Error:", error);

        return res.status(500).json({
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
    getAvailableSlots,
    requestReschedule,
    respondToReschedule
};
