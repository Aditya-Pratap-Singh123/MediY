const Doctor = require("../models/Doctor");
const User = require("../models/User");

// =====================================
// CREATE DOCTOR PROFILE
// =====================================

const createDoctorProfile = async (req, res) => {
    try {
        // Only doctors can create profile
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                message: "Only doctors can create a doctor profile"
            });
        }

        const {
            specialization,
            qualification,
            experience,
            fees,
            registrationNumber,
            hospitalName,
            city,
            about,
            availability
        } = req.body;

        // Required fields
        if (
            !specialization ||
            !qualification ||
            experience === undefined ||
            fees === undefined ||
            !registrationNumber ||
            !hospitalName ||
            !city
        ) {
            return res.status(400).json({
                message:
                    "Specialization, qualification, experience, fees, registration number, hospital name and city are required"
            });
        }

        // Check existing profile
        const existingDoctor = await Doctor.findOne({
            userId: req.user.id
        });

        if (existingDoctor) {
            return res.status(400).json({
                message: "Doctor profile already exists"
            });
        }

        // Check user exists
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check registration number already exists
        const existingRegistration = await Doctor.findOne({
            registrationNumber: registrationNumber.trim()
        });

        if (existingRegistration) {
            return res.status(400).json({
                message: "Registration number already exists"
            });
        }

        // Create profile
        const doctor = await Doctor.create({
            userId: req.user.id,
            specialization,
            qualification,
            experience,
            fees,
            registrationNumber: registrationNumber.trim(),
            hospitalName,
            city,
            about: about || "",
            availability: availability || []
        });

        res.status(201).json({
            message: "Doctor profile created successfully",
            doctor
        });

    } catch (error) {
        console.error("Create Doctor Profile Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// GET LOGGED-IN DOCTOR PROFILE
// =====================================

const getDoctorProfile = async (req, res) => {
    try {
        // Only doctors
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                message: "Only doctors can access this profile"
            });
        }

        const doctor = await Doctor.findOne({
            userId: req.user.id
        }).populate(
            "userId",
            "name email phone"
        );

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        res.status(200).json({
            doctor
        });

    } catch (error) {
        console.error("Get Doctor Profile Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// UPDATE DOCTOR PROFILE
// =====================================

const updateDoctorProfile = async (req, res) => {
    try {
        // Only doctors
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                message: "Only doctors can update doctor profile"
            });
        }

        const {
            specialization,
            qualification,
            experience,
            fees,
            registrationNumber,
            hospitalName,
            city,
            about,
            availability
        } = req.body;

        const doctor = await Doctor.findOne({
            userId: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        // Update specialization
        if (specialization !== undefined) {
            doctor.specialization = specialization;
        }

        // Update qualification
        if (qualification !== undefined) {
            doctor.qualification = qualification;
        }

        // Update experience
        if (experience !== undefined) {
            doctor.experience = experience;
        }

        // Update fees
        if (fees !== undefined) {
            doctor.fees = fees;
        }

        // Update registration number
        if (registrationNumber !== undefined) {

            const existingRegistration = await Doctor.findOne({
                registrationNumber: registrationNumber.trim(),
                _id: { $ne: doctor._id }
            });

            if (existingRegistration) {
                return res.status(400).json({
                    message: "Registration number already exists"
                });
            }

            doctor.registrationNumber = registrationNumber.trim();
        }

        // Update hospital
        if (hospitalName !== undefined) {
            doctor.hospitalName = hospitalName;
        }

        // Update city
        if (city !== undefined) {
            doctor.city = city;
        }

        // Update about
        if (about !== undefined) {
            doctor.about = about;
        }

        // Update availability
        if (availability !== undefined) {
            doctor.availability = availability;
        }

        await doctor.save();

        res.status(200).json({
            message: "Doctor profile updated successfully",
            doctor
        });

    } catch (error) {
        console.error("Update Doctor Profile Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// GET ALL DOCTORS / SEARCH DOCTORS
// =====================================

const getAllDoctors = async (req, res) => {
    try {
        const {
            specialization,
            city
        } = req.query;

        let filter = {};

        // Search by specialization
        if (specialization) {
            filter.specialization = {
                $regex: specialization,
                $options: "i"
            };
        }

        // Search by city
        if (city) {
            filter.city = {
                $regex: city,
                $options: "i"
            };
        }

        const doctors = await Doctor.find(filter)
            .populate(
                "userId",
                "name email phone"
            )
            .select("-__v");

        res.status(200).json({
            count: doctors.length,
            doctors
        });

    } catch (error) {
        console.error("Get Doctors Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// =====================================
// GET SINGLE DOCTOR BY ID
// =====================================

const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findById(id)
            .populate(
                "userId",
                "name email phone"
            )
            .select("-__v");

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        res.status(200).json({
            doctor
        });

    } catch (error) {
        console.error("Get Doctor By ID Error:", error);

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
    createDoctorProfile,
    getDoctorProfile,
    updateDoctorProfile,
    getAllDoctors,
    getDoctorById
};