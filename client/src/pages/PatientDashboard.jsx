
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HeartPulse, CalendarDays, Clock3, UserRound, Stethoscope,
    XCircle, Search, LogOut, CheckCircle2, CircleAlert,
    History, CalendarCheck, Filter, Phone, Mail, RefreshCw,
    Star, MessageSquare, ArrowRight, MapPin, Activity,
    ChevronRight, Plus, CalendarClock
} from "lucide-react";

const API = "http://localhost:5000/api";

function PatientDashboard() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);

    const [reviewedAppointmentIds, setReviewedAppointmentIds] = useState([]);
    const [reviewFor, setReviewFor] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);

    const [activeTab, setActiveTab] = useState("upcoming");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [rescheduleFor, setRescheduleFor] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);
    const [slotError, setSlotError] = useState("");

    const getLocalDate = (dateString) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split("-").map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            navigate("/login", { replace: true });
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            if (parsedUser.role !== "patient") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            setUser(parsedUser);
            fetchAppointments(token);
        } catch (err) {
            console.error("User parse error:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    const fetchAppointments = async (currentToken) => {
        if (!currentToken) return;

        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API}/appointments/patient`, {
                headers: {
                    Authorization: `Bearer ${currentToken}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch appointments");
            }

            setAppointments(data.appointments || []);

            try {
                const reviewResponse = await fetch(`${API}/reviews/patient`, {
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                        "Content-Type": "application/json"
                    }
                });

                const reviewData = await reviewResponse.json();

                if (reviewResponse.ok) {
                    const ids = (reviewData.reviews || []).map((review) =>
                        String(review.appointmentId?._id || review.appointmentId)
                    );
                    setReviewedAppointmentIds(ids);
                }
            } catch (reviewError) {
                console.error("Fetch Reviews Error:", reviewError);
            }
        } catch (err) {
            console.error("Fetch Appointments Error:", err);

            if (
                err.message.toLowerCase().includes("token") ||
                err.message.toLowerCase().includes("unauthorized")
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }

            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isUpcoming = (appointment) => {
        const date = getLocalDate(appointment.date);
        return (
            date &&
            date >= today &&
            ["pending", "accepted"].includes(appointment.status)
        );
    };

    const isPast = (appointment) => {
        const date = getLocalDate(appointment.date);
        return (
            ["completed", "cancelled", "rejected"].includes(appointment.status) ||
            (date && date < today)
        );
    };

    const upcomingAppointments = appointments.filter(isUpcoming);
    const pastAppointments = appointments.filter(isPast);

    const filteredAppointments = useMemo(() => {
        let result = [...appointments];

        if (activeTab === "upcoming") result = result.filter(isUpcoming);
        if (activeTab === "past") result = result.filter(isPast);

        if (statusFilter !== "all") {
            result = result.filter((item) => item.status === statusFilter);
        }

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();

            result = result.filter((item) => {
                const doctor = item.doctorId;
                const name = doctor?.userId?.name || doctor?.name || "";

                return (
                    name.toLowerCase().includes(search) ||
                    (doctor?.specialization || "").toLowerCase().includes(search) ||
                    (item.reason || "").toLowerCase().includes(search)
                );
            });
        }

        return result.sort((a, b) => {
            const dateA = getLocalDate(a.date)?.getTime() || 0;
            const dateB = getLocalDate(b.date)?.getTime() || 0;
            return activeTab === "past" ? dateB - dateA : dateA - dateB;
        });
    }, [appointments, activeTab, statusFilter, searchTerm]);

    const formatDate = (dateString) => {
        const date = getLocalDate(dateString);
        if (!date) return dateString || "Not specified";

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const openReview = (appointment) => {
        setReviewFor(appointment);
        setRating(5);
        setComment("");
    };

    const submitReview = async () => {
        const token = localStorage.getItem("token");

        if (!token || !reviewFor) {
            alert("Please login again.");
            return;
        }

        try {
            setReviewLoading(true);

            const response = await fetch(`${API}/reviews`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    appointmentId: reviewFor._id,
                    rating,
                    comment
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to submit review");
            }

            setReviewedAppointmentIds((previous) => [
                ...previous,
                String(reviewFor._id)
            ]);

            alert("Thank you! Your review has been submitted.");
            setReviewFor(null);
            setRating(5);
            setComment("");
        } catch (err) {
            console.error("Submit Review Error:", err);
            alert(err.message);
        } finally {
            setReviewLoading(false);
        }
    };

    const openReschedule = (appointment) => {
        setRescheduleFor(appointment);
        setNewDate("");
        setNewTime("");
        setAvailableSlots([]);
        setSlotError("");
    };

    const loadAvailableSlots = async (date) => {
        setNewDate(date);
        setNewTime("");
        setAvailableSlots([]);
        setSlotError("");

        if (!date || !rescheduleFor) return;

        try {
            setSlotsLoading(true);

            const doctorId = rescheduleFor.doctorId?._id;
            if (!doctorId) throw new Error("Doctor information not found");

            const response = await fetch(
                `${API}/appointments/slots?doctorId=${doctorId}&date=${date}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load slots");
            }

            setAvailableSlots(data.availableSlots || []);

            if (!data.availableSlots?.length) {
                setSlotError("No available slots on this date.");
            }
        } catch (err) {
            setSlotError(err.message);
        } finally {
            setSlotsLoading(false);
        }
    };

    const submitReschedule = async () => {
        const token = localStorage.getItem("token");

        if (!token || !rescheduleFor || !newDate || !newTime) {
            alert("Please select date and time");
            return;
        }

        try {
            setRescheduleLoading(true);

            const response = await fetch(
                `${API}/appointments/${rescheduleFor._id}/reschedule`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ date: newDate, time: newTime })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Reschedule request failed");
            }

            alert("Reschedule request sent successfully!");
            setRescheduleFor(null);
            setNewDate("");
            setNewTime("");
            setAvailableSlots([]);
            fetchAppointments(token);
        } catch (err) {
            alert(err.message);
        } finally {
            setRescheduleLoading(false);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        if (!window.confirm("Are you sure you want to cancel this appointment?")) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/appointments/${appointmentId}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to cancel appointment");
            }

            alert("Appointment cancelled successfully");
            fetchAppointments(token);
        } catch (err) {
            console.error("Cancel Appointment Error:", err);
            alert(err.message);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("selectedDoctor");
        localStorage.removeItem("appointmentData");
        navigate("/login", { replace: true });
    };

    const statusStyles = {
        accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
        completed: "bg-blue-50 text-blue-700 border-blue-200",
        cancelled: "bg-slate-100 text-slate-600 border-slate-200",
        pending: "bg-amber-50 text-amber-700 border-amber-200"
    };

    const getStatusIcon = (status) => {
        if (status === "accepted" || status === "completed") {
            return <CheckCircle2 size={15} />;
        }
        if (status === "rejected" || status === "cancelled") {
            return <XCircle size={15} />;
        }
        return <CircleAlert size={15} />;
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <HeartPulse className="text-white" size={25} />
                    </div>
                    <p className="text-slate-500 font-medium">Checking your account...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f8ff] text-slate-800">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
                .mediy-dashboard { font-family: 'DM Sans', sans-serif; }
                .dashboard-card { background: white; border: 1px solid #e6edfa; border-radius: 20px; box-shadow: 0 5px 24px rgba(31,72,130,.035); }
                .dashboard-button { transition: all .2s ease; }
                .dashboard-button:active { transform: scale(.98); }
            `}</style>

            <div className="mediy-dashboard">
                {/* NAVBAR */}
                <nav className="bg-white/95 backdrop-blur-xl border-b border-blue-100 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                <HeartPulse size={23} className="text-white" />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight">
                                Medi<span className="text-blue-600">Y</span>
                            </span>
                        </Link>

                        <div className="flex items-center gap-2 sm:gap-5">
                            <Link
                                to="/doctors"
                                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 dashboard-button"
                            >
                                <Search size={17} />
                                Find Doctors
                            </Link>
                            <button
                                onClick={logout}
                                className="dashboard-button flex items-center gap-2 rounded-xl border border-red-100 px-3 sm:px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50"
                            >
                                <LogOut size={17} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
                    {/* WELCOME HERO */}
                    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-9 lg:p-11 mb-7 shadow-xl shadow-blue-200/50">
                        <div className="absolute -right-10 -top-24 w-72 h-72 rounded-full border-[35px] border-white/5" />
                        <div className="absolute right-32 -bottom-32 w-64 h-64 rounded-full bg-white/5" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-7">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-semibold text-blue-50 mb-5">
                                    <Activity size={14} />
                                    YOUR PERSONAL HEALTHCARE SPACE
                                </div>
                                <p className="text-blue-100 text-sm font-medium">
                                    Patient Dashboard
                                </p>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-2 tracking-tight">
                                    Welcome back, {user.name?.split(" ")[0] || "Patient"}!
                                </h1>
                                <p className="text-blue-100 mt-3 text-sm sm:text-base max-w-xl leading-relaxed">
                                    Your health matters. Manage appointments, connect with doctors and stay on top of your healthcare.
                                </p>
                                <Link
                                    to="/doctors"
                                    className="dashboard-button inline-flex items-center gap-2 mt-6 bg-white text-blue-700 px-5 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-50"
                                >
                                    <Plus size={18} />
                                    Book an Appointment
                                    <ArrowRight size={17} />
                                </Link>
                            </div>

                            <div className="hidden md:flex items-center justify-center w-36 h-36 lg:w-44 lg:h-44 rounded-full bg-white/10 border border-white/20">
                                <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-white/10 flex items-center justify-center">
                                    <HeartPulse size={75} className="text-white" strokeWidth={1.4} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PROFILE + STATS */}
                    <div className="grid lg:grid-cols-[1fr_2fr] gap-5 mb-8">
                        <section className="dashboard-card p-5 sm:p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <UserRound size={29} className="text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                                        Patient Profile
                                    </p>
                                    <h2 className="font-extrabold text-lg mt-1 truncate">
                                        {user.name || "Patient"}
                                    </h2>
                                    <p className="text-xs text-slate-400">Patient Account</p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                                {user.email && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                            <Mail size={16} className="text-blue-600" />
                                        </div>
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                            <Phone size={16} className="text-blue-600" />
                                        </div>
                                        {user.phone}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                            {[
                                {
                                    label: "Total Appointments",
                                    value: appointments.length,
                                    icon: CalendarDays,
                                    color: "text-blue-600",
                                    bg: "bg-blue-50"
                                },
                                {
                                    label: "Upcoming",
                                    value: upcomingAppointments.length,
                                    icon: CalendarCheck,
                                    color: "text-emerald-600",
                                    bg: "bg-emerald-50"
                                },
                                {
                                    label: "Past Visits",
                                    value: pastAppointments.length,
                                    icon: History,
                                    color: "text-violet-600",
                                    bg: "bg-violet-50"
                                }
                            ].map((stat) => (
                                <div key={stat.label} className="dashboard-card p-4 sm:p-5 flex flex-col justify-between">
                                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                        <stat.icon size={21} className={stat.color} />
                                    </div>
                                    <div className="mt-5">
                                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>

                    {/* APPOINTMENTS SECTION */}
                    <section>
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                            <div>
                                <p className="text-xs uppercase tracking-widest font-bold text-blue-600 mb-2">
                                    Healthcare Overview
                                </p>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                    My Appointments
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Keep track of your consultations and visits.
                                </p>
                            </div>

                            <button
                                onClick={() => fetchAppointments(localStorage.getItem("token"))}
                                disabled={loading}
                                className="dashboard-button inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 text-sm font-semibold disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>

                        {error && (
                            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* TABS */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {[
                                { id: "upcoming", label: "Upcoming", count: upcomingAppointments.length },
                                { id: "past", label: "Past", count: pastAppointments.length },
                                { id: "all", label: "All Appointments", count: appointments.length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`dashboard-button flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${
                                        activeTab === tab.id
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                            : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`text-xs rounded-lg px-2 py-0.5 ${
                                        activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* SEARCH + FILTER */}
                        <div className="dashboard-card p-3 sm:p-4 mb-5 flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search doctor, specialization or reason..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 transition"
                                />
                            </div>

                            <div className="relative sm:w-56">
                                <Filter size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-400"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* LOADING */}
                        {loading && (
                            <div className="dashboard-card p-12 text-center">
                                <RefreshCw size={30} className="text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="font-semibold text-slate-700">Loading your appointments...</p>
                                <p className="text-sm text-slate-400 mt-1">Please wait a moment.</p>
                            </div>
                        )}

                        {/* EMPTY */}
                        {!loading && filteredAppointments.length === 0 && (
                            <div className="dashboard-card p-9 sm:p-14 text-center">
                                <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto">
                                    <CalendarDays size={35} className="text-blue-600" />
                                </div>
                                <h3 className="text-xl font-extrabold mt-5">
                                    No appointments found
                                </h3>
                                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                                    {searchTerm || statusFilter !== "all"
                                        ? "Try changing your search term or filters."
                                        : "You don't have any appointments here yet. Find a doctor and schedule your first visit."}
                                </p>
                                {activeTab === "upcoming" && (
                                    <Link
                                        to="/doctors"
                                        className="dashboard-button inline-flex items-center gap-2 mt-6 bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100"
                                    >
                                        <Search size={17} />
                                        Find Doctors
                                        <ArrowRight size={16} />
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* APPOINTMENT CARDS */}
                        {!loading && filteredAppointments.length > 0 && (
                            <div className="space-y-4">
                                {filteredAppointments.map((appointment) => {
                                    const doctor = appointment.doctorId;
                                    const doctorName =
                                        doctor?.userId?.name || doctor?.name || "Doctor";
                                    const hasReviewed = reviewedAppointmentIds.includes(
                                        String(appointment._id)
                                    );

                                    return (
                                        <article
                                            key={appointment._id}
                                            className="dashboard-card p-5 sm:p-6 hover:shadow-lg hover:shadow-blue-100/40 transition duration-200"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    {doctor?.profileImage ? (
                                                        <img
                                                            src={doctor.profileImage}
                                                            alt={doctorName}
                                                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-blue-100 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                                                            <Stethoscope size={27} className="text-blue-600" />
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-extrabold truncate">
                                                            Dr. {doctorName}
                                                        </h3>
                                                        <p className="text-sm text-blue-600 font-semibold mt-0.5">
                                                            {doctor?.specialization || "Medical Specialist"}
                                                        </p>
                                                        {doctor?.hospitalName && (
                                                            <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                                                <MapPin size={12} />
                                                                {doctor.hospitalName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={`self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold capitalize ${
                                                    statusStyles[appointment.status] || statusStyles.pending
                                                }`}>
                                                    {getStatusIcon(appointment.status)}
                                                    {appointment.status}
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
                                                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                                        <CalendarDays size={17} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">Date</p>
                                                        <p className="text-sm font-bold text-slate-700 mt-0.5">{formatDate(appointment.date)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                                                        <Clock3 size={17} className="text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">Time</p>
                                                        <p className="text-sm font-bold text-slate-700 mt-0.5">{appointment.time}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                                                    <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                                                        <MessageSquare size={17} className="text-violet-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">Reason</p>
                                                        <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">
                                                            {appointment.reason || "General Consultation"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* REVIEW */}
                                            {appointment.status === "completed" && (
                                                <div className="mt-5 pt-5 border-t border-slate-100">
                                                    {hasReviewed ? (
                                                        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-emerald-700 text-sm font-semibold">
                                                            <CheckCircle2 size={18} />
                                                            You have reviewed this appointment.
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                            <div>
                                                                <p className="font-bold text-slate-800">How was your consultation?</p>
                                                                <p className="text-xs text-slate-500 mt-1">Your feedback helps other patients.</p>
                                                            </div>
                                                            <button
                                                                onClick={() => openReview(appointment)}
                                                                className="dashboard-button inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold"
                                                            >
                                                                <Star size={17} />
                                                                Write a Review
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* RESCHEDULE REQUEST STATUS */}
                                            {appointment.rescheduleRequest?.status && (
                                                <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4">
                                                    <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                                                        <CalendarClock size={17} />
                                                        Reschedule Request: <span className="capitalize">{appointment.rescheduleRequest.status}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-slate-600">
                                                        <p>Requested Date: <strong>{formatDate(appointment.rescheduleRequest.date)}</strong></p>
                                                        <p>Requested Time: <strong>{appointment.rescheduleRequest.time}</strong></p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ACTIONS */}
                                            {(appointment.status === "pending" || appointment.status === "accepted") && (
                                                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-2">
                                                    {appointment.rescheduleRequest?.status !== "pending" && (
                                                        <button
                                                            onClick={() => openReschedule(appointment)}
                                                            className="dashboard-button inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-bold"
                                                        >
                                                            <CalendarClock size={16} />
                                                            Reschedule
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => cancelAppointment(appointment._id)}
                                                        className="dashboard-button inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-bold"
                                                    >
                                                        <XCircle size={16} />
                                                        Cancel Appointment
                                                    </button>
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* FOOTER */}
                    <footer className="mt-12 border-t border-blue-100 pt-6 pb-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                        <p>© {new Date().getFullYear()} MediY. Your health, our priority.</p>
                        <Link to="/doctors" className="flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700">
                            Find your doctor <ChevronRight size={14} />
                        </Link>
                    </footer>
                </main>
            </div>

            {/* REVIEW MODAL */}
            {reviewFor && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                                    <Star size={22} className="text-amber-500" />
                                </div>
                                <h2 className="text-xl font-extrabold text-slate-800">Rate Your Doctor</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Dr. {reviewFor.doctorId?.userId?.name || reviewFor.doctorId?.name || "Doctor"}
                                </p>
                            </div>
                            <button
                                onClick={() => setReviewFor(null)}
                                disabled={reviewLoading}
                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Close review form"
                            >
                                <XCircle size={22} />
                            </button>
                        </div>

                        <div className="mt-7 text-center">
                            <p className="text-sm font-bold text-slate-700">How would you rate your experience?</p>
                            <div className="flex justify-center gap-2 mt-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="dashboard-button hover:scale-110"
                                        aria-label={`Rate ${star} out of 5`}
                                    >
                                        <Star
                                            size={34}
                                            className={star <= rating
                                                ? "text-amber-400 fill-amber-400"
                                                : "text-slate-200"}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-amber-600 font-bold mt-3">{rating} out of 5 stars</p>
                        </div>

                        <div className="mt-6">
                            <label className="text-sm font-bold text-slate-700 mb-2 block">
                                Share your experience (optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                maxLength={1000}
                                rows={4}
                                placeholder="Tell us about your consultation..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:bg-white focus:border-blue-400 resize-none"
                            />
                            <p className="text-xs text-slate-400 text-right mt-1">{comment.length}/1000 characters</p>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setReviewFor(null)}
                                disabled={reviewLoading}
                                className="dashboard-button flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitReview}
                                disabled={reviewLoading}
                                className="dashboard-button flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {reviewLoading ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RESCHEDULE MODAL */}
            {rescheduleFor && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                            <CalendarClock size={22} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-800">Reschedule Appointment</h2>
                        <p className="text-sm text-slate-500 mt-2">
                            Select a new date and an available time slot.
                        </p>

                        <label className="block text-sm font-bold text-slate-700 mt-6 mb-2">
                            New Appointment Date
                        </label>
                        <input
                            type="date"
                            min={new Date().toLocaleDateString("en-CA")}
                            value={newDate}
                            onChange={(e) => loadAvailableSlots(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:bg-white focus:border-blue-400"
                        />

                        {slotsLoading && (
                            <p className="text-sm text-blue-600 mt-3 flex items-center gap-2">
                                <RefreshCw size={15} className="animate-spin" />
                                Loading available slots...
                            </p>
                        )}

                        {slotError && (
                            <p className="text-sm text-red-500 mt-3 bg-red-50 rounded-xl p-3">{slotError}</p>
                        )}

                        {availableSlots.length > 0 && (
                            <>
                                <label className="block text-sm font-bold text-slate-700 mt-5 mb-2">
                                    Available Time Slots
                                </label>
                                <select
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:bg-white focus:border-blue-400"
                                >
                                    <option value="">Select a time</option>
                                    {availableSlots.map((slot) => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        <div className="flex gap-3 mt-7">
                            <button
                                onClick={() => {
                                    setRescheduleFor(null);
                                    setSlotError("");
                                }}
                                disabled={rescheduleLoading}
                                className="dashboard-button flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={submitReschedule}
                                disabled={!newDate || !newTime || rescheduleLoading || slotsLoading}
                                className="dashboard-button flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {rescheduleLoading ? "Sending..." : "Send Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PatientDashboard;
