
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        date: {
            type: String,
            required: true
        },

        time: {
            type: String,
            required: true
        },

        reason: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "cancelled",
                "completed"
            ],
            default: "pending"
        },

        // Patient's reschedule request
        rescheduleRequest: {
            date: {
                type: String
            },
            time: {
                type: String
            },
            status: {
                type: String,
                enum: ["pending", "approved", "rejected"]
            },
            requestedAt: {
                type: Date
            }
        }
    },
    {
        timestamps: true
    }
);

const Appointment = mongoose.model(
    "Appointment",
    appointmentSchema
);

module.exports = Appointment;
