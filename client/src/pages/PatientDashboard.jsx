import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HeartPulse,
    CalendarDays,
    Clock3,
    UserRound,
    Stethoscope,
    XCircle,
    Search,
    LogOut,
    CheckCircle2,
    CircleAlert
} from "lucide-react";

function PatientDashboard() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Always get fresh token/user from localStorage
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            navigate("/login", { replace: true });
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            // Patient dashboard only
            if (parsedUser.role !== "patient") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            setUser(parsedUser);
            fetchAppointments(token);
        } catch (error) {
            console.error("User parse error:", error);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login", { replace: true });
        }
    }, [navigate]);

    const fetchAppointments = async (currentToken) => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/appointments/patient",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch appointments"
                );
            }

            setAppointments(data.appointments || []);
        } catch (error) {
            console.error("Fetch Appointments Error:", error);

            // If token expired/invalid
            if (
                error.message.toLowerCase().includes("token") ||
                error.message.toLowerCase().includes("unauthorized")
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login", { replace: true });
                return;
            }

            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            navigate("/login", { replace: true });
            return;
        }

        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (!confirmCancel) return;

        try {
            const response = await fetch(
                `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to cancel appointment"
                );
            }

            alert("Appointment cancelled successfully");

            fetchAppointments(currentToken);
        } catch (error) {
            console.error("Cancel Appointment Error:", error);
            alert(error.message);
        }
    };

    const logout = () => {
        // Completely remove current session
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Optional cleanup if you stored any temporary booking data
        localStorage.removeItem("selectedDoctor");
        localStorage.removeItem("appointmentData");

        // Go to login and replace history
        navigate("/login", { replace: true });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "accepted":
                return "bg-green-50 text-green-700 border-green-200";

            case "rejected":
                return "bg-red-50 text-red-700 border-red-200";

            case "completed":
                return "bg-blue-50 text-blue-700 border-blue-200";

            case "cancelled":
                return "bg-slate-100 text-slate-600 border-slate-200";

            default:
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
        }
    };

    const getStatusIcon = (status) => {
        if (status === "accepted") {
            return <CheckCircle2 size={15} />;
        }

        if (status === "rejected") {
            return <XCircle size={15} />;
        }

        if (status === "completed") {
            return <CheckCircle2 size={15} />;
        }

        return <CircleAlert size={15} />;
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-sky-50/40 flex items-center justify-center">
                <p className="text-slate-500">
                    Checking login...
                </p>
            </div>
        );
    }

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

                    <div className="flex items-center gap-4">

                        <Link
                            to="/doctors"
                            className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-blue-600"
                        >
                            <Search size={18} />
                            Find Doctors
                        </Link>

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-slate-600 hover:text-red-600"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>

                    </div>
                </div>
            </nav>

            {/* ================= MAIN ================= */}

            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* Welcome */}

                <div className="mb-8">

                    <p className="text-blue-600 font-medium">
                        Patient Dashboard
                    </p>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-1">
                        Welcome, {user.name || "Patient"} 👋
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Manage your appointments and healthcare easily.
                    </p>

                </div>

                {/* Quick Actions */}

                <div className="grid sm:grid-cols-2 gap-5 mb-10">

                    <Link
                        to="/doctors"
                        className="bg-blue-600 text-white rounded-2xl p-6 hover:bg-blue-700 transition"
                    >
                        <Search size={28} />

                        <h2 className="text-xl font-semibold mt-4">
                            Find a Doctor
                        </h2>

                        <p className="text-blue-100 mt-1">
                            Browse doctors and book an appointment.
                        </p>
                    </Link>

                    <div className="bg-white border border-blue-100 rounded-2xl p-6">

                        <div className="flex items-center gap-3">

                            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">

                                <CalendarDays
                                    className="text-blue-600"
                                    size={23}
                                />

                            </div>

                            <div>

                                <p className="text-sm text-slate-500">
                                    Total Appointments
                                </p>

                                <p className="text-2xl font-bold text-slate-800">
                                    {appointments.length}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Error */}

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
                        {error}
                    </div>
                )}

                {/* Appointments */}

                <section>

                    <div className="flex items-center justify-between mb-5">

                        <div>

                            <h2 className="text-2xl font-bold text-slate-800">
                                My Appointments
                            </h2>

                            <p className="text-slate-500 mt-1">
                                View and manage your appointments.
                            </p>

                        </div>

                    </div>

                    {/* Loading */}

                    {loading && (
                        <div className="bg-white rounded-2xl border border-blue-100 p-10 text-center">

                            <p className="text-slate-500">
                                Loading appointments...
                            </p>

                        </div>
                    )}

                    {/* No appointments */}

                    {!loading && appointments.length === 0 && (

                        <div className="bg-white rounded-2xl border border-blue-100 p-12 text-center">

                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">

                                <CalendarDays
                                    size={30}
                                    className="text-blue-600"
                                />

                            </div>

                            <h3 className="text-xl font-semibold text-slate-800 mt-5">
                                No appointments yet
                            </h3>

                            <p className="text-slate-500 mt-2">
                                Find a doctor and book your first appointment.
                            </p>

                            <Link
                                to="/doctors"
                                className="inline-flex items-center gap-2 mt-6 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
                            >
                                <Search size={18} />
                                Find Doctors
                            </Link>

                        </div>
                    )}

                    {/* Appointment Cards */}

                    {!loading && appointments.length > 0 && (

                        <div className="space-y-5">

                            {appointments.map((appointment) => {

                                const doctor = appointment.doctorId;

                                return (

                                    <div
                                        key={appointment._id}
                                        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6"
                                    >

                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                                            {/* Doctor */}

                                            <div className="flex items-center gap-4">

                                                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">

                                                    <Stethoscope
                                                        size={27}
                                                        className="text-blue-600"
                                                    />

                                                </div>

                                                <div>

                                                    <h3 className="text-lg font-semibold text-slate-800">

                                                        Dr.{" "}

                                                        {doctor?.userId?.name ||
                                                            doctor?.name ||
                                                            "Doctor"}

                                                    </h3>

                                                    <p className="text-slate-500 text-sm">

                                                        {doctor?.specialization ||
                                                            "Medical Specialist"}

                                                    </p>

                                                </div>

                                            </div>

                                            {/* Status */}

                                            <div
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusStyle(
                                                    appointment.status
                                                )}`}
                                            >

                                                {getStatusIcon(
                                                    appointment.status
                                                )}

                                                <span className="capitalize">
                                                    {appointment.status}
                                                </span>

                                            </div>

                                        </div>

                                        {/* Appointment Details */}

                                        <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">

                                            <div className="flex items-center gap-3">

                                                <CalendarDays
                                                    size={19}
                                                    className="text-blue-600"
                                                />

                                                <div>

                                                    <p className="text-xs text-slate-400">
                                                        Date
                                                    </p>

                                                    <p className="font-medium text-slate-700">
                                                        {appointment.date}
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="flex items-center gap-3">

                                                <Clock3
                                                    size={19}
                                                    className="text-blue-600"
                                                />

                                                <div>

                                                    <p className="text-xs text-slate-400">
                                                        Time
                                                    </p>

                                                    <p className="font-medium text-slate-700">
                                                        {appointment.time}
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="flex items-center gap-3">

                                                <UserRound
                                                    size={19}
                                                    className="text-blue-600"
                                                />

                                                <div>

                                                    <p className="text-xs text-slate-400">
                                                        Reason
                                                    </p>

                                                    <p className="font-medium text-slate-700">
                                                        {appointment.reason ||
                                                            "General Consultation"}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                        {/* Cancel */}

                                        {(appointment.status === "pending" ||
                                            appointment.status === "accepted") && (

                                                <div className="mt-5 flex justify-end">

                                                    <button
                                                        onClick={() =>
                                                            cancelAppointment(
                                                                appointment._id
                                                            )
                                                        }
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                                                    >

                                                        <XCircle size={17} />

                                                        Cancel Appointment

                                                    </button>

                                                </div>

                                            )}

                                    </div>

                                );
                            })}

                        </div>
                    )}

                </section>

            </main>

        </div>
    );
}

export default PatientDashboard;