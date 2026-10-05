const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Doctor kis field ka hai
        specialization: {
            type: String,
            required: true,
            trim: true
        },

        // Doctor ki qualification
        qualification: {
            type: String,
            required: true,
            trim: true
        },

        // Experience in years
        experience: {
            type: Number,
            required: true,
            min: 0
        },

        // Consultation fees
        fees: {
            type: Number,
            required: true,
            min: 0
        },

        // Medical registration number
        registrationNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        // Hospital / Clinic
        hospitalName: {
            type: String,
            required: true,
            trim: true
        },

        // City
        city: {
            type: String,
            required: true,
            trim: true
        },

        // About doctor
        about: {
            type: String,
            default: "",
            trim: true
        },

        // Doctor availability
        availability: [
            {
                day: {
                    type: String,
                    enum: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday"
                    ]
                },

                startTime: {
                    type: String
                },

                endTime: {
                    type: String
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;