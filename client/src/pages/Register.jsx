
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HeartPulse,
    UserRound,
    Stethoscope,
    Mail,
    Lock,
    Phone,
    User,
    GraduationCap,
    BriefcaseMedical,
    IndianRupee,
    CalendarDays,
    Clock,
    MapPin,
    Building2,
    FileText,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Plus,
    Trash2,
    Activity,
    CheckCircle2
} from "lucide-react";

const API_BASE_URL = "https://mediy-1.onrender.com";

const initialFormData = {
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
    qualification: "",
    experience: "",
    fees: "",
    about: "",
    city: "",
    hospitalName: "",
    registrationNumber: "",
    availability: [
        {
            day: "Monday",
            startTime: "09:00",
            endTime: "17:00"
        }
    ]
};

function Register() {
    const navigate = useNavigate();

    const [role, setRole] = useState("patient");
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setError("");

        if (newRole === "patient") {
            setFormData((prev) => ({
                ...prev,
                specialization: "",
                qualification: "",
                experience: "",
                fees: "",
                about: "",
                city: "",
                hospitalName: "",
                registrationNumber: "",
                availability: initialFormData.availability
            }));
        }
    };

    const handleAvailabilityChange = (index, field, value) => {
        setFormData((prev) => {
            const updated = [...prev.availability];

            updated[index] = {
                ...updated[index],
                [field]: value
            };

            return {
                ...prev,
                availability: updated
            };
        });
    };

    const addAvailability = () => {
        setFormData((prev) => ({
            ...prev,
            availability: [
                ...prev.availability,
                {
                    day: "Monday",
                    startTime: "09:00",
                    endTime: "17:00"
                }
            ]
        }));
    };

    const removeAvailability = (index) => {
        setFormData((prev) => ({
            ...prev,
            availability: prev.availability.filter(
                (_, i) => i !== index
            )
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            throw new Error("Please enter your full name.");
        }

        if (!formData.email.trim()) {
            throw new Error("Please enter your email.");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            throw new Error("Please enter a valid email address.");
        }

        if (!formData.phone.trim()) {
            throw new Error("Please enter your phone number.");
        }

        if (!formData.password.trim()) {
            throw new Error("Please enter a password.");
        }

        if (formData.password.length < 6) {
            throw new Error("Password must be at least 6 characters.");
        }

        if (role === "doctor") {
            if (!formData.specialization.trim()) {
                throw new Error("Please enter your specialization.");
            }

            if (!formData.qualification.trim()) {
                throw new Error("Please enter your qualification.");
            }

            if (
                formData.experience === "" ||
                Number(formData.experience) < 0
            ) {
                throw new Error("Please enter valid years of experience.");
            }

            if (
                formData.fees === "" ||
                Number(formData.fees) < 0
            ) {
                throw new Error("Please enter a valid consultation fee.");
            }

            if (!formData.about.trim()) {
                throw new Error("Please enter information about yourself.");
            }

            if (!formData.city.trim()) {
                throw new Error("Please enter your city.");
            }

            if (!formData.hospitalName.trim()) {
                throw new Error("Please enter your hospital/clinic name.");
            }

            if (!formData.registrationNumber.trim()) {
                throw new Error("Please enter your medical registration number.");
            }

            if (formData.availability.length === 0) {
                throw new Error("Please add at least one availability.");
            }

            for (const item of formData.availability) {
                if (item.startTime >= item.endTime) {
                    throw new Error(
                        `End time must be after start time for ${item.day}.`
                    );
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            validateForm();
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        phone: formData.phone.trim(),
                        password: formData.password,
                        role,

                        ...(role === "doctor" && {
                            specialization: formData.specialization.trim(),
                            qualification: formData.qualification.trim(),
                            experience: Number(formData.experience),
                            fees: Number(formData.fees),
                            about: formData.about.trim(),
                            city: formData.city.trim(),
                            hospitalName: formData.hospitalName.trim(),
                            registrationNumber: formData.registrationNumber.trim(),
                            availability: formData.availability
                        })
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed.");
            }

            alert("Registration successful! Please login to continue.");
            navigate("/login", { replace: true });

        } catch (error) {
            console.error("Registration Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition";

    const labelClass =
        "block text-sm font-bold text-slate-700 mb-2";

    const iconClass =
        "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex flex-col">

            {/* NAVBAR */}
            <nav className="bg-white/90 backdrop-blur-xl border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">

                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <HeartPulse size={25} className="text-white" />
                        </div>

                        <span className="text-2xl font-extrabold text-slate-900">
                            Medi<span className="text-blue-600">Y</span>
                        </span>
                    </Link>

                    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition">
                        <ArrowLeft size={17} />
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* MAIN */}
            <main className="flex-1 px-4 sm:px-6 py-10 sm:py-14">

                <div className="max-w-5xl mx-auto">

                    {/* PAGE HEADER */}
                    <div className="text-center mb-9">

                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-5">
                            <Activity size={16} />
                            JOIN THE MEDIY COMMUNITY
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
                            Create your account
                        </h1>

                        <p className="text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed">
                            Join MediY to connect with healthcare professionals
                            and manage your healthcare journey.
                        </p>
                    </div>

                    {/* FORM CARD */}
                    <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-100/70 border border-blue-100 overflow-hidden">

                        {/* CARD TOP */}
                        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 sm:px-10 py-7 text-white">

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                                    <HeartPulse size={30} />
                                </div>

                                <div>
                                    <h2 className="text-xl sm:text-2xl font-extrabold">
                                        Let's get started
                                    </h2>
                                    <p className="text-blue-100 text-sm mt-1">
                                        Fill in your details to create your MediY account.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 sm:p-10 lg:p-12">

                            {/* ROLE SELECTION */}
                            <div className="mb-9">

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-800">
                                            Choose your account type
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Select how you want to use MediY.
                                        </p>
                                    </div>

                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-full">
                                        STEP 01
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    <button
                                        type="button"
                                        onClick={() => handleRoleChange("patient")}
                                        className={`relative p-5 rounded-2xl border-2 text-left transition ${
                                            role === "patient"
                                                ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                                                : "border-slate-200 hover:border-blue-300"
                                        }`}
                                    >
                                        {role === "patient" && (
                                            <CheckCircle2 className="absolute top-4 right-4 text-blue-600" size={21} />
                                        )}

                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                            role === "patient"
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-slate-500"
                                        }`}>
                                            <UserRound size={25} />
                                        </div>

                                        <h4 className="font-extrabold text-slate-800">
                                            Patient
                                        </h4>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Book appointments and connect with doctors.
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRoleChange("doctor")}
                                        className={`relative p-5 rounded-2xl border-2 text-left transition ${
                                            role === "doctor"
                                                ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                                                : "border-slate-200 hover:border-blue-300"
                                        }`}
                                    >
                                        {role === "doctor" && (
                                            <CheckCircle2 className="absolute top-4 right-4 text-blue-600" size={21} />
                                        )}

                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                            role === "doctor"
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-slate-500"
                                        }`}>
                                            <Stethoscope size={25} />
                                        </div>

                                        <h4 className="font-extrabold text-slate-800">
                                            Doctor
                                        </h4>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Create your professional medical profile.
                                        </p>
                                    </button>

                                </div>
                            </div>

                            {error && (
                                <div role="alert" className="mb-7 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-9">

                                {/* BASIC DETAILS */}
                                <section>

                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-extrabold text-slate-800">
                                                Personal Information
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Enter your basic account details.
                                            </p>
                                        </div>

                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-full">
                                            STEP 02
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                        <div>
                                            <label className={labelClass}>Full Name</label>
                                            <div className="relative">
                                                <User size={19} className={iconClass} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    required
                                                    autoComplete="name"
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Email Address</label>
                                            <div className="relative">
                                                <Mail size={19} className={iconClass} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Enter your email"
                                                    required
                                                    autoComplete="email"
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Phone Number</label>
                                            <div className="relative">
                                                <Phone size={19} className={iconClass} />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="Enter your phone number"
                                                    required
                                                    autoComplete="tel"
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Password</label>
                                            <div className="relative">
                                                <Lock size={19} className={iconClass} />
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="Create a password"
                                                    required
                                                    autoComplete="new-password"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">
                                                Minimum 6 characters.
                                            </p>
                                        </div>

                                    </div>
                                </section>

                                {/* DOCTOR DETAILS */}
                                {role === "doctor" && (
                                    <section className="pt-9 border-t border-slate-200 space-y-7">

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-extrabold text-slate-800">
                                                    Professional Details
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Share your medical qualifications and practice details.
                                                </p>
                                            </div>

                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-full">
                                                STEP 03
                                            </span>
                                        </div>

                                        {/* SPECIALIZATION AND QUALIFICATION */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                            <div>
                                                <label className={labelClass}>Specialization</label>
                                                <div className="relative">
                                                    <Stethoscope size={19} className={iconClass} />
                                                    <input
                                                        type="text"
                                                        name="specialization"
                                                        value={formData.specialization}
                                                        onChange={handleChange}
                                                        placeholder="e.g. Cardiologist"
                                                        required
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Qualification</label>
                                                <div className="relative">
                                                    <GraduationCap size={19} className={iconClass} />
                                                    <input
                                                        type="text"
                                                        name="qualification"
                                                        value={formData.qualification}
                                                        onChange={handleChange}
                                                        placeholder="e.g. MBBS, MD"
                                                        required
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                        </div>

                                        {/* HOSPITAL AND CITY */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                            <div>
                                                <label className={labelClass}>Hospital / Clinic</label>
                                                <div className="relative">
                                                    <Building2 size={19} className={iconClass} />
                                                    <input
                                                        type="text"
                                                        name="hospitalName"
                                                        value={formData.hospitalName}
                                                        onChange={handleChange}
                                                        placeholder="Enter hospital name"
                                                        required
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelClass}>City</label>
                                                <div className="relative">
                                                    <MapPin size={19} className={iconClass} />
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        placeholder="Enter your city"
                                                        required
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                        </div>

                                        {/* REGISTRATION NUMBER */}
                                        <div>
                                            <label className={labelClass}>Medical Registration Number</label>
                                            <div className="relative">
                                                <FileText size={19} className={iconClass} />
                                                <input
                                                    type="text"
                                                    name="registrationNumber"
                                                    value={formData.registrationNumber}
                                                    onChange={handleChange}
                                                    placeholder="Enter your registration number"
                                                    required
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        {/* EXPERIENCE AND FEES */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                            <div>
                                                <label className={labelClass}>Years of Experience</label>
                                                <div className="relative">
                                                    <BriefcaseMedical size={19} className={iconClass} />
                                                    <input
                                                        type="number"
                                                        name="experience"
                                                        min="0"
                                                        max="70"
                                                        value={formData.experience}
                                                        onChange={handleChange}
                                                        placeholder="e.g. 8"
                                                        required
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelClass}>Consultation Fee (₹)</label>
                                                <div className="relative">
                                                    <IndianRupee size={19} className={iconClass} />
                                                    <input
                                                        type="number"
                                                        name="fees"
                                                        min="0"
                                                        value={formData.fees}
                                                        onChange={handleChange}
                                                        placeholder="e.g. 500"
                                                        required
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                        </div>

                                        {/* ABOUT */}
                                        <div>
                                            <label className={labelClass}>About Doctor</label>
                                            <textarea
                                                name="about"
                                                value={formData.about}
                                                onChange={handleChange}
                                                placeholder="Write about your medical experience, expertise and practice..."
                                                rows={4}
                                                required
                                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-y text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                                            />
                                        </div>

                                        {/* AVAILABILITY */}
                                        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 sm:p-6">

                                            <div className="flex items-center justify-between gap-3 mb-5">
                                                <div>
                                                    <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
                                                        <CalendarDays size={19} className="text-blue-600" />
                                                        Availability Schedule
                                                    </h4>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Set your appointment days and timings.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">

                                                {formData.availability.map((item, index) => (
                                                    <div key={index} className="bg-white border border-blue-100 rounded-xl p-4">

                                                        <div className="flex items-center justify-between mb-4">
                                                            <span className="text-sm font-bold text-slate-700">
                                                                Schedule {index + 1}
                                                            </span>

                                                            {formData.availability.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeAvailability(index)}
                                                                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                                                    Day
                                                                </label>
                                                                <select
                                                                    value={item.day}
                                                                    onChange={(e) => handleAvailabilityChange(index, "day", e.target.value)}
                                                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                                                >
                                                                    {[
                                                                        "Monday",
                                                                        "Tuesday",
                                                                        "Wednesday",
                                                                        "Thursday",
                                                                        "Friday",
                                                                        "Saturday",
                                                                        "Sunday"
                                                                    ].map((day) => (
                                                                        <option key={day} value={day}>
                                                                            {day}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                                                    Start Time
                                                                </label>
                                                                <div className="relative">
                                                                    <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                    <input
                                                                        type="time"
                                                                        value={item.startTime}
                                                                        onChange={(e) => handleAvailabilityChange(index, "startTime", e.target.value)}
                                                                        required
                                                                        className="w-full pl-9 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                                                    End Time
                                                                </label>
                                                                <div className="relative">
                                                                    <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                    <input
                                                                        type="time"
                                                                        value={item.endTime}
                                                                        onChange={(e) => handleAvailabilityChange(index, "endTime", e.target.value)}
                                                                        required
                                                                        className="w-full pl-9 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                                                    />
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                ))}

                                            </div>

                                            <button
                                                type="button"
                                                onClick={addAvailability}
                                                className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl font-bold hover:bg-blue-100/60 transition"
                                            >
                                                <Plus size={18} />
                                                Add Another Day
                                            </button>

                                        </div>
                                    </section>
                                )}

                                {/* SUBMIT */}
                                <div className="pt-7 border-t border-slate-200">

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-xl font-extrabold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                Create {role === "doctor" ? "Doctor" : "Patient"} Account
                                                <ArrowRight size={19} />
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-2 mt-5 text-xs text-slate-400">
                                        <ShieldCheck size={15} />
                                        Your information is securely handled by MediY.
                                    </div>
                                </div>

                            </form>

                            {/* LOGIN LINK */}
                            <div className="text-center mt-8 pt-7 border-t border-slate-100">
                                <p className="text-sm text-slate-500">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-blue-600 font-extrabold hover:text-blue-700">
                                        Login here
                                    </Link>
                                </p>
                            </div>

                        </div>
                    </div>

                    <p className="text-center text-sm text-slate-400 mt-7">
                        © 2026 MediY · Your health, our priority.
                    </p>

                </div>
            </main>
        </div>
    );
}

export default Register;
