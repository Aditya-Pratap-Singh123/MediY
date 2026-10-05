import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    HeartPulse,
    Stethoscope,
    CalendarDays,
    Clock3,
    ArrowLeft,
    CheckCircle2
} from "lucide-react";

function DoctorProfile() {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        date: "",
        time: "",
        reason: ""
    });

    const [booking, setBooking] = useState(false);

    const token = localStorage.getItem("token");

    // =====================================
    // FETCH DOCTOR
    // =====================================

    useEffect(() => {
        fetchDoctor();
    }, [doctorId]);

    const fetchDoctor = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/doctors/${doctorId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch doctor"
                );
            }

            setDoctor(data.doctor);

        } catch (error) {
            console.error("Fetch Doctor Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // =====================================
    // HANDLE INPUT
    // =====================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // =====================================
    // BOOK APPOINTMENT
    // =====================================

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!token) {
            alert("Please login as a patient first.");
            navigate("/login");
            return;
        }

        setBooking(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/appointments/book",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        doctorId,
                        date: formData.date,
                        time: formData.time,
                        reason: formData.reason
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to book appointment"
                );
            }

            alert("Appointment booked successfully!");

            navigate("/patient/dashboard");

        } catch (error) {
            console.error("Book Appointment Error:", error);
            setError(error.message);
        } finally {
            setBooking(false);
        }
    };

    // =====================================
    // LOADING
    // =====================================

    if (loading) {
        return (
            <div className="min-h-screen bg-sky-50/40 flex items-center justify-center">
                <p className="text-slate-500">
                    Loading doctor profile...
                </p>
            </div>
        );
    }

    // =====================================
    // DOCTOR NOT FOUND
    // =====================================

    if (error && !doctor) {
        return (
            <div className="min-h-screen bg-sky-50/40 flex items-center justify-center px-6">

                <div className="bg-white p-8 rounded-2xl border border-red-100 text-center">

                    <p className="text-red-600 mb-5">
                        {error}
                    </p>

                    <Link
                        to="/doctors"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
                    >
                        <ArrowLeft size={18} />
                        Back to Doctors
                    </Link>

                </div>

            </div>
        );
    }

    // =====================================
    // DOCTOR NAME
    // =====================================

    const doctorName =
        doctor?.userId?.name ||
        doctor?.name ||
        "Doctor";

    // =====================================
    // UI
    // =====================================

    return (
        <div className="min-h-screen bg-sky-50/40">

            {/* ================= NAVBAR ================= */}

            <nav className="bg-blue-50 border-b border-blue-100">

                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    <Link
                        to="/"
                        className="flex items-center gap-2"
                    >

                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">

                            <HeartPulse
                                size={23}
                                className="text-white"
                            />

                        </div>

                        <span className="text-2xl font-bold text-slate-800">
                            Medi
                            <span className="text-blue-600">
                                Y
                            </span>
                        </span>

                    </Link>

                    <Link
                        to="/doctors"
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                        Back to Doctors
                    </Link>

                </div>

            </nav>


            {/* ================= MAIN ================= */}

            <main className="max-w-6xl mx-auto px-6 py-10">

                {/* ================= DOCTOR PROFILE ================= */}

                <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">

                    {/* HEADER */}

                    <div className="bg-blue-50 p-8 md:p-10">

                        <div className="flex flex-col md:flex-row items-start gap-6">

                            <div className="w-24 h-24 rounded-2xl bg-white border border-blue-100 flex items-center justify-center">

                                <Stethoscope
                                    size={42}
                                    className="text-blue-600"
                                />

                            </div>

                            <div>

                                <p className="text-blue-600 font-medium">
                                    Doctor Profile
                                </p>

                                <h1 className="text-3xl font-bold text-slate-800 mt-1">
                                    Dr. {doctorName}
                                </h1>

                                <p className="text-lg text-blue-600 mt-1">
                                    {doctor?.specialization ||
                                        "Medical Specialist"}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* DETAILS */}

                    <div className="p-8 md:p-10">

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

                            {/* SPECIALIZATION */}

                            <div className="p-5 bg-slate-50 rounded-2xl">

                                <Stethoscope
                                    size={22}
                                    className="text-blue-600"
                                />

                                <p className="text-sm text-slate-400 mt-3">
                                    Specialization
                                </p>

                                <p className="font-semibold text-slate-700 mt-1">
                                    {doctor?.specialization ||
                                        "Not specified"}
                                </p>

                            </div>


                            {/* EXPERIENCE */}

                            <div className="p-5 bg-slate-50 rounded-2xl">

                                <Clock3
                                    size={22}
                                    className="text-blue-600"
                                />

                                <p className="text-sm text-slate-400 mt-3">
                                    Experience
                                </p>

                                <p className="font-semibold text-slate-700 mt-1">

                                    {doctor?.experience
                                        ? `${doctor.experience} years`
                                        : "Not specified"}

                                </p>

                            </div>


                            {/* AVAILABILITY */}

                            <div className="p-5 bg-slate-50 rounded-2xl">

                                <CheckCircle2
                                    size={22}
                                    className="text-green-600"
                                />

                                <p className="text-sm text-slate-400 mt-3">
                                    Availability
                                </p>

                                <p className="font-semibold text-green-600 mt-1">
                                    Available for appointments
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ================= BOOK APPOINTMENT ================= */}

                <div className="mt-8 bg-white rounded-3xl border border-blue-100 shadow-sm p-8 md:p-10">

                    {/* TITLE */}

                    <div className="mb-7">

                        <p className="text-blue-600 font-medium">
                            BOOK APPOINTMENT
                        </p>

                        <h2 className="text-2xl font-bold text-slate-800 mt-1">
                            Schedule your appointment
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Select a date and time that works for you.
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
                            {error}
                        </div>

                    )}


                    {/* FORM */}

                    <form
                        onSubmit={handleBooking}
                        className="space-y-6"
                    >

                        {/* DATE + TIME */}

                        <div className="grid md:grid-cols-2 gap-5">

                            {/* DATE */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Appointment Date
                                </label>

                                <div className="relative">

                                    <CalendarDays
                                        size={19}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* TIME */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Appointment Time
                                </label>

                                <div className="relative">

                                    <Clock3
                                        size={19}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* REASON */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Reason for Visit
                            </label>

                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Briefly describe why you want to consult the doctor..."
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* BUTTON */}

                        <button
                            type="submit"
                            disabled={booking}
                            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                        >

                            {booking
                                ? "Booking Appointment..."
                                : "Book Appointment"}

                        </button>

                    </form>

                </div>

            </main>

        </div>
    );
}

export default DoctorProfile;