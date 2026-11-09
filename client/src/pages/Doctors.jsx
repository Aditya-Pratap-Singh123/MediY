
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    HeartPulse,
    Stethoscope,
    Search,
    MapPin,
    ArrowRight,
    CalendarDays,
    UserRound
} from "lucide-react";

function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await fetch(
                "- https://mediy.onrender.com/api/doctors"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch doctors"
                );
            }

            setDoctors(data.doctors || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter((doctor) => {
        const name =
            doctor.userId?.name ||
            doctor.name ||
            "";

        const specialization = doctor.specialization || "";
        const searchText = search.toLowerCase();

        return (
            name.toLowerCase().includes(searchText) ||
            specialization.toLowerCase().includes(searchText)
        );
    });

    return (
        <div className="min-h-screen bg-sky-50/40">

            {/* NAVBAR */}
            <nav className="bg-blue-50 border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <HeartPulse size={23} className="text-white" />
                        </div>

                        <span className="text-2xl font-bold text-slate-800">
                            Medi<span className="text-blue-600">Y</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-slate-600 hover:text-blue-600">
                            Home
                        </Link>

                        <Link to="/login" className="text-slate-600 hover:text-blue-600">
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            {/* MAIN */}
            <main className="max-w-7xl mx-auto px-6 py-12">

                {/* HEADING */}
                <div className="text-center max-w-2xl mx-auto">
                    <p className="text-blue-600 font-medium">
                        FIND A DOCTOR
                    </p>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mt-2">
                        Find the right doctor for you
                    </h1>

                    <p className="text-slate-500 mt-4">
                        Browse our doctors and find a healthcare
                        professional for your needs.
                    </p>
                </div>

                {/* SEARCH */}
                <div className="max-w-xl mx-auto mt-8">
                    <div className="relative">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by doctor name or specialization..."
                            className="w-full pl-12 pr-5 py-4 bg-white border border-blue-100 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                        />
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="max-w-xl mx-auto mt-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-center">
                        {error}
                    </div>
                )}

                {/* LOADING */}
                {loading && (
                    <div className="text-center py-16">
                        <p className="text-slate-500">
                            Loading doctors...
                        </p>
                    </div>
                )}

                {/* NO DOCTORS */}
                {!loading && !error && filteredDoctors.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                            <Stethoscope size={30} className="text-blue-600" />
                        </div>

                        <h2 className="text-xl font-semibold text-slate-800 mt-5">
                            No doctors found
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Try a different search.
                        </p>
                    </div>
                )}

                {/* DOCTORS */}
                {!loading && !error && filteredDoctors.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">

                        {filteredDoctors.map((doctor) => {
                            const doctorName =
                                doctor.userId?.name ||
                                doctor.name ||
                                "Doctor";

                            return (
                                <div
                                    key={doctor._id}
                                    className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition overflow-hidden"
                                >

                                    {/* TOP - DOCTOR PHOTO */}
                                    <div className="bg-blue-50 p-6 flex justify-center">
                                        <div className="w-28 h-28 rounded-2xl bg-white border border-blue-100 overflow-hidden flex items-center justify-center">

                                            {doctor.profileImage ? (
                                                <img
                                                    src={doctor.profileImage}
                                                    alt={doctorName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <UserRound
                                                    size={55}
                                                    className="text-blue-500"
                                                />
                                            )}

                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="p-6">

                                        <h2 className="text-xl font-semibold text-slate-800">
                                            Dr. {doctorName}
                                        </h2>

                                        <p className="text-blue-600 font-medium mt-1">
                                            {doctor.specialization || "Medical Specialist"}
                                        </p>

                                        {doctor.experience && (
                                            <p className="text-sm text-slate-500 mt-3">
                                                {doctor.experience} years experience
                                            </p>
                                        )}

                                        {doctor.city && (
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-3">
                                                <MapPin size={16} />
                                                {doctor.city}
                                            </div>
                                        )}

                                        {/* ACTION BUTTONS */}
                                        <div className="flex gap-3 mt-6">

                                            <Link
                                                to={`/doctor/${doctor._id}`}
                                                className="flex-1 text-center border border-blue-200 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition text-sm"
                                            >
                                                <span className="flex items-center justify-center gap-1">
                                                    View Profile
                                                    <ArrowRight size={16} />
                                                </span>
                                            </Link>

                                            <Link
                                                to={`/book/${doctor._id}`}
                                                className="flex-1 text-center bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition text-sm"
                                            >
                                                <span className="flex items-center justify-center gap-1">
                                                    <CalendarDays size={16} />
                                                    Book Now
                                                </span>
                                            </Link>

                                        </div>

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

            </main>
        </div>
    );
}

export default Doctors;
