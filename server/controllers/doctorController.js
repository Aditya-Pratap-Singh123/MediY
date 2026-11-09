
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// =====================================
// CREATE DOCTOR PROFILE
// =====================================

const createDoctorProfile = async (req, res) => {
    try {
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

        const existingDoctor = await Doctor.findOne({
            userId: req.user.id
        });

        if (existingDoctor) {
            return res.status(400).json({
                message: "Doctor profile already exists"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const existingRegistration = await Doctor.findOne({
            registrationNumber: registrationNumber.trim()
        });

        if (existingRegistration) {
            return res.status(400).json({
                message: "Registration number already exists"
            });
        }

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
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                message: "Only doctors can access this profile"
            });
        }

        const doctor = await Doctor.findOne({
            userId: req.user.id
        }).populate("userId", "name email phone");

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        res.status(200).json({ doctor });

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

        if (specialization !== undefined) {
            doctor.specialization = specialization;
        }

        if (qualification !== undefined) {
            doctor.qualification = qualification;
        }

        if (experience !== undefined) {
            doctor.experience = experience;
        }

        if (fees !== undefined) {
            doctor.fees = fees;
        }

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

        if (hospitalName !== undefined) {
            doctor.hospitalName = hospitalName;
        }

        if (city !== undefined) {
            doctor.city = city;
        }

        if (about !== undefined) {
            doctor.about = about;
        }

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
// UPLOAD DOCTOR PROFILE PHOTO
// =====================================

const uploadDoctorPhoto = async (req, res) => {
    try {
        if (req.user.role !== "doctor") {
            return res.status(403).json({
                message: "Only doctors can upload profile photos"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please select an image"
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

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "mediy/doctor-profiles",
                    resource_type: "image"
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(req.file.buffer);
        });

        doctor.profileImage = result.secure_url;
        await doctor.save();

        res.status(200).json({
            message: "Profile photo uploaded successfully",
            profileImage: doctor.profileImage
        });

    } catch (error) {
        console.error("Doctor Photo Upload Error:", error);

        res.status(500).json({
            message: "Unable to upload profile photo"
        });
    }
};


// =====================================
// GET ALL DOCTORS / SEARCH DOCTORS
// =====================================

const getAllDoctors = async (req, res) => {
    try {
        const {
            search,
            specialization,
            city,
            maxFees,
            minExperience,
            day
        } = req.query;

        const filter = {};

        if (specialization?.trim()) {
            filter.specialization = {
                $regex: specialization.trim(),
                $options: "i"
            };
        }

        if (city?.trim()) {
            filter.city = {
                $regex: city.trim(),
                $options: "i"
            };
        }

        if (maxFees !== undefined && maxFees !== "") {
            const fees = Number(maxFees);

            if (!Number.isFinite(fees) || fees < 0) {
                return res.status(400).json({
                    message: "Invalid maximum fees"
                });
            }

            filter.fees = { $lte: fees };
        }

        if (minExperience !== undefined && minExperience !== "") {
            const experience = Number(minExperience);

            if (!Number.isFinite(experience) || experience < 0) {
                return res.status(400).json({
                    message: "Invalid minimum experience"
                });
            }

            filter.experience = { $gte: experience };
        }

        if (day?.trim()) {
            filter["availability.day"] = {
                $regex: `^${day.trim()}$`,
                $options: "i"
            };
        }

        let doctors = await Doctor.find(filter)
            .populate("userId", "name email phone")
            .select("-__v");

        if (search?.trim()) {
            const searchText = search.trim().toLowerCase();

            doctors = doctors.filter((doctor) =>
                doctor.userId?.name
                    ?.toLowerCase()
                    .includes(searchText)
            );
        }

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
            .populate("userId", "name email phone")
            .select("-__v");

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        res.status(200).json({ doctor });

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
    uploadDoctorPhoto,
    getAllDoctors,
    getDoctorById
};
