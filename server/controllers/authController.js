const User = require("../models/User");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// REGISTER USER
// ===============================

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            role,

            // Doctor details
            specialization,
            qualification,
            experience,
            fees,
            about,
            availability,
            city,
            hospitalName,
            registrationNumber
        } = req.body;

        // ===============================
        // CHECK REQUIRED USER FIELDS
        // ===============================

        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !role
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // ===============================
        // CHECK VALID ROLE
        // ===============================

        if (!["patient", "doctor"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role. Role must be patient or doctor."
            });
        }

        // ===============================
        // CHECK EXISTING USER
        // ===============================

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // ===============================
        // DOCTOR VALIDATION
        // ===============================

        if (role === "doctor") {

            if (!specialization || !specialization.trim()) {
                return res.status(400).json({
                    message: "Specialization is required"
                });
            }

            if (!qualification || !qualification.trim()) {
                return res.status(400).json({
                    message: "Qualification is required"
                });
            }

            if (
                experience === undefined ||
                experience === null ||
                experience === "" ||
                Number(experience) < 0
            ) {
                return res.status(400).json({
                    message: "Valid experience is required"
                });
            }

            if (
                fees === undefined ||
                fees === null ||
                fees === "" ||
                Number(fees) < 0
            ) {
                return res.status(400).json({
                    message: "Valid consultation fee is required"
                });
            }

            if (!about || !about.trim()) {
                return res.status(400).json({
                    message: "About information is required"
                });
            }

            if (!availability || availability.length === 0) {
                return res.status(400).json({
                    message: "At least one availability is required"
                });
            }

            // ===============================
            // NEW DOCTOR REQUIRED FIELDS
            // ===============================

            if (!city || !city.trim()) {
                return res.status(400).json({
                    message: "City is required"
                });
            }

            if (!hospitalName || !hospitalName.trim()) {
                return res.status(400).json({
                    message: "Hospital name is required"
                });
            }

            if (!registrationNumber || !registrationNumber.trim()) {
                return res.status(400).json({
                    message: "Registration number is required"
                });
            }
        }

        // ===============================
        // HASH PASSWORD
        // ===============================

        const hashedPassword = await bcrypt.hash(password, 10);

        // ===============================
        // CREATE USER
        // ===============================

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            role
        });

        // ===============================
        // CREATE DOCTOR PROFILE
        // ===============================

        if (role === "doctor") {
            try {

                await Doctor.create({
                    userId: user._id,

                    specialization,
                    qualification,
                    experience: Number(experience),
                    fees: Number(fees),
                    about,
                    availability,

                    // New fields
                    city,
                    hospitalName,
                    registrationNumber
                });

            } catch (doctorError) {

                // If Doctor creation fails,
                // remove the already-created User
                await User.findByIdAndDelete(user._id);

                throw doctorError;
            }
        }

        // ===============================
        // RESPONSE
        // ===============================

        res.status(201).json({
            message: "User registered successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {

        console.error("Register Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ===============================
// LOGIN USER
// ===============================

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Response
        res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {

        console.error("Login Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ===============================
// GET LOGGED-IN USER PROFILE
// ===============================

const getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {

        console.error("Profile Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ===============================
// EXPORT
// ===============================

module.exports = {
    registerUser,
    loginUser,
    getProfile
};