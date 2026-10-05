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
    FileText
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

function Register() {
    const navigate = useNavigate();

    const [role, setRole] = useState("patient");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",

        // Doctor details
        specialization: "",
        qualification: "",
        experience: "",
        fees: "",
        about: "",

        // Required Doctor fields
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
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================
    // HANDLE INPUT CHANGE
    // =====================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // =====================================
    // HANDLE ROLE CHANGE
    // =====================================

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
                availability: [
                    {
                        day: "Monday",
                        startTime: "09:00",
                        endTime: "17:00"
                    }
                ]
            }));
        }
    };

    // =====================================
    // AVAILABILITY CHANGE
    // =====================================

    const handleAvailabilityChange = (index, field, value) => {
        const updatedAvailability = [...formData.availability];

        updatedAvailability[index] = {
            ...updatedAvailability[index],
            [field]: value
        };

        setFormData({
            ...formData,
            availability: updatedAvailability
        });
    };

    // =====================================
    // ADD AVAILABILITY
    // =====================================

    const addAvailability = () => {
        setFormData({
            ...formData,
            availability: [
                ...formData.availability,
                {
                    day: "Monday",
                    startTime: "09:00",
                    endTime: "17:00"
                }
            ]
        });
    };

    // =====================================
    // REMOVE AVAILABILITY
    // =====================================

    const removeAvailability = (index) => {
        if (formData.availability.length === 1) {
            return;
        }

        const updatedAvailability = formData.availability.filter(
            (_, i) => i !== index
        );

        setFormData({
            ...formData,
            availability: updatedAvailability
        });
    };

    // =====================================
    // SUBMIT
    // =====================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            // =====================================
            // BASIC VALIDATION
            // =====================================

            if (!formData.name.trim()) {
                throw new Error("Please enter your name.");
            }

            if (!formData.email.trim()) {
                throw new Error("Please enter your email.");
            }

            if (!formData.phone.trim()) {
                throw new Error("Please enter your phone number.");
            }

            if (!formData.password.trim()) {
                throw new Error("Please enter a password.");
            }

            // =====================================
            // DOCTOR VALIDATION
            // =====================================

            if (role === "doctor") {
                if (!formData.specialization.trim()) {
                    throw new Error(
                        "Please enter your specialization."
                    );
                }

                if (!formData.qualification.trim()) {
                    throw new Error(
                        "Please enter your qualification."
                    );
                }

                if (
                    formData.experience === "" ||
                    Number(formData.experience) < 0
                ) {
                    throw new Error(
                        "Please enter valid years of experience."
                    );
                }

                if (
                    formData.fees === "" ||
                    Number(formData.fees) < 0
                ) {
                    throw new Error(
                        "Please enter a valid consultation fee."
                    );
                }

                if (!formData.about.trim()) {
                    throw new Error(
                        "Please enter some information about yourself."
                    );
                }

                // NEW REQUIRED FIELDS

                if (!formData.city.trim()) {
                    throw new Error(
                        "Please enter your city."
                    );
                }

                if (!formData.hospitalName.trim()) {
                    throw new Error(
                        "Please enter your hospital/clinic name."
                    );
                }

                if (!formData.registrationNumber.trim()) {
                    throw new Error(
                        "Please enter your medical registration number."
                    );
                }

                if (formData.availability.length === 0) {
                    throw new Error(
                        "Please add at least one availability."
                    );
                }
            }

            // =====================================
            // REGISTER
            // =====================================

            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password,
                        role,

                        ...(role === "doctor" && {
                            specialization:
                                formData.specialization,

                            qualification:
                                formData.qualification,

                            experience:
                                Number(formData.experience),

                            fees:
                                Number(formData.fees),

                            about:
                                formData.about,

                            // NEW REQUIRED FIELDS

                            city:
                                formData.city,

                            hospitalName:
                                formData.hospitalName,

                            registrationNumber:
                                formData.registrationNumber,

                            availability:
                                formData.availability
                        })
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed"
                );
            }

            alert("Registration successful!");

            navigate("/login");

        } catch (error) {
            console.error(
                "Registration Error:",
                error
            );

            setError(error.message);

        } finally {
            setLoading(false);
        }
    };

    // =====================================
    // UI
    // =====================================

    return (
        <div className="min-h-screen bg-sky-50/40 flex items-center justify-center px-6 py-10">

            <div className="w-full max-w-2xl">

                {/* LOGO */}

                <Link
                    to="/"
                    className="flex items-center justify-center gap-2 mb-8"
                >
                    <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">

                        <HeartPulse
                            size={24}
                            className="text-white"
                        />

                    </div>

                    <span className="text-3xl font-bold text-slate-800">
                        Medi
                        <span className="text-blue-600">
                            Y
                        </span>
                    </span>

                </Link>

                {/* CARD */}

                <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-8">

                    {/* HEADER */}

                    <div className="text-center mb-8">

                        <h1 className="text-2xl font-bold text-slate-800">
                            Create your account
                        </h1>

                        <p className="text-slate-500 mt-2">
                            Join MediY and manage your healthcare easily.
                        </p>

                    </div>

                    {/* ROLE */}

                    <div className="mb-6">

                        <p className="text-sm font-medium text-slate-700 mb-3">
                            I am a
                        </p>

                        <div className="grid grid-cols-2 gap-3">

                            {/* PATIENT */}

                            <button
                                type="button"
                                onClick={() =>
                                    handleRoleChange("patient")
                                }
                                className={`p-4 rounded-xl border transition ${
                                    role === "patient"
                                        ? "border-blue-600 bg-blue-50 text-blue-600"
                                        : "border-slate-200 text-slate-600 hover:border-blue-200"
                                }`}
                            >

                                <UserRound
                                    size={24}
                                    className="mx-auto mb-2"
                                />

                                <span className="font-medium">
                                    Patient
                                </span>

                            </button>

                            {/* DOCTOR */}

                            <button
                                type="button"
                                onClick={() =>
                                    handleRoleChange("doctor")
                                }
                                className={`p-4 rounded-xl border transition ${
                                    role === "doctor"
                                        ? "border-blue-600 bg-blue-50 text-blue-600"
                                        : "border-slate-200 text-slate-600 hover:border-blue-200"
                                }`}
                            >

                                <Stethoscope
                                    size={24}
                                    className="mx-auto mb-2"
                                />

                                <span className="font-medium">
                                    Doctor
                                </span>

                            </button>

                        </div>
                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* FORM */}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* NAME */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Full Name
                            </label>

                            <div className="relative">

                                <User
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                        </div>

                        {/* EMAIL */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>

                            <div className="relative">

                                <Mail
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                        </div>

                        {/* PHONE */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Phone
                            </label>

                            <div className="relative">

                                <Phone
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                        </div>

                        {/* PASSWORD */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>

                            <div className="relative">

                                <Lock
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                        </div>

                        {/* =====================================
                            DOCTOR DETAILS
                        ===================================== */}

                        {role === "doctor" && (

                            <div className="mt-8 pt-7 border-t border-slate-200">

                                <div className="mb-6">

                                    <h2 className="text-xl font-bold text-slate-800">
                                        Professional Details
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Tell patients about your medical
                                        expertise.
                                    </p>

                                </div>

                                {/* SPECIALIZATION */}

                                <div className="mb-5">

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Specialization
                                    </label>

                                    <div className="relative">

                                        <Stethoscope
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="text"
                                            name="specialization"
                                            value={
                                                formData.specialization
                                            }
                                            onChange={handleChange}
                                            placeholder="e.g. Cardiologist"
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                                {/* QUALIFICATION */}

                                <div className="mb-5">

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Qualification
                                    </label>

                                    <div className="relative">

                                        <GraduationCap
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="text"
                                            name="qualification"
                                            value={
                                                formData.qualification
                                            }
                                            onChange={handleChange}
                                            placeholder="e.g. MBBS, MD"
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                                {/* HOSPITAL + CITY */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    {/* HOSPITAL */}

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Hospital / Clinic
                                        </label>

                                        <div className="relative">

                                            <Building2
                                                size={18}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                type="text"
                                                name="hospitalName"
                                                value={
                                                    formData.hospitalName
                                                }
                                                onChange={handleChange}
                                                placeholder="e.g. City Hospital"
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>

                                    {/* CITY */}

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            City
                                        </label>

                                        <div className="relative">

                                            <MapPin
                                                size={18}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                type="text"
                                                name="city"
                                                value={
                                                    formData.city
                                                }
                                                onChange={handleChange}
                                                placeholder="e.g. Delhi"
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>

                                </div>

                                {/* REGISTRATION NUMBER */}

                                <div className="mt-5">

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Medical Registration Number
                                    </label>

                                    <div className="relative">

                                        <FileText
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="text"
                                            name="registrationNumber"
                                            value={
                                                formData.registrationNumber
                                            }
                                            onChange={handleChange}
                                            placeholder="Enter your medical registration number"
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                                {/* EXPERIENCE + FEES */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                                    {/* EXPERIENCE */}

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Years of Experience
                                        </label>

                                        <div className="relative">

                                            <BriefcaseMedical
                                                size={18}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                type="number"
                                                name="experience"
                                                min="0"
                                                max="70"
                                                value={
                                                    formData.experience
                                                }
                                                onChange={handleChange}
                                                placeholder="e.g. 8"
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>

                                    {/* FEES */}

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Consultation Fee
                                        </label>

                                        <div className="relative">

                                            <IndianRupee
                                                size={18}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                type="number"
                                                name="fees"
                                                min="0"
                                                value={
                                                    formData.fees
                                                }
                                                onChange={handleChange}
                                                placeholder="e.g. 500"
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>

                                    </div>

                                </div>

                                {/* ABOUT */}

                                <div className="mt-5">

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        About Doctor
                                    </label>

                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleChange}
                                        placeholder="Write a short description about your experience, expertise and medical practice..."
                                        rows={4}
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                                {/* =====================================
                                    AVAILABILITY
                                ===================================== */}

                                <div className="mt-7">

                                    <div className="flex items-center justify-between mb-4">

                                        <div>

                                            <h3 className="font-semibold text-slate-800">
                                                Availability
                                            </h3>

                                            <p className="text-xs text-slate-500 mt-1">
                                                Set the days and timings when
                                                patients can book appointments.
                                            </p>

                                        </div>

                                        <CalendarDays
                                            size={22}
                                            className="text-blue-600"
                                        />

                                    </div>

                                    <div className="space-y-4">

                                        {formData.availability.map(
                                            (item, index) => (

                                                <div
                                                    key={index}
                                                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl"
                                                >

                                                    {/* DAY */}

                                                    <div className="mb-4">

                                                        <label className="block text-xs font-medium text-slate-600 mb-2">
                                                            Day
                                                        </label>

                                                        <select
                                                            value={item.day}
                                                            onChange={(e) =>
                                                                handleAvailabilityChange(
                                                                    index,
                                                                    "day",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500"
                                                        >

                                                            <option value="Monday">
                                                                Monday
                                                            </option>

                                                            <option value="Tuesday">
                                                                Tuesday
                                                            </option>

                                                            <option value="Wednesday">
                                                                Wednesday
                                                            </option>

                                                            <option value="Thursday">
                                                                Thursday
                                                            </option>

                                                            <option value="Friday">
                                                                Friday
                                                            </option>

                                                            <option value="Saturday">
                                                                Saturday
                                                            </option>

                                                            <option value="Sunday">
                                                                Sunday
                                                            </option>

                                                        </select>

                                                    </div>

                                                    {/* TIME */}

                                                    <div className="grid grid-cols-2 gap-3">

                                                        {/* START TIME */}

                                                        <div>

                                                            <label className="block text-xs font-medium text-slate-600 mb-2">
                                                                Start Time
                                                            </label>

                                                            <div className="relative">

                                                                <Clock
                                                                    size={16}
                                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                                />

                                                                <input
                                                                    type="time"
                                                                    value={
                                                                        item.startTime
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleAvailabilityChange(
                                                                            index,
                                                                            "startTime",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="w-full pl-9 pr-2 py-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500"
                                                                />

                                                            </div>

                                                        </div>

                                                        {/* END TIME */}

                                                        <div>

                                                            <label className="block text-xs font-medium text-slate-600 mb-2">
                                                                End Time
                                                            </label>

                                                            <div className="relative">

                                                                <Clock
                                                                    size={16}
                                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                                />

                                                                <input
                                                                    type="time"
                                                                    value={
                                                                        item.endTime
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleAvailabilityChange(
                                                                            index,
                                                                            "endTime",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="w-full pl-9 pr-2 py-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500"
                                                                />

                                                            </div>

                                                        </div>

                                                    </div>

                                                    {/* REMOVE */}

                                                    {formData.availability.length > 1 && (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeAvailability(
                                                                    index
                                                                )
                                                            }
                                                            className="mt-3 text-sm text-red-500 hover:text-red-600"
                                                        >
                                                            Remove
                                                        </button>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </div>

                                    {/* ADD */}

                                    <button
                                        type="button"
                                        onClick={addAvailability}
                                        className="mt-4 w-full py-2.5 border border-blue-200 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition"
                                    >
                                        + Add Another Day
                                    </button>

                                </div>

                            </div>
                        )}

                        {/* SUBMIT */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 mt-7"
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                    </form>

                    {/* LOGIN */}

                    <p className="text-center text-sm text-slate-500 mt-6">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="text-blue-600 font-medium hover:text-blue-700"
                        >
                            Login
                        </Link>

                    </p>

                </div>
            </div>
        </div>
    );
}

export default Register;