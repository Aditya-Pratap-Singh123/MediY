
const express = require("express");

const {
    createReview,
    getDoctorReviews,
    getPatientReviews
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Patient: Submit a review
router.post("/", protect, createReview);

// Doctor: Get reviews for a doctor (public)
router.get("/doctor/:doctorId", getDoctorReviews);

// Patient: Get their submitted reviews
router.get("/patient", protect, getPatientReviews);

module.exports = router;
