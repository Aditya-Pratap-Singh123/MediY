
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    HeartPulse,
    Stethoscope,
    MapPin,
    GraduationCap,
    BriefcaseMedical,
    IndianRupee,
    CalendarDays,
    Clock,
    Phone,
    Mail,
    ArrowLeft,
    AlertCircle,
    UserRound
} from "lucide-react";

function DoctorProfile() {
    const { doctorId } = useParams();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `https://mediy.onrender.com/api/doctors/${doctorId}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load doctor profile");
                }

                setDoctor(data.doctor);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (doctorId) {
            fetchDoctor();
        }
    }, [doctorId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sky-50">
                <p className="text-blue-600 font-medium text-lg">
                    Loading doctor profile...
                </p>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 px-5">
                <AlertCircle size={45} className="text-red-500 mb-4" />

                <h2 className="text-2xl font-bold text-slate-800">
                    Doctor Profile Not Found
                </h2>

                <p className="text-slate-500 mt-2">
                    {error || "Doctor details are unavailable."}
                </p>

                <Link
                    to="/doctors"
                    className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl"
                >
                    Back to Doctors
                </Link>
            </div>
        );
    }

    const doctorName = doctor.userId?.name || "Doctor";

    return (
        <div className="min-h-screen bg-sky-50/60">

            {/* Navbar */}
            <nav className="bg-white border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <HeartPulse size={23} className="text-white" />
                        </div>

                        <span className="text-2xl font-bold text-slate-800">
                            Medi<span className="text-blue-600">Y</span>
                        </span>
                    </Link>

                    <Link
                        to="/doctors"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft size={18} />
                        All Doctors
                    </Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-5 py-10">

                {/* Doctor Header */}
                <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">

                    <div className="bg-gradient-to-r from-blue-700 to-sky-500 h-36" />

                    <div className="px-6 md:px-10 pb-8">

                        <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-14">

                            {/* DOCTOR PROFILE PHOTO */}
                            <div className="w-28 h-28 rounded-3xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">

                                {doctor.profileImage && !imageError ? (
                                    <img
                                        src={doctor.profileImage}
                                        alt={doctorName}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <UserRound
                                        size={55}
                                        className="text-blue-600"
                                    />
                                )}

                            </div>

                            <div className="flex-1 pt-2 md:pt-0">

                                <h1 className="text-3xl font-bold text-slate-800">
                                    Dr. {doctorName}
                                </h1>

                                <p className="text-blue-600 font-semibold mt-1">
                                    {doctor.specialization}
                                </p>

                            </div>

                            <Link
                                to={`/book/${doctor._id}`}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                            >
                                <CalendarDays size={19} />
                                Book Appointment
                            </Link>

                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="grid lg:grid-cols-3 gap-6 mt-7">

                    <div className="lg:col-span-2 space-y-6">

                        {/* About */}
                        <section className="bg-white p-7 rounded-2xl border border-blue-100 shadow-sm">

                            <h2 className="text-xl font-bold text-slate-800 mb-4">
                                About Doctor
                            </h2>

                            <p className="text-slate-600 leading-7">
                                {doctor.about || "No information has been added yet."}
                            </p>

                        </section>

                        {/* Professional Information */}
                        <section className="bg-white p-7 rounded-2xl border border-blue-100 shadow-sm">

                            <h2 className="text-xl font-bold text-slate-800 mb-6">
                                Professional Information
                            </h2>

                            <div className="grid sm:grid-cols-2 gap-6">

                                <div className="flex gap-3">
                                    <GraduationCap className="text-blue-600 shrink-0" size={24} />
                                    <div>
                                        <p className="text-sm text-slate-500">Qualification</p>
                                        <p className="font-semibold text-slate-800">
                                            {doctor.qualification}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <BriefcaseMedical className="text-blue-600 shrink-0" size={24} />
                                    <div>
                                        <p className="text-sm text-slate-500">Experience</p>
                                        <p className="font-semibold text-slate-800">
                                            {doctor.experience} years
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <IndianRupee className="text-blue-600 shrink-0" size={24} />
                                    <div>
                                        <p className="text-sm text-slate-500">Consultation Fees</p>
                                        <p className="font-semibold text-slate-800">
                                            ₹{doctor.fees}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Stethoscope className="text-blue-600 shrink-0" size={24} />
                                    <div>
                                        <p className="text-sm text-slate-500">Registration Number</p>
                                        <p className="font-semibold text-slate-800">
                                            {doctor.registrationNumber}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </section>

                        {/* Availability */}
                        <section className="bg-white p-7 rounded-2xl border border-blue-100 shadow-sm">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Weekly Availability
                            </h2>

                            {doctor.availability?.length > 0 ? (
                                <div className="space-y-3">

                                    {doctor.availability.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-sky-50 p-4 rounded-xl"
                                        >

                                            <div className="flex items-center gap-3">
                                                <CalendarDays size={19} className="text-blue-600" />
                                                <span className="font-semibold text-slate-700">
                                                    {item.day}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Clock size={17} className="text-blue-600" />
                                                {item.startTime} - {item.endTime}
                                            </div>

                                        </div>
                                    ))}

                                </div>
                            ) : (
                                <p className="text-slate-500">
                                    Availability has not been added yet.
                                </p>
                            )}

                        </section>
                    </div>

                    {/* Clinic and Contact */}
                    <aside className="space-y-6">

                        <section className="bg-white p-7 rounded-2xl border border-blue-100 shadow-sm">

                            <h2 className="text-xl font-bold text-slate-800 mb-6">
                                Clinic Information
                            </h2>

                            <div className="flex gap-3 mb-6">
                                <Stethoscope size={22} className="text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-sm text-slate-500">Hospital / Clinic</p>
                                    <p className="font-semibold text-slate-800">
                                        {doctor.hospitalName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <MapPin size={22} className="text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-sm text-slate-500">City</p>
                                    <p className="font-semibold text-slate-800">
                                        {doctor.city}
                                    </p>
                                </div>
                            </div>

                        </section>

                        <section className="bg-white p-7 rounded-2xl border border-blue-100 shadow-sm">

                            <h2 className="text-xl font-bold text-slate-800 mb-6">
                                Contact Information
                            </h2>

                            <div className="flex gap-3 mb-5">
                                <Mail size={20} className="text-blue-600 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-500">Email</p>
                                    <p className="font-medium text-slate-800 break-all">
                                        {doctor.userId?.email || "Not available"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Phone size={20} className="text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-sm text-slate-500">Phone</p>
                                    <p className="font-medium text-slate-800">
                                        {doctor.userId?.phone || "Not available"}
                                    </p>
                                </div>
                            </div>

                        </section>

                        <Link
                            to={`/book/${doctor._id}`}
                            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white p-4 rounded-xl font-semibold hover:bg-blue-700 transition"
                        >
                            <CalendarDays size={19} />
                            Book Appointment Now
                        </Link>

                    </aside>
                </div>
            </main>
        </div>
    );
}

export default DoctorProfile;
