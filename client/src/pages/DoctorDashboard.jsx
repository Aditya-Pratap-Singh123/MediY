import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HeartPulse,
    CalendarDays,
    Clock3,
    UserRound,
    CheckCircle2,
    XCircle,
    LogOut,
    Stethoscope,
    ClipboardList
} from "lucide-react";

function DoctorDashboard() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        if (user.role !== "doctor") {
            navigate("/patient/dashboard");
            return;
        }

        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/appointments/doctor",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
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
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (appointmentId, status) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/appointments/${appointmentId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update appointment"
                );
            }

            fetchAppointments();

        } catch (error) {
            alert(error.message);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
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

    const pendingCount = appointments.filter(
        (appointment) => appointment.status === "pending"
    ).length;

    const acceptedCount = appointments.filter(
        (appointment) => appointment.status === "accepted"
    ).length;

    const completedCount = appointments.filter(
        (appointment) => appointment.status === "completed"
    ).length;

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
                            Medi<span className="text-blue-600">Y</span>
                        </span>
                    </Link>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                </div>

            </nav>


            {/* ================= MAIN ================= */}
            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* Welcome */}
                <div className="mb-8">

                    <p className="text-blue-600 font-medium">
                        Doctor Dashboard
                    </p>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-1">
                        Welcome, Dr. {user.name || "Doctor"} 👋
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Manage your patient appointments from here.
                    </p>

                </div>


                {/* ================= STATS ================= */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                    {/* Total */}
                    <div className="bg-white rounded-2xl border border-blue-100 p-6">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Appointments
                                </p>

                                <p className="text-3xl font-bold text-slate-800 mt-2">
                                    {appointments.length}
                                </p>
                            </div>

                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <ClipboardList
                                    className="text-blue-600"
                                    size={24}
                                />
                            </div>

                        </div>

                    </div>


                    {/* Pending */}
                    <div className="bg-white rounded-2xl border border-yellow-100 p-6">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-slate-500">
                                    Pending
                                </p>

                                <p className="text-3xl font-bold text-slate-800 mt-2">
                                    {pendingCount}
                                </p>
                            </div>

                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                                <Clock3
                                    className="text-yellow-600"
                                    size={24}
                                />
                            </div>

                        </div>

                    </div>


                    {/* Accepted */}
                    <div className="bg-white rounded-2xl border border-green-100 p-6">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-slate-500">
                                    Accepted
                                </p>

                                <p className="text-3xl font-bold text-slate-800 mt-2">
                                    {acceptedCount}
                                </p>
                            </div>

                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <CheckCircle2
                                    className="text-green-600"
                                    size={24}
                                />
                            </div>

                        </div>

                    </div>


                    {/* Completed */}
                    <div className="bg-white rounded-2xl border border-blue-100 p-6">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-slate-500">
                                    Completed
                                </p>

                                <p className="text-3xl font-bold text-slate-800 mt-2">
                                    {completedCount}
                                </p>
                            </div>

                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <CheckCircle2
                                    className="text-blue-600"
                                    size={24}
                                />
                            </div>

                        </div>

                    </div>

                </div>


                {/* ================= ERROR ================= */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
                        {error}
                    </div>
                )}


                {/* ================= APPOINTMENTS ================= */}
                <section>

                    <div className="flex items-center justify-between mb-5">

                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                Patient Appointments
                            </h2>

                            <p className="text-slate-500 mt-1">
                                Review and manage appointment requests.
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


                    {/* Empty */}
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
                                Patient appointment requests will appear here.
                            </p>

                        </div>
                    )}


                    {/* Appointment List */}
                    {!loading && appointments.length > 0 && (

                        <div className="space-y-5">

                            {appointments.map((appointment) => {

                                const patient = appointment.patientId;

                                return (
                                    <div
                                        key={appointment._id}
                                        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6"
                                    >

                                        {/* Top */}
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                                            {/* Patient */}
                                            <div className="flex items-center gap-4">

                                                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                                                    <UserRound
                                                        size={27}
                                                        className="text-blue-600"
                                                    />
                                                </div>

                                                <div>

                                                    <h3 className="text-lg font-semibold text-slate-800">
                                                        {patient?.name ||
                                                            "Patient"}
                                                    </h3>

                                                    <p className="text-sm text-slate-500">
                                                        {patient?.email ||
                                                            "No email"}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Status */}
                                            <div
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusStyle(
                                                    appointment.status
                                                )}`}
                                            >
                                                {appointment.status ===
                                                "accepted" ? (
                                                    <CheckCircle2 size={15} />
                                                ) : appointment.status ===
                                                  "rejected" ? (
                                                    <XCircle size={15} />
                                                ) : (
                                                    <Clock3 size={15} />
                                                )}

                                                <span className="capitalize">
                                                    {appointment.status}
                                                </span>
                                            </div>

                                        </div>


                                        {/* Details */}
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

                                                <Stethoscope
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


                                        {/* Actions */}
                                        {appointment.status === "pending" && (

                                            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap justify-end gap-3">

                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment._id,
                                                            "rejected"
                                                        )
                                                    }
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                                                >
                                                    <XCircle size={17} />
                                                    Reject
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment._id,
                                                            "accepted"
                                                        )
                                                    }
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                                                >
                                                    <CheckCircle2 size={17} />
                                                    Accept
                                                </button>

                                            </div>

                                        )}


                                        {appointment.status === "accepted" && (

                                            <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">

                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment._id,
                                                            "completed"
                                                        )
                                                    }
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                                                >
                                                    <CheckCircle2 size={17} />
                                                    Mark Completed
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

export default DoctorDashboard;