
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HeartPulse, CalendarDays, Clock3, UserRound,
    CheckCircle2, XCircle, LogOut, Stethoscope,
    ClipboardList, RefreshCw, Search, Filter,
    Mail, Phone, CalendarCheck, Camera, Upload,
    ImagePlus, LayoutDashboard, Menu, X, Activity,
    ChevronRight, Bell, ShieldCheck, ArrowUpRight
} from "lucide-react";

const API = "https://mediy-1.onrender.com";

function DoctorDashboard() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [rescheduleLoadingId, setRescheduleLoadingId] = useState(null);

    const [doctor, setDoctor] = useState({});
    const [doctorProfile, setDoctorProfile] = useState(null);

    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState("");
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoMessage, setPhotoMessage] = useState("");
    const [photoError, setPhotoError] = useState("");

    const [activeTab, setActiveTab] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const getToken = () => localStorage.getItem("token");

    const todayString = useMemo(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    }, []);

    useEffect(() => {
        const token = getToken();
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            navigate("/login", { replace: true });
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            if (parsedUser.role !== "doctor") {
                navigate("/patient/dashboard", { replace: true });
                return;
            }

            setDoctor(parsedUser);
            fetchAppointments();
            fetchDoctorProfile();
        } catch (err) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        return () => {
            if (previewPhoto) URL.revokeObjectURL(previewPhoto);
        };
    }, [previewPhoto]);

    const fetchDoctorProfile = async () => {
        try {
            const response = await fetch(`${API}/api/doctors/profile`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Unable to fetch profile");

            setDoctorProfile(data.doctor);
        } catch (err) {
            console.error("Fetch Doctor Profile Error:", err);
        }
    };

    const handlePhotoSelect = (event) => {
        const file = event.target.files?.[0];

        setPhotoMessage("");
        setPhotoError("");

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setPhotoError("Please select a valid image.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setPhotoError("Image size must be less than 5 MB.");
            event.target.value = "";
            return;
        }

        setSelectedPhoto(file);
        setPreviewPhoto(URL.createObjectURL(file));
    };

    const uploadProfilePhoto = async () => {
        if (!selectedPhoto) {
            setPhotoError("Please select a photo first.");
            return;
        }

        try {
            setPhotoUploading(true);
            setPhotoError("");
            setPhotoMessage("");

            const formData = new FormData();
            formData.append("profileImage", selectedPhoto);

            const response = await fetch(`${API}/api/doctors/profile/photo`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Photo upload failed");

            setDoctorProfile(previous => ({
                ...previous,
                profileImage: data.profileImage
            }));

            setSelectedPhoto(null);
            setPreviewPhoto("");
            setPhotoMessage("Profile photo updated successfully!");

            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            console.error("Photo Upload Error:", err);
            setPhotoError(err.message);
        } finally {
            setPhotoUploading(false);
        }
    };

    const cancelPhotoSelection = () => {
        setSelectedPhoto(null);
        setPreviewPhoto("");
        setPhotoError("");
        setPhotoMessage("");

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const fetchAppointments = async () => {
        try {
            setError("");

            const token = getToken();

            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            const response = await fetch(`${API}/api/appointments/doctor`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Failed to fetch appointments");

            setAppointments(data.appointments || []);
        } catch (err) {
            console.error("Fetch Appointments Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (appointmentId, status) => {
        try {
            setUpdatingId(appointmentId);

            const response = await fetch(`${API}/api/appointments/${appointmentId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Unable to update appointment");

            await fetchAppointments();
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const respondToReschedule = async (appointmentId, action) => {
        const message = action === "approve"
            ? "Approve this reschedule request?"
            : "Reject this reschedule request?";

        if (!window.confirm(message)) return;

        try {
            setRescheduleLoadingId(appointmentId);

            const response = await fetch(`${API}/api/appointments/${appointmentId}/reschedule/respond`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({ action })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Unable to respond to request");

            alert(action === "approve"
                ? "Reschedule request approved successfully!"
                : "Reschedule request rejected.");

            await fetchAppointments();
        } catch (err) {
            alert(err.message);
        } finally {
            setRescheduleLoadingId(null);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    const pendingCount = appointments.filter(a => a.status === "pending").length;
    const acceptedCount = appointments.filter(a => a.status === "accepted").length;
    const completedCount = appointments.filter(a => a.status === "completed").length;
    const todayCount = appointments.filter(a => a.date === todayString).length;
    const rescheduleCount = appointments.filter(a => a.rescheduleRequest?.status === "pending").length;

    const filteredAppointments = useMemo(() => {
        let result = [...appointments];

        if (activeTab === "today") {
            result = result.filter(a => a.date === todayString);
        } else if (activeTab !== "all") {
            result = result.filter(a => a.status === activeTab);
        }

        if (statusFilter !== "all") {
            result = result.filter(a => a.status === statusFilter);
        }

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();

            result = result.filter(a => {
                const patient = a.patientId;
                return (
                    (patient?.name || "").toLowerCase().includes(search) ||
                    (patient?.email || "").toLowerCase().includes(search) ||
                    (a.reason || "").toLowerCase().includes(search)
                );
            });
        }

        return result.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [appointments, activeTab, statusFilter, searchTerm, todayString]);

    const getStatusStyle = (status) => {
        const styles = {
            accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
            rejected: "bg-rose-50 text-rose-700 border-rose-100",
            completed: "bg-blue-50 text-blue-700 border-blue-100",
            cancelled: "bg-slate-100 text-slate-600 border-slate-200",
            pending: "bg-amber-50 text-amber-700 border-amber-100"
        };

        return styles[status] || styles.pending;
    };

    const getStatusIcon = (status) => {
        if (status === "accepted" || status === "completed") return <CheckCircle2 size={14} />;
        if (status === "rejected" || status === "cancelled") return <XCircle size={14} />;
        return <Clock3 size={14} />;
    };

    const displayedPhoto = previewPhoto || doctorProfile?.profileImage || "";

    const stats = [
        {
            label: "Total Appointments",
            value: appointments.length,
            icon: ClipboardList,
            color: "blue",
            note: "All time appointments"
        },
        {
            label: "Pending Requests",
            value: pendingCount,
            icon: Clock3,
            color: "amber",
            note: "Awaiting your response"
        },
        {
            label: "Accepted",
            value: acceptedCount,
            icon: CheckCircle2,
            color: "emerald",
            note: "Confirmed appointments"
        },
        {
            label: "Reschedule Requests",
            value: rescheduleCount,
            icon: RefreshCw,
            color: "purple",
            note: "Need your attention"
        }
    ];

    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
        emerald: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600"
    };

    const tabs = [
        { id: "all", label: "All", count: appointments.length },
        { id: "today", label: "Today", count: todayCount },
        { id: "pending", label: "Pending", count: pendingCount },
        { id: "accepted", label: "Accepted", count: acceptedCount },
        { id: "completed", label: "Completed", count: completedCount }
    ];

    return (
        <div className="min-h-screen bg-[#f5f8ff] text-slate-800">
            <style>{`
                * { box-sizing: border-box; }
                .dashboard-sidebar { width: 260px; }
                .dashboard-main { margin-left: 260px; }
                .soft-shadow { box-shadow: 0 10px 35px rgba(15, 55, 120, .055); }
                .stat-card { transition: transform .2s ease, box-shadow .2s ease; }
                .stat-card:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(15,55,120,.09); }
                .nav-link { transition: all .2s ease; }
                .nav-link:hover { background: #eff6ff; color: #2563eb; }
                .appointment-card { transition: border-color .2s ease, transform .2s ease; }
                .appointment-card:hover { border-color: #bfdbfe; transform: translateY(-2px); }
                @media(max-width: 900px) {
                    .dashboard-sidebar { transform: translateX(-100%); transition: transform .25s ease; }
                    .dashboard-sidebar.sidebar-open { transform: translateX(0); }
                    .dashboard-main { margin-left: 0; }
                }
            `}</style>

            {/* SIDEBAR */}
            <aside className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 flex flex-col dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
                <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <HeartPulse size={23} className="text-white" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight">
                            Medi<span className="text-blue-600">Y</span>
                        </span>
                    </Link>
                    <button className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
                        <X size={21} />
                    </button>
                </div>

                <div className="p-5 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[.15em] text-slate-400 px-3 mb-3">
                        Workspace
                    </p>

                    <button
                        onClick={() => {
                            setActiveTab("all");
                            setStatusFilter("all");
                            setSidebarOpen(false);
                            document.getElementById("appointments")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm"
                    >
                        <LayoutDashboard size={19} />
                        Dashboard
                    </button>

                    <button
                        onClick={() => {
                            setSidebarOpen(false);
                            document.getElementById("appointments")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 font-medium text-sm mt-2"
                    >
                        <CalendarDays size={19} />
                        Appointments
                        <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            {appointments.length}
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setSidebarOpen(false);
                            document.getElementById("profile-photo")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 font-medium text-sm mt-2"
                    >
                        <UserRound size={19} />
                        My Profile
                    </button>

                    <div className="mt-9">
                        <p className="text-[11px] font-bold uppercase tracking-[.15em] text-slate-400 px-3 mb-3">
                            Account
                        </p>

                        <button onClick={logout} className="nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 font-medium text-sm">
                            <LogOut size={19} />
                            Logout
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white">
                        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                            <ShieldCheck size={20} />
                        </div>
                        <p className="font-bold text-sm">MediY Healthcare</p>
                        <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                            Your healthcare workspace, all in one place.
                        </p>
                    </div>
                    <p className="text-center text-[11px] text-slate-400 mt-5">© 2026 MediY</p>
                </div>
            </aside>

            {/* MOBILE OVERLAY */}
            {sidebarOpen && (
                <button
                    aria-label="Close menu"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-950/30 z-40 lg:hidden"
                />
            )}

            {/* MAIN AREA */}
            <div className="dashboard-main min-h-screen">
                {/* TOP BAR */}
                <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-5 md:px-9 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
                            <Menu size={22} />
                        </button>
                        <div>
                            <p className="font-bold text-slate-800">Doctor Workspace</p>
                            <p className="text-xs text-slate-400 hidden sm:block">Manage your healthcare practice</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-bold text-slate-800">Dr. {doctor.name || "Doctor"}</p>
                            <p className="text-xs text-slate-400">Medical Professional</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold overflow-hidden">
                            {displayedPhoto
                                ? <img src={displayedPhoto} alt="Doctor" className="w-full h-full object-cover" />
                                : (doctor.name?.charAt(0)?.toUpperCase() || "D")}
                        </div>
                    </div>
                </header>

                <main className="px-5 md:px-9 py-8 max-w-[1500px] mx-auto">
                    {/* WELCOME BANNER */}
                    <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-7 md:p-9 text-white mb-8 soft-shadow">
                        <div className="absolute -right-12 -top-24 w-72 h-72 rounded-full border-[35px] border-white/5" />
                        <div className="absolute right-40 -bottom-28 w-64 h-64 rounded-full bg-white/5" />

                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-xs font-semibold mb-4">
                                    <Activity size={14} />
                                    YOUR PRACTICE OVERVIEW
                                </div>
                                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                                    Good day, Dr. {doctor.name || "Doctor"}!
                                </h1>
                                <p className="text-blue-100 mt-3 max-w-xl text-sm md:text-base">
                                    Here's what's happening with your appointments. Keep track of your patients and manage your schedule.
                                </p>
                                <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-blue-100">
                                    <span className="flex items-center gap-2"><CalendarDays size={16} /> {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</span>
                                    <span className="flex items-center gap-2"><ShieldCheck size={16} /> Doctor account</span>
                                </div>
                            </div>

                            <button
                                onClick={() => document.getElementById("appointments")?.scrollIntoView({ behavior: "smooth" })}
                                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-blue-700 px-5 py-3 font-bold text-sm hover:bg-blue-50 transition shadow-lg"
                            >
                                View Appointments <ArrowUpRight size={17} />
                            </button>
                        </div>
                    </section>

                    {/* STATISTICS */}
                    <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                        {stats.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div key={stat.label} className="stat-card bg-white rounded-2xl border border-slate-100 p-5 soft-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[stat.color]}`}>
                                            <Icon size={23} />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-300">OVERVIEW</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-5">{stat.label}</p>
                                    <div className="flex items-end justify-between mt-1">
                                        <p className="text-3xl font-extrabold text-slate-800">{stat.value}</p>
                                        <ChevronRight size={19} className="text-slate-300 mb-1" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">{stat.note}</p>
                                </div>
                            );
                        })}
                    </section>

                    {/* TODAY + COMPLETED */}
                    <section className="grid md:grid-cols-2 gap-5 mb-9">
                        <div className="rounded-2xl bg-white border border-slate-100 p-6 soft-shadow flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <CalendarDays size={27} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Today's Appointments</p>
                                <p className="text-3xl font-extrabold text-slate-800 mt-1">{todayCount}</p>
                            </div>
                            <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-3 py-1.5">Today</span>
                        </div>

                        <div className="rounded-2xl bg-white border border-slate-100 p-6 soft-shadow flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CalendarCheck size={27} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Completed Appointments</p>
                                <p className="text-3xl font-extrabold text-slate-800 mt-1">{completedCount}</p>
                            </div>
                            <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-3 py-1.5">Completed</span>
                        </div>
                    </section>

                    {/* PROFILE PHOTO */}
                    <section id="profile-photo" className="bg-white border border-slate-100 rounded-2xl p-6 md:p-7 mb-9 soft-shadow scroll-mt-28">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="relative mx-auto md:mx-0 shrink-0">
                                <div className="w-28 h-28 rounded-full overflow-hidden bg-blue-50 border-4 border-blue-100 flex items-center justify-center">
                                    {displayedPhoto
                                        ? <img src={displayedPhoto} alt="Doctor profile" className="w-full h-full object-cover" />
                                        : <UserRound size={48} className="text-blue-500" />}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white hover:bg-blue-700"
                                    title="Choose profile photo"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">Personal Profile</span>
                                <h2 className="text-xl font-extrabold text-slate-800 mt-1">Your Profile Photo</h2>
                                <p className="text-sm text-slate-500 mt-1">Add a professional photo so patients can recognize you.</p>
                                <p className="text-xs text-slate-400 mt-2">JPG, PNG or WebP · Maximum 5 MB</p>

                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />

                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-50">
                                        <ImagePlus size={16} /> Choose Photo
                                    </button>

                                    {selectedPhoto && (
                                        <>
                                            <button onClick={uploadProfilePhoto} disabled={photoUploading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                                                <Upload size={16} /> {photoUploading ? "Uploading..." : "Upload Photo"}
                                            </button>
                                            <button onClick={cancelPhotoSelection} disabled={photoUploading} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50">
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>

                                {selectedPhoto && <p className="text-xs text-slate-400 mt-2">Selected: {selectedPhoto.name}</p>}
                                {photoMessage && <p className="text-sm text-emerald-600 mt-3">{photoMessage}</p>}
                                {photoError && <p className="text-sm text-rose-600 mt-3">{photoError}</p>}
                            </div>
                        </div>
                    </section>

                    {/* APPOINTMENTS */}
                    <section id="appointments" className="scroll-mt-28">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Patient Management</span>
                                <h2 className="text-2xl font-extrabold text-slate-800 mt-1">Appointments</h2>
                                <p className="text-sm text-slate-500 mt-1">Review patient requests and manage your schedule.</p>
                            </div>

                            <button onClick={fetchAppointments} disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 soft-shadow">
                                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>

                        {error && (
                            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* FILTER TABS */}
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                                        activeTab === tab.id
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                            : "bg-white border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600"
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`ml-2 text-xs ${activeTab === tab.id ? "text-blue-100" : "text-slate-400"}`}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* SEARCH */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-5 flex flex-col md:flex-row gap-3 soft-shadow">
                            <div className="relative flex-1">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search patient name, email or reason..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm focus:border-blue-400 focus:bg-white"
                                />
                            </div>

                            <div className="relative md:w-56">
                                <Filter size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-sm focus:border-blue-400 appearance-none"
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
                            <div className="bg-white border border-slate-100 rounded-2xl p-14 text-center soft-shadow">
                                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
                                <p className="text-slate-500 text-sm mt-4">Loading appointments...</p>
                            </div>
                        )}

                        {/* EMPTY */}
                        {!loading && filteredAppointments.length === 0 && (
                            <div className="bg-white border border-slate-100 rounded-2xl p-14 text-center soft-shadow">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                                    <CalendarDays size={29} className="text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mt-5">No appointments found</h3>
                                <p className="text-sm text-slate-400 mt-2">Try changing your search or filters.</p>
                            </div>
                        )}

                        {/* APPOINTMENT CARDS */}
                        {!loading && filteredAppointments.length > 0 && (
                            <div className="space-y-5">
                                {filteredAppointments.map(appointment => {
                                    const patient = appointment.patientId;
                                    const request = appointment.rescheduleRequest;

                                    return (
                                        <article key={appointment._id} className="appointment-card bg-white rounded-2xl border border-slate-100 p-5 md:p-6 soft-shadow">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center shrink-0">
                                                        <UserRound size={27} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-extrabold text-slate-800 text-lg">{patient?.name || "Patient"}</h3>
                                                        <p className="text-sm text-slate-400 mt-0.5">{patient?.email || "No email available"}</p>
                                                    </div>
                                                </div>

                                                <span className={`inline-flex items-center gap-2 self-start md:self-auto px-3.5 py-2 rounded-full border text-xs font-bold capitalize ${getStatusStyle(appointment.status)}`}>
                                                    {getStatusIcon(appointment.status)}
                                                    {appointment.status}
                                                </span>
                                            </div>

                                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><CalendarDays size={18} /></div>
                                                    <div><p className="text-xs text-slate-400">Appointment Date</p><p className="text-sm font-bold text-slate-700 mt-1">{appointment.date}</p></div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Clock3 size={18} /></div>
                                                    <div><p className="text-xs text-slate-400">Appointment Time</p><p className="text-sm font-bold text-slate-700 mt-1">{appointment.time}</p></div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Stethoscope size={18} /></div>
                                                    <div><p className="text-xs text-slate-400">Consultation Reason</p><p className="text-sm font-bold text-slate-700 mt-1">{appointment.reason || "General Consultation"}</p></div>
                                                </div>
                                            </div>

                                            {(patient?.phone || patient?.email) && (
                                                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-xs text-slate-400">
                                                    {patient?.email && <span className="flex items-center gap-2"><Mail size={14} />{patient.email}</span>}
                                                    {patient?.phone && <span className="flex items-center gap-2"><Phone size={14} />{patient.phone}</span>}
                                                </div>
                                            )}

                                            {appointment.status === "pending" && (
                                                <div className="flex flex-wrap justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
                                                    <button disabled={updatingId === appointment._id} onClick={() => updateStatus(appointment._id, "rejected")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 disabled:opacity-50">
                                                        <XCircle size={16} /> Reject
                                                    </button>
                                                    <button disabled={updatingId === appointment._id} onClick={() => updateStatus(appointment._id, "accepted")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">
                                                        <CheckCircle2 size={16} /> {updatingId === appointment._id ? "Updating..." : "Accept Appointment"}
                                                    </button>
                                                </div>
                                            )}

                                            {appointment.status === "accepted" && (
                                                <div className="flex justify-end mt-6 pt-5 border-t border-slate-100">
                                                    <button disabled={updatingId === appointment._id} onClick={() => updateStatus(appointment._id, "completed")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                                                        <CheckCircle2 size={16} /> {updatingId === appointment._id ? "Updating..." : "Mark as Completed"}
                                                    </button>
                                                </div>
                                            )}

                                            {request?.status && (
                                                <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/60 p-5">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center"><RefreshCw size={17} /></div>
                                                        <h4 className="font-bold text-slate-800">Reschedule Request</h4>
                                                        <span className={`ml-auto text-[11px] font-bold px-3 py-1.5 rounded-full ${
                                                            request.status === "pending" ? "bg-amber-100 text-amber-700" :
                                                            request.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                                                            "bg-rose-100 text-rose-700"
                                                        }`}>{request.status.toUpperCase()}</span>
                                                    </div>

                                                    <p className="text-xs text-slate-500 mt-3">Patient requested a change in appointment timing.</p>

                                                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                                                        <div className="bg-white rounded-xl p-3 border border-purple-100">
                                                            <p className="text-xs text-slate-400">Requested Date</p>
                                                            <p className="font-bold text-sm text-slate-700 mt-1">{request.date || "Not available"}</p>
                                                        </div>
                                                        <div className="bg-white rounded-xl p-3 border border-purple-100">
                                                            <p className="text-xs text-slate-400">Requested Time</p>
                                                            <p className="font-bold text-sm text-slate-700 mt-1">{request.time || "Not available"}</p>
                                                        </div>
                                                    </div>

                                                    {request.status === "pending" && (
                                                        <div className="flex flex-wrap justify-end gap-3 mt-4">
                                                            <button disabled={rescheduleLoadingId === appointment._id} onClick={() => respondToReschedule(appointment._id, "reject")} className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 disabled:opacity-50">Reject Request</button>
                                                            <button disabled={rescheduleLoadingId === appointment._id} onClick={() => respondToReschedule(appointment._id, "approve")} className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50">{rescheduleLoadingId === appointment._id ? "Updating..." : "Approve Request"}</button>
                                                        </div>
                                                    )}

                                                    {request.status === "approved" && <p className="text-sm text-emerald-700 font-semibold mt-4">Reschedule approved. Appointment timing has been updated.</p>}
                                                    {request.status === "rejected" && <p className="text-sm text-rose-600 font-semibold mt-4">Reschedule request was rejected. Original timing remains unchanged.</p>}
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <footer className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-400">
                        <p>© 2026 MediY. Healthcare made simpler.</p>
                        <p className="flex items-center gap-1"><HeartPulse size={14} className="text-blue-500" /> Caring for better health</p>
                    </footer>
                </main>
            </div>
        </div>
    );
}

export default DoctorDashboard;
