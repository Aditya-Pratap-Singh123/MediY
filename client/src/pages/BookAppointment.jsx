
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_BASE_URL = "https://mediy-1.onrender.com";

function BookAppointment() {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [doctor, setDoctor] = useState(null);
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [reason, setReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // REDIRECT TO LOGIN
    const goToLogin = () => {
        navigate("/login", {
            replace: true,
            state: { from: location.pathname }
        });
    };

    // CHECK LOGIN AND FETCH DOCTOR
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            goToLogin();
            return;
        }

        try {
            const user = JSON.parse(userData);

            if (user.role !== "patient") {
                setError("Only patients can book appointments.");
                setLoading(false);
                return;
            }
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            goToLogin();
            return;
        }

        fetchDoctor();
    }, [doctorId]);

    // SAFE API RESPONSE
    const readResponse = async (response) => {
        const text = await response.text();

        try {
            return text ? JSON.parse(text) : {};
        } catch {
            throw new Error(
                `Invalid server response. HTTP ${response.status}`
            );
        }
    };

    // FETCH DOCTOR
    const fetchDoctor = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_BASE_URL}/api/doctors`);
            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to fetch doctors"
                );
            }

            const selectedDoctor = data.doctors?.find(
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

    // GET DAY NAME
    const getDayName = (date) => {
        if (!date) return "";

        const [year, month, day] = date.split("-").map(Number);
        const dateObject = new Date(year, month - 1, day);

        return [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ][dateObject.getDay()];
    };

    // GET LOCAL TODAY DATE
    const getLocalToday = () => {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    // CHECK AVAILABILITY
    const availability = doctor && appointmentDate
        ? doctor.availability?.find(
            (item) =>
                item.day.toLowerCase() ===
                getDayName(appointmentDate).toLowerCase()
        )
        : null;

    // DATE CHANGE
    const handleDateChange = (e) => {
        setAppointmentDate(e.target.value);
        setAppointmentTime("");
        setError("");
        setSuccess("");
    };

    // BOOK APPOINTMENT
    const handleBooking = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            goToLogin();
            return;
        }

        let user;

        try {
            user = JSON.parse(userData);
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            goToLogin();
            return;
        }

        if (user.role !== "patient") {
            setError("Only patients can book appointments.");
            return;
        }

        if (!appointmentDate) {
            setError("Please select appointment date.");
            return;
        }

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (!datePattern.test(appointmentDate)) {
            setError("Invalid date format. Please select a valid date.");
            return;
        }

        const [year, month, day] = appointmentDate.split("-").map(Number);
        const selectedDate = new Date(year, month - 1, day);

        if (
            selectedDate.getFullYear() !== year ||
            selectedDate.getMonth() !== month - 1 ||
            selectedDate.getDate() !== day
        ) {
            setError("Please select a valid calendar date.");
            return;
        }

        if (appointmentDate < getLocalToday()) {
            setError("Past dates cannot be selected.");
            return;
        }

        if (!appointmentTime) {
            setError("Please select appointment time.");
            return;
        }

        if (!reason.trim()) {
            setError("Please enter reason for visit.");
            return;
        }

        if (!availability) {
            setError(
                `Doctor is not available on ${getDayName(appointmentDate)}`
            );
            return;
        }

        // TIME VALIDATION
        if (
            appointmentTime < availability.startTime ||
            appointmentTime >= availability.endTime
        ) {
            setError(
                `Doctor is available from ${availability.startTime} to ${availability.endTime}.`
            );
            return;
        }

        const [hour, minute] = appointmentTime.split(":").map(Number);

        const [startHour, startMinute] =
            availability.startTime.split(":").map(Number);

        const selectedMinutes = hour * 60 + minute;
        const startMinutes = startHour * 60 + startMinute;

        if ((selectedMinutes - startMinutes) % 30 !== 0) {
            setError("Please select a valid 30-minute time slot.");
            return;
        }

        try {
            setBooking(true);

            const bookingData = {
                doctorId: String(doctorId),
                date: appointmentDate,
                time: appointmentTime,
                reason: reason.trim()
            };

            const response = await fetch(
                `${API_BASE_URL}/api/appointments/book`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(bookingData)
                }
            );

            const data = await readResponse(response);

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                goToLogin();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to book appointment"
                );
            }

            setSuccess(
                data.message || "Appointment booked successfully!"
            );

            setAppointmentTime("");
            setReason("");

            setTimeout(() => {
                navigate("/patient/dashboard", {
                    replace: true
                });
            }, 1500);

        } catch (err) {
            console.error("Book Appointment Error:", err);
            setError(err.message);
        } finally {
            setBooking(false);
        }
    };

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    // LOADING SCREEN
    if (loading) {
        return (
            <div className="booking-center">
                <div className="booking-loader"></div>
                <h3>Loading doctor details...</h3>
            </div>
        );
    }

    // DOCTOR NOT FOUND
    if (!doctor) {
        return (
            <div className="booking-center">
                <div className="booking-error-card">
                    <div className="booking-error-icon">!</div>

                    <h2>{error || "Doctor not found"}</h2>

                    <p>
                        We couldn't load the requested doctor's profile.
                    </p>

                    <button
                        onClick={() => navigate("/doctors")}
                        className="booking-primary-button"
                    >
                        Back to Doctors
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="booking-container">

                {/* TOP NAVIGATION */}
                <div className="booking-topbar">
                    <button
                        onClick={() => navigate(`/doctor/${doctorId}`)}
                        className="booking-back-button"
                    >
                        <span>←</span>
                        Back to Doctor
                    </button>

                    <div className="booking-brand">
                        <span className="booking-brand-icon">✚</span>
                        MediY
                    </div>

                    <button
                        onClick={handleLogout}
                        className="booking-logout-button"
                    >
                        Logout
                    </button>
                </div>

                {/* PAGE HEADING */}
                <div className="booking-heading">
                    <div className="booking-heading-badge">
                        ✦ APPOINTMENT BOOKING
                    </div>

                    <h1>
                        Your Health,{" "}
                        <span>Our Priority.</span>
                    </h1>

                    <p>
                        Book your consultation in just a few simple steps.
                        Your journey towards better health starts here.
                    </p>
                </div>

                {/* MAIN CONTENT */}
                <div className="booking-main-grid">

                    {/* DOCTOR CARD */}
                    <div className="booking-doctor-card">

                        <div className="booking-doctor-top">
                            <div className="booking-doctor-image-wrapper">
                                {doctor.profileImage ? (
                                    <img
                                        src={doctor.profileImage}
                                        alt="Doctor"
                                        className="booking-doctor-image"
                                    />
                                ) : (
                                    <div className="booking-doctor-fallback">
                                        ✚
                                    </div>
                                )}

                                <span className="booking-verified-badge">
                                    ✓
                                </span>
                            </div>

                            <div className="booking-doctor-status">
                                <span></span>
                                Available for consultation
                            </div>

                            <h2>
                                Dr. {doctor.userId?.name || "Doctor"}
                            </h2>

                            <p>{doctor.specialization}</p>
                        </div>

                        <div className="booking-doctor-details">

                            <div className="booking-detail-item">
                                <div className="booking-detail-icon">🎓</div>

                                <div>
                                    <span className="booking-detail-label">
                                        Qualification
                                    </span>

                                    <strong className="booking-detail-value">
                                        {doctor.qualification || "Not specified"}
                                    </strong>
                                </div>
                            </div>

                            <div className="booking-detail-item">
                                <div className="booking-detail-icon">⌛</div>

                                <div>
                                    <span className="booking-detail-label">
                                        Experience
                                    </span>

                                    <strong className="booking-detail-value">
                                        {doctor.experience} Years
                                    </strong>
                                </div>
                            </div>

                            <div className="booking-detail-item">
                                <div className="booking-detail-icon">₹</div>

                                <div>
                                    <span className="booking-detail-label">
                                        Consultation Fee
                                    </span>

                                    <strong className="booking-fee-value">
                                        ₹{doctor.fees}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="booking-doctor-note">
                            <span className="booking-note-icon">🛡️</span>

                            <div>
                                <strong className="booking-note-title">
                                    Trusted Healthcare
                                </strong>

                                <p>
                                    Your appointment details are handled securely.
                                </p>
                            </div>
                        </div>

                        <div className="booking-doctor-footer">
                            ✦ Your health matters to us.
                        </div>
                    </div>

                    {/* BOOKING FORM */}
                    <div className="booking-form-card">

                        <div className="booking-form-header">
                            <div>
                                <span className="booking-form-eyebrow">
                                    BOOK YOUR VISIT
                                </span>

                                <h2>Schedule Appointment</h2>

                                <p>
                                    Fill in the details below to confirm your visit.
                                </p>
                            </div>

                            <div className="booking-calendar-icon">
                                ▦
                            </div>
                        </div>

                        {/* STEPS */}
                        <div className="booking-steps">
                            <div className="booking-step-active">
                                <span>1</span>
                                Date & Time
                            </div>

                            <div className="booking-step-line"></div>

                            <div className="booking-step-inactive">
                                <span>2</span>
                                Confirmation
                            </div>
                        </div>

                        <form onSubmit={handleBooking}>

                            {error && (
                                <div className="booking-message booking-error">
                                    <span>⚠</span>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="booking-message booking-success">
                                    <span>✓</span>
                                    {success}
                                </div>
                            )}

                            {/* APPOINTMENT DATE */}
                            <div className="booking-form-group">
                                <label>
                                    <span>▦</span>
                                    Select Appointment Date
                                </label>

                                <input
                                    type="date"
                                    value={appointmentDate}
                                    min={getLocalToday()}
                                    onChange={handleDateChange}
                                    required
                                />

                                <small>
                                    Choose your preferred consultation date.
                                </small>
                            </div>

                            {/* AVAILABILITY */}
                            {appointmentDate && (
                                <div
                                    className={`booking-availability ${
                                        availability
                                            ? "booking-available"
                                            : "booking-unavailable"
                                    }`}
                                >
                                    <span className="booking-availability-icon">
                                        {availability ? "✓" : "!"}
                                    </span>

                                    <div>
                                        {availability ? (
                                            <>
                                                <strong>
                                                    Doctor is available
                                                </strong>

                                                <p>
                                                    {getDayName(appointmentDate)}
                                                    {" · "}
                                                    {availability.startTime}
                                                    {" to "}
                                                    {availability.endTime}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <strong>
                                                    Not available on this day
                                                </strong>

                                                <p>
                                                    Doctor is not available on{" "}
                                                    {getDayName(appointmentDate)}.
                                                    Please choose another date.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* APPOINTMENT TIME */}
                            <div className="booking-form-group">
                                <label>
                                    <span>◷</span>
                                    Select Appointment Time
                                </label>

                                <input
                                    type="time"
                                    value={appointmentTime}
                                    onChange={(e) => {
                                        setAppointmentTime(e.target.value);
                                        setError("");
                                        setSuccess("");
                                    }}
                                    disabled={!availability}
                                    min={availability?.startTime}
                                    max={availability?.endTime}
                                    required
                                />

                                <small>
                                    Appointments are scheduled in 30-minute intervals.
                                </small>
                            </div>

                            {/* REASON */}
                            <div className="booking-form-group">
                                <label>
                                    <span>✎</span>
                                    Reason for Visit
                                </label>

                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Briefly describe your symptoms or reason for consultation..."
                                    rows="4"
                                    required
                                />

                                <small>
                                    This helps the doctor understand your concern.
                                </small>
                            </div>

                            {/* BOOKING SUMMARY */}
                            <div className="booking-summary">
                                <div>
                                    <span>Consultation Fee</span>
                                    <strong>₹{doctor.fees}</strong>
                                </div>

                                <span className="booking-summary-tag">
                                    Secure Booking
                                </span>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={booking || !availability}
                                className="booking-submit-button"
                            >
                                {booking ? (
                                    <>
                                        <span className="booking-button-spinner"></span>
                                        Booking Appointment...
                                    </>
                                ) : (
                                    <>
                                        Confirm Appointment
                                        <span>→</span>
                                    </>
                                )}
                            </button>

                            <p className="booking-secure-text">
                                🔒 Your information is protected and secure.
                            </p>
                        </form>
                    </div>
                </div>

                <footer className="booking-footer">
                    © {new Date().getFullYear()} MediY Healthcare.
                    Made with care for your health.
                </footer>
            </div>

            {/* RESPONSIVE CSS */}
            <style>{`
                .booking-page,
                .booking-page * {
                    box-sizing: border-box;
                }

                .booking-page {
                    min-height: 100vh;
                    padding: 30px 20px;
                    background: linear-gradient(135deg, #f0f7ff, #f8fbff 50%, #eef5ff);
                    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
                    color: #172554;
                }

                .booking-container {
                    max-width: 1180px;
                    margin: 0 auto;
                }

                .booking-topbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 45px;
                }

                .booking-brand {
                    font-size: 25px;
                    font-weight: 800;
                    color: #173b83;
                    letter-spacing: -1px;
                }

                .booking-brand-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    border-radius: 9px;
                    background: #2563eb;
                    color: white;
                    font-size: 20px;
                    margin-right: 8px;
                }

                .booking-back-button,
                .booking-logout-button {
                    border: none;
                    padding: 11px 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 700;
                    transition: 0.2s;
                }

                .booking-back-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    color: #2563eb;
                    box-shadow: 0 3px 12px rgba(15, 23, 42, 0.05);
                }

                .booking-logout-button {
                    background: #fff1f2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }

                .booking-back-button:hover,
                .booking-logout-button:hover {
                    transform: translateY(-2px);
                }

                .booking-heading {
                    text-align: center;
                    margin-bottom: 38px;
                }

                .booking-heading-badge {
                    display: inline-block;
                    background: #dbeafe;
                    color: #1d4ed8;
                    border-radius: 30px;
                    padding: 8px 16px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    margin-bottom: 16px;
                }

                .booking-heading h1 {
                    font-size: clamp(28px, 5vw, 43px);
                    font-weight: 850;
                    letter-spacing: -1.8px;
                    margin: 0 0 12px;
                    color: #142c59;
                }

                .booking-heading h1 span {
                    color: #2563eb;
                }

                .booking-heading > p {
                    color: #64748b;
                    font-size: 15px;
                    line-height: 1.7;
                    max-width: 570px;
                    margin: 0 auto;
                }

                .booking-main-grid {
                    display: grid;
                    grid-template-columns: 0.85fr 1.4fr;
                    gap: 25px;
                    align-items: start;
                }

                .booking-doctor-card,
                .booking-form-card {
                    background: white;
                    border-radius: 22px;
                    overflow: hidden;
                    box-shadow: 0 15px 45px rgba(30, 64, 175, 0.09);
                    border: 1px solid #e5edff;
                }

                .booking-doctor-top {
                    background: linear-gradient(145deg, #173b83, #2563eb);
                    padding: 35px 25px 30px;
                    text-align: center;
                    color: white;
                }

                .booking-doctor-image-wrapper {
                    width: 125px;
                    height: 125px;
                    margin: 0 auto 18px;
                    position: relative;
                    border-radius: 50%;
                    padding: 5px;
                    background: rgba(255,255,255,0.25);
                    border: 2px solid rgba(255,255,255,0.65);
                }

                .booking-doctor-image,
                .booking-doctor-fallback {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                    background: white;
                }

                .booking-doctor-fallback {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #2563eb;
                    font-size: 45px;
                }

                .booking-verified-badge {
                    position: absolute;
                    right: -3px;
                    bottom: 5px;
                    width: 27px;
                    height: 27px;
                    border-radius: 50%;
                    background: #10b981;
                    color: white;
                    border: 3px solid white;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .booking-doctor-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    background: rgba(255,255,255,0.15);
                    padding: 7px 12px;
                    border-radius: 30px;
                    font-size: 11px;
                    font-weight: 700;
                    margin-bottom: 15px;
                }

                .booking-doctor-status span {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #4ade80;
                }

                .booking-doctor-top h2 {
                    font-size: 23px;
                    margin: 0 0 7px;
                    font-weight: 800;
                }

                .booking-doctor-top p {
                    color: #dbeafe;
                    font-size: 14px;
                    margin: 0;
                }

                .booking-doctor-details {
                    padding: 12px 25px;
                }

                .booking-detail-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 17px 0;
                    border-bottom: 1px solid #edf2fa;
                }

                .booking-detail-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    background: #eff6ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 19px;
                    flex-shrink: 0;
                }

                .booking-detail-label {
                    display: block;
                    color: #94a3b8;
                    font-size: 11px;
                    margin-bottom: 5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                }

                .booking-detail-value {
                    display: block;
                    font-size: 14px;
                    color: #1e293b;
                    font-weight: 700;
                }

                .booking-fee-value {
                    display: block;
                    font-size: 19px;
                    color: #2563eb;
                    font-weight: 800;
                }

                .booking-doctor-note {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    margin: 5px 20px 20px;
                    padding: 15px;
                    background: #f0f7ff;
                    border-radius: 13px;
                }

                .booking-note-icon {
                    font-size: 22px;
                }

                .booking-note-title {
                    display: block;
                    color: #1e40af;
                    font-size: 13px;
                    margin-bottom: 4px;
                }

                .booking-doctor-note p {
                    color: #64748b;
                    font-size: 11px;
                    line-height: 1.5;
                    margin: 0;
                }

                .booking-doctor-footer {
                    background: #f8fafc;
                    padding: 14px;
                    text-align: center;
                    color: #64748b;
                    font-size: 12px;
                    font-weight: 600;
                }

                .booking-form-card {
                    padding: 30px;
                }

                .booking-form-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 25px;
                }

                .booking-form-eyebrow {
                    color: #2563eb;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.4px;
                }

                .booking-form-header h2 {
                    color: #142c59;
                    font-size: 25px;
                    font-weight: 800;
                    margin: 8px 0;
                }

                .booking-form-header p {
                    color: #94a3b8;
                    font-size: 13px;
                    margin: 0;
                    line-height: 1.6;
                }

                .booking-calendar-icon {
                    width: 53px;
                    height: 53px;
                    border-radius: 15px;
                    background: #eff6ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    flex-shrink: 0;
                }

                .booking-steps {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px;
                    background: #f8faff;
                    border-radius: 13px;
                    margin-bottom: 27px;
                }

                .booking-step-active,
                .booking-step-inactive {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 800;
                    white-space: nowrap;
                }

                .booking-step-active {
                    color: #2563eb;
                }

                .booking-step-inactive {
                    color: #94a3b8;
                }

                .booking-step-active span,
                .booking-step-inactive span {
                    width: 25px;
                    height: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .booking-step-active span {
                    background: #2563eb;
                    color: white;
                }

                .booking-step-inactive span {
                    background: #e2e8f0;
                    color: #64748b;
                }

                .booking-step-line {
                    height: 2px;
                    background: #dbeafe;
                    flex: 1;
                }

                .booking-form-group {
                    margin-bottom: 23px;
                }

                .booking-form-group label {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    color: #1e293b;
                    font-size: 13px;
                    font-weight: 800;
                    margin-bottom: 10px;
                }

                .booking-form-group label span {
                    color: #2563eb;
                    font-size: 17px;
                }

                .booking-form-group input,
                .booking-form-group textarea {
                    display: block;
                    width: 100%;
                    padding: 14px 15px;
                    border: 1px solid #dbe4f0;
                    border-radius: 11px;
                    font-size: 14px;
                    color: #1e293b;
                    background: #fbfdff;
                    font-family: inherit;
                    transition: 0.2s;
                }

                .booking-form-group textarea {
                    resize: vertical;
                    line-height: 1.6;
                    min-height: 110px;
                }

                .booking-form-group input:focus,
                .booking-form-group textarea:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
                }

                .booking-form-group input:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }

                .booking-form-group small {
                    display: block;
                    color: #94a3b8;
                    font-size: 11px;
                    margin-top: 8px;
                }

                .booking-availability {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px;
                    border: 1px solid;
                    border-radius: 12px;
                    margin-bottom: 22px;
                    font-size: 13px;
                }

                .booking-available {
                    background: #ecfdf5;
                    border-color: #a7f3d0;
                    color: #047857;
                }

                .booking-unavailable {
                    background: #fff1f2;
                    border-color: #fecdd3;
                    color: #be123c;
                }

                .booking-availability-icon {
                    font-size: 20px;
                }

                .booking-availability p {
                    margin: 5px 0 0;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .booking-message {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 13px;
                    border-radius: 11px;
                    margin-bottom: 20px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .booking-error {
                    background: #fff1f2;
                    color: #be123c;
                    border: 1px solid #fecdd3;
                }

                .booking-success {
                    background: #ecfdf5;
                    color: #047857;
                    border: 1px solid #a7f3d0;
                }

                .booking-summary {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                    padding: 17px;
                    background: #f0f6ff;
                    border: 1px solid #dbeafe;
                    border-radius: 13px;
                    margin-top: 8px;
                    margin-bottom: 20px;
                }

                .booking-summary > div span {
                    display: block;
                    color: #64748b;
                    font-size: 11px;
                    font-weight: 700;
                    margin-bottom: 5px;
                }

                .booking-summary > div strong {
                    display: block;
                    color: #1d4ed8;
                    font-size: 23px;
                    font-weight: 850;
                }

                .booking-summary-tag {
                    background: #dbeafe;
                    color: #1d4ed8;
                    border-radius: 30px;
                    padding: 8px 12px;
                    font-size: 10px;
                    font-weight: 800;
                }

                .booking-submit-button,
                .booking-primary-button {
                    width: 100%;
                    padding: 16px 20px;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    font-size: 15px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.22);
                    transition: 0.2s;
                }

                .booking-submit-button:hover:not(:disabled),
                .booking-primary-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(37, 99, 235, 0.28);
                }

                .booking-submit-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .booking-button-spinner,
                .booking-loader {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: booking-spin 0.8s linear infinite;
                }

                .booking-secure-text {
                    text-align: center;
                    color: #94a3b8;
                    font-size: 11px;
                    margin: 15px 0 0;
                }

                .booking-footer {
                    text-align: center;
                    color: #94a3b8;
                    font-size: 12px;
                    padding: 35px 10px 10px;
                }

                .booking-center {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 15px;
                    background: #f5f8ff;
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }

                .booking-center h3 {
                    color: #334155;
                }

                .booking-loader {
                    width: 42px;
                    height: 42px;
                    border: 4px solid #dbeafe;
                    border-top-color: #2563eb;
                }

                .booking-error-card {
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 35px rgba(0,0,0,0.08);
                }

                .booking-error-card h2 {
                    color: #dc2626;
                }

                .booking-error-card p {
                    color: #64748b;
                    line-height: 1.6;
                }

                .booking-error-icon {
                    width: 55px;
                    height: 55px;
                    border-radius: 50%;
                    background: #fee2e2;
                    color: #dc2626;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: 800;
                    margin: 0 auto 18px;
                }

                @keyframes booking-spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 850px) {
                    .booking-main-grid {
                        grid-template-columns: 1fr;
                    }

                    .booking-doctor-card {
                        max-width: 100%;
                    }
                }

                @media (max-width: 600px) {
                    .booking-page {
                        padding: 18px 12px;
                    }

                    .booking-topbar {
                        margin-bottom: 30px;
                    }

                    .booking-brand {
                        font-size: 20px;
                    }

                    .booking-back-button,
                    .booking-logout-button {
                        padding: 9px 10px;
                        font-size: 12px;
                    }

                    .booking-heading {
                        margin-bottom: 25px;
                    }

                    .booking-form-card {
                        padding: 20px 16px;
                    }

                    .booking-form-header h2 {
                        font-size: 21px;
                    }

                    .booking-calendar-icon {
                        width: 43px;
                        height: 43px;
                        font-size: 23px;
                    }

                    .booking-steps {
                        padding: 12px 9px;
                        gap: 7px;
                    }

                    .booking-step-active,
                    .booking-step-inactive {
                        font-size: 10px;
                        gap: 5px;
                    }

                    .booking-summary {
                        padding: 13px;
                    }

                    .booking-doctor-top {
                        padding: 28px 18px;
                    }
                }

                @media (max-width: 370px) {
                    .booking-brand {
                        display: none;
                    }

                    .booking-topbar {
                        justify-content: space-between;
                    }
                }
            `}</style>
        </div>
    );
}

export default BookAppointment;
