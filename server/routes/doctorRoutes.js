const express = require("express");

const {
    createDoctorProfile,
    getDoctorProfile,
    updateDoctorProfile,
    getAllDoctors,
    getDoctorById
} = require("../controllers/doctorController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================
// PUBLIC - GET ALL DOCTORS
// =====================================

router.get(
    "/",
    getAllDoctors
);


// =====================================
// PUBLIC - GET SINGLE DOCTOR
// =====================================

router.get(
    "/:id",
    getDoctorById
);


// =====================================
// PROTECTED - CREATE DOCTOR PROFILE
// =====================================

router.post(
    "/profile",
    protect,
    createDoctorProfile
);


// =====================================
// PROTECTED - GET LOGGED-IN DOCTOR PROFILE
// =====================================

router.get(
    "/profile",
    protect,
    getDoctorProfile
);


// =====================================
// PROTECTED - UPDATE DOCTOR PROFILE
// =====================================

router.put(
    "/profile",
    protect,
    updateDoctorProfile
);


module.exports = router;