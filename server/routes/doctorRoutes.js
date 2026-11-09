
const express = require("express");

const {
    createDoctorProfile,
    getDoctorProfile,
    updateDoctorProfile,
    uploadDoctorPhoto,
    getAllDoctors,
    getDoctorById
} = require("../controllers/doctorController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// =====================================
// PUBLIC - GET ALL DOCTORS
// =====================================

router.get(
    "/",
    getAllDoctors
);


// =====================================
// PROTECTED - UPLOAD DOCTOR PHOTO
// =====================================

router.put(
    "/profile/photo",
    protect,
    upload.single("profileImage"),
    uploadDoctorPhoto
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


// =====================================
// PUBLIC - GET SINGLE DOCTOR
// =====================================

router.get(
    "/:id",
    getDoctorById
);


module.exports = router;
