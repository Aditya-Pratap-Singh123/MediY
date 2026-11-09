
const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// CREATE REVIEW - Patient
const createReview = async (req, res) => {
    try {
        const { appointmentId, rating, comment } = req.body;

        if (!appointmentId || !rating) {
            return res.status(400).json({
                message: "Appointment ID and rating are required"
            });
        }

        if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        if (comment && comment.length > 1000) {
            return res.status(400).json({
                message: "Review cannot exceed 1000 characters"
            });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (appointment.patientId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only review your own appointments"
            });
        }

        if (appointment.status !== "completed") {
            return res.status(400).json({
                message: "You can review only completed appointments"
            });
        }

        const existingReview = await Review.findOne({ appointmentId });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this appointment"
            });
        }

        const review = await Review.create({
            appointmentId,
            patientId: req.user.id,
            doctorId: appointment.doctorId,
            rating: Number(rating),
            comment: comment || ""
        });

        res.status(201).json({
            message: "Review submitted successfully",
            review
        });

    } catch (error) {
        console.error("Create Review Error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "You have already reviewed this appointment"
            });
        }

        res.status(500).json({
            message: "Server error while submitting review"
        });
    }
};


// GET REVIEWS FOR A DOCTOR
const getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        const reviews = await Review.find({ doctorId })
            .populate("patientId", "name")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;

        const averageRating = totalReviews
            ? (
                reviews.reduce(
                    (total, review) => total + review.rating,
                    0
                ) / totalReviews
            ).toFixed(1)
            : 0;

        res.status(200).json({
            averageRating: Number(averageRating),
            totalReviews,
            reviews
        });

    } catch (error) {
        console.error("Get Doctor Reviews Error:", error);

        res.status(500).json({
            message: "Server error while fetching reviews"
        });
    }
};


// GET REVIEWS WRITTEN BY A PATIENT
const getPatientReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            patientId: req.user.id
        })
            .populate("doctorId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            totalReviews: reviews.length,
            reviews
        });

    } catch (error) {
        console.error("Get Patient Reviews Error:", error);

        res.status(500).json({
            message: "Server error while fetching patient reviews"
        });
    }
};


module.exports = {
    createReview,
    getDoctorReviews,
    getPatientReviews
};
