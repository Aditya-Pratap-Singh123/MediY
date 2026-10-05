import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function BookAppointment() {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [reason, setReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================
    // CHECK LOGIN
    // =====================================
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            navigate("/login", { replace: true });
            return;
        }

        try {
            const user = JSON.parse(userData);

            // Only patient can book appointment
            if (user.role !== "patient") {
                setError("Only patients can book appointments.");
                setLoading(false);
                return;
            }
        } catch (error) {
            console.error("User data error:", error);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login", { replace: true });
            return;
        }

        fetchDoctor();
    }, [doctorId]);

    // =====================================
    // GET DOCTOR
    // =====================================
    const fetchDoctor = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/doctors`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to fetch doctors"
                );
            }

            const selectedDoctor = data.doctors.find(
                (doc) => doc._id === doctorId
            );

            if (!selectedDoctor) {
                throw new Error("Doctor not found");
            }

            setDoctor(selectedDoctor);
        } catch (err) {
            console.error("Fetch Doctor Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // =====================================
    // GET DAY NAME
    // =====================================
    const getDayName = (date) => {
        if (!date) return "";

        const dateObject = new Date(`${date}T00:00:00`);

        return dateObject.toLocaleDateString("en-US", {
            weekday: "long",
        });
    };

    // =====================================
    // CHECK DOCTOR AVAILABILITY
    // =====================================
    const getAvailabilityForSelectedDate = () => {
        if (!doctor || !appointmentDate) {
            return null;
        }

        const selectedDay = getDayName(appointmentDate);

        const availability = doctor.availability?.find(
            (item) => item.day === selectedDay
        );

        return availability || null;
    };

    const availability =
        getAvailabilityForSelectedDate();

    // =====================================
    // DATE CHANGE
    // =====================================
    const handleDateChange = (e) => {
        const date = e.target.value;

        setAppointmentDate(date);
        setAppointmentTime("");
        setError("");
        setSuccess("");
    };

    // =====================================
    // BOOK APPOINTMENT
    // =====================================
    const handleBooking = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // ---------------------------------
        // GET FRESH AUTH DATA
        // ---------------------------------
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        // ---------------------------------
        // CHECK TOKEN
        // ---------------------------------
        if (!token || !userData) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login", { replace: true });
            return;
        }

        // ---------------------------------
        // CHECK USER
        // ---------------------------------
        let user;

        try {
            user = JSON.parse(userData);
        } catch (error) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login", { replace: true });
            return;
        }

        // ---------------------------------
        // ONLY PATIENT CAN BOOK
        // ---------------------------------
        if (user.role !== "patient") {
            setError(
                "Only patients can book appointments."
            );
            return;
        }

        // ---------------------------------
        // VALIDATION
        // ---------------------------------
        if (!appointmentDate) {
            setError(
                "Please select appointment date."
            );
            return;
        }

        if (!appointmentTime) {
            setError(
                "Please select appointment time."
            );
            return;
        }

        if (!reason.trim()) {
            setError(
                "Please enter reason for visit."
            );
            return;
        }

        // ---------------------------------
        // CHECK AVAILABILITY
        // ---------------------------------
        if (!availability) {
            setError(
                `Doctor is not available on ${getDayName(
                    appointmentDate
                )}`
            );
            return;
        }

        // ---------------------------------
        // CHECK TIME
        // ---------------------------------
        if (
            appointmentTime < availability.startTime ||
            appointmentTime > availability.endTime
        ) {
            setError(
                `Please select a time between ${availability.startTime} and ${availability.endTime}.`
            );
            return;
        }

        try {
            setBooking(true);

            // ---------------------------------
            // SEND REQUEST
            // ---------------------------------
            const response = await fetch(
                `${API_BASE_URL}/api/appointments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        doctorId: doctorId,
                        appointmentDate:
                            appointmentDate,
                        appointmentTime:
                            appointmentTime,
                        reason: reason.trim(),
                    }),
                }
            );

            const data = await response.json();

            // ---------------------------------
            // TOKEN EXPIRED / INVALID
            // ---------------------------------
            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login", {
                    replace: true,
                    state: {
                        message:
                            "Your session has expired. Please login again.",
                    },
                });

                return;
            }

            // ---------------------------------
            // OTHER ERROR
            // ---------------------------------
            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to book appointment"
                );
            }

            // ---------------------------------
            // SUCCESS
            // ---------------------------------
            setSuccess(
                "Appointment booked successfully!"
            );

            setAppointmentTime("");
            setReason("");

            setTimeout(() => {
                navigate("/patient/dashboard", {
                    replace: true,
                });
            }, 1500);
        } catch (err) {
            console.error(
                "Book Appointment Error:",
                err
            );

            setError(err.message);
        } finally {
            setBooking(false);
        }
    };

    // =====================================
    // LOGOUT
    // =====================================
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
            replace: true,
        });
    };

    // =====================================
    // TODAY
    // =====================================
    const today = new Date()
        .toISOString()
        .split("T")[0];

    // =====================================
    // LOADING
    // =====================================
    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#f8fafc",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                <h2>Loading doctor...</h2>
            </div>
        );
    }

    // =====================================
    // ERROR WITHOUT DOCTOR
    // =====================================
    if (!doctor) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    padding: "40px",
                    background: "#f8fafc",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                <div
                    style={{
                        maxWidth: "700px",
                        margin: "100px auto",
                        textAlign: "center",
                        background: "white",
                        padding: "40px",
                        borderRadius: "16px",
                        boxShadow:
                            "0 4px 15px rgba(0,0,0,0.08)",
                    }}
                >
                    <h2
                        style={{
                            color: "#dc2626",
                        }}
                    >
                        {error || "Doctor not found"}
                    </h2>

                    <button
                        onClick={() =>
                            navigate("/doctors")
                        }
                        style={{
                            marginTop: "20px",
                            padding: "12px 22px",
                            border: "none",
                            borderRadius: "8px",
                            background: "#2563eb",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "16px",
                        }}
                    >
                        ← Back to Doctors
                    </button>
                </div>
            </div>
        );
    }

    // =====================================
    // MAIN UI
    // =====================================
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f8fafc",
                padding: "40px 20px",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                }}
            >
                {/* TOP BUTTONS */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom: "25px",
                    }}
                >
                    <button
                        onClick={() =>
                            navigate(
                                `/doctor/${doctorId}`
                            )
                        }
                        style={{
                            border: "none",
                            background: "transparent",
                            color: "#2563eb",
                            cursor: "pointer",
                            fontSize: "16px",
                        }}
                    >
                        ← Back to Doctor
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            border: "none",
                            background: "#fee2e2",
                            color: "#dc2626",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                        }}
                    >
                        Logout
                    </button>
                </div>

                {/* HEADER */}

                <div
                    style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "15px",
                        boxShadow:
                            "0 4px 15px rgba(0,0,0,0.08)",
                        marginBottom: "25px",
                    }}
                >
                    <p
                        style={{
                            color: "#2563eb",
                            fontWeight: "600",
                            marginBottom: "8px",
                        }}
                    >
                        BOOK APPOINTMENT
                    </p>

                    <h1
                        style={{
                            margin: "0 0 10px",
                            fontSize: "32px",
                        }}
                    >
                        Schedule your appointment
                    </h1>

                    <p
                        style={{
                            color: "#64748b",
                            margin: 0,
                        }}
                    >
                        Select a date and time that
                        works for you.
                    </p>
                </div>

                {/* DOCTOR CARD */}

                <div
                    style={{
                        background: "white",
                        padding: "25px",
                        borderRadius: "15px",
                        boxShadow:
                            "0 4px 15px rgba(0,0,0,0.08)",
                        marginBottom: "25px",
                    }}
                >
                    <h2
                        style={{
                            marginTop: 0,
                        }}
                    >
                        Dr.{" "}
                        {doctor.userId?.name ||
                            "Doctor"}
                    </h2>

                    <p>
                        <strong>
                            Specialization:
                        </strong>{" "}
                        {doctor.specialization}
                    </p>

                    <p>
                        <strong>
                            Qualification:
                        </strong>{" "}
                        {doctor.qualification}
                    </p>

                    <p>
                        <strong>
                            Experience:
                        </strong>{" "}
                        {doctor.experience} years
                    </p>

                    <p>
                        <strong>
                            Consultation Fee:
                        </strong>{" "}
                        ₹{doctor.fees}
                    </p>
                </div>

                {/* BOOKING FORM */}

                <form
                    onSubmit={handleBooking}
                    style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "15px",
                        boxShadow:
                            "0 4px 15px rgba(0,0,0,0.08)",
                    }}
                >
                    {/* ERROR */}

                    {error && (
                        <div
                            style={{
                                background: "#fef2f2",
                                color: "#dc2626",
                                padding: "15px",
                                borderRadius: "8px",
                                marginBottom: "20px",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* SUCCESS */}

                    {success && (
                        <div
                            style={{
                                background: "#f0fdf4",
                                color: "#16a34a",
                                padding: "15px",
                                borderRadius: "8px",
                                marginBottom: "20px",
                            }}
                        >
                            {success}
                        </div>
                    )}

                    {/* DATE + TIME */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap: "20px",
                        }}
                    >
                        {/* DATE */}

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: "600",
                                    marginBottom: "8px",
                                }}
                            >
                                Appointment Date
                            </label>

                            <input
                                type="date"
                                value={
                                    appointmentDate
                                }
                                min={today}
                                onChange={
                                    handleDateChange
                                }
                                style={{
                                    width: "100%",
                                    boxSizing:
                                        "border-box",
                                    padding: "13px",
                                    border:
                                        "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                }}
                            />
                        </div>

                        {/* TIME */}

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: "600",
                                    marginBottom: "8px",
                                }}
                            >
                                Appointment Time
                            </label>

                            <input
                                type="time"
                                value={
                                    appointmentTime
                                }
                                onChange={(e) =>
                                    setAppointmentTime(
                                        e.target.value
                                    )
                                }
                                disabled={!availability}
                                min={
                                    availability?.startTime
                                }
                                max={
                                    availability?.endTime
                                }
                                style={{
                                    width: "100%",
                                    boxSizing:
                                        "border-box",
                                    padding: "13px",
                                    border:
                                        "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    background:
                                        !availability
                                            ? "#f1f5f9"
                                            : "white",
                                }}
                            />
                        </div>
                    </div>

                    {/* AVAILABILITY MESSAGE */}

                    {appointmentDate && (
                        <div
                            style={{
                                marginTop: "20px",
                                padding: "15px",
                                borderRadius: "8px",
                                background:
                                    availability
                                        ? "#eff6ff"
                                        : "#fef2f2",
                                color:
                                    availability
                                        ? "#2563eb"
                                        : "#dc2626",
                            }}
                        >
                            {availability ? (
                                <>
                                    Doctor is available
                                    from{" "}
                                    <strong>
                                        {
                                            availability.startTime
                                        }
                                    </strong>{" "}
                                    to{" "}
                                    <strong>
                                        {
                                            availability.endTime
                                        }
                                    </strong>
                                </>
                            ) : (
                                <>
                                    Doctor is not
                                    available on{" "}
                                    <strong>
                                        {getDayName(
                                            appointmentDate
                                        )}
                                    </strong>
                                </>
                            )}
                        </div>
                    )}

                    {/* REASON */}

                    <div
                        style={{
                            marginTop: "25px",
                        }}
                    >
                        <label
                            style={{
                                display: "block",
                                fontWeight: "600",
                                marginBottom: "8px",
                            }}
                        >
                            Reason for Visit
                        </label>

                        <textarea
                            value={reason}
                            onChange={(e) =>
                                setReason(
                                    e.target.value
                                )
                            }
                            placeholder="Describe your problem..."
                            rows="5"
                            style={{
                                width: "100%",
                                boxSizing:
                                    "border-box",
                                padding: "14px",
                                border:
                                    "1px solid #cbd5e1",
                                borderRadius: "8px",
                                fontSize: "16px",
                                resize: "vertical",
                            }}
                        />
                    </div>

                    {/* BUTTON */}

                    <button
                        type="submit"
                        disabled={
                            booking ||
                            !availability
                        }
                        style={{
                            marginTop: "25px",
                            padding: "14px 28px",
                            border: "none",
                            borderRadius: "8px",
                            background:
                                booking ||
                                !availability
                                    ? "#94a3b8"
                                    : "#2563eb",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor:
                                booking ||
                                !availability
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        {booking
                            ? "Booking..."
                            : "Book Appointment"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BookAppointment;