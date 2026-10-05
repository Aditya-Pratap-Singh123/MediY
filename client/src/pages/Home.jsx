
import { Link } from "react-router-dom";
import {
    Stethoscope,
    CalendarCheck,
    ShieldCheck,
    Clock3,
    ArrowRight,
    HeartPulse,
    UserRoundCheck
} from "lucide-react";

function Home() {
    return (
        <div className="min-h-screen bg-sky-50/40">

            {/* ================= NAVBAR ================= */}
            <nav className="bg-blue-50 border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    {/* Logo */}
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

                    {/* Navigation */}
                    <div className="hidden md:flex items-center gap-8">

                        <Link
                            to="/"
                            className="text-slate-600 hover:text-blue-600 transition"
                        >
                            Home
                        </Link>

                        <Link
                            to="/doctors"
                            className="text-slate-600 hover:text-blue-600 transition"
                        >
                            Find Doctors
                        </Link>

                        <Link
                            to="/login"
                            className="text-slate-600 hover:text-blue-600 transition"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                            Get Started
                        </Link>

                    </div>

                </div>
            </nav>


            {/* ================= HERO ================= */}
            <section className="max-w-7xl mx-auto px-6 py-20">

                <div className="grid lg:grid-cols-2 gap-14 items-center">

                    {/* Hero Content */}
                    <div>

                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Stethoscope size={17} />
                            Healthcare made simple
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-slate-800 leading-tight">
                            Your health,
                            <br />
                            <span className="text-blue-600">
                                our priority.
                            </span>
                        </h1>

                        <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
                            Find trusted doctors, check their availability
                            and book your appointment easily with MediY.
                            Healthcare is now just a few clicks away.
                        </p>

                        <div className="flex flex-wrap gap-4 mt-8">

                            <Link
                                to="/doctors"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-md"
                            >
                                Find a Doctor
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/register"
                                className="px-6 py-3.5 rounded-xl border border-blue-200 bg-white text-slate-700 font-medium hover:bg-blue-50 transition"
                            >
                                Create Account
                            </Link>

                        </div>

                        {/* Small trust points */}
                        <div className="flex flex-wrap gap-6 mt-8 text-sm text-slate-500">

                            <div className="flex items-center gap-2">
                                <ShieldCheck
                                    size={18}
                                    className="text-blue-600"
                                />
                                Secure
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock3
                                    size={18}
                                    className="text-blue-600"
                                />
                                Easy Booking
                            </div>

                            <div className="flex items-center gap-2">
                                <UserRoundCheck
                                    size={18}
                                    className="text-blue-600"
                                />
                                Trusted Doctors
                            </div>

                        </div>

                    </div>


                    {/* ================= HERO CARD ================= */}
                    <div className="relative">

                        {/* Background decoration */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-70"></div>

                        <div className="relative bg-white rounded-3xl shadow-lg p-8 border border-blue-100">

                            <div className="flex items-center gap-4 mb-8">

                                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                                    <HeartPulse
                                        className="text-blue-600"
                                        size={28}
                                    />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-xl text-slate-800">
                                        Better healthcare
                                    </h3>

                                    <p className="text-slate-500">
                                        made easier for you
                                    </p>
                                </div>

                            </div>


                            {/* Feature 1 */}
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl mb-4">

                                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                                    <Stethoscope
                                        className="text-blue-600"
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <p className="font-medium text-slate-800">
                                        Find Doctors
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        Explore doctor profiles
                                    </p>
                                </div>

                            </div>


                            {/* Feature 2 */}
                            <div className="flex items-center gap-4 p-4 bg-sky-50 rounded-2xl mb-4">

                                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                                    <CalendarCheck
                                        className="text-blue-600"
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <p className="font-medium text-slate-800">
                                        Book Appointment
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        Choose your preferred slot
                                    </p>
                                </div>

                            </div>


                            {/* Feature 3 */}
                            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl">

                                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                                    <Clock3
                                        className="text-blue-600"
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <p className="font-medium text-slate-800">
                                        Manage Easily
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        Track your appointments
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ================= FEATURES ================= */}
            <section className="bg-white border-t border-blue-100">

                <div className="max-w-7xl mx-auto px-6 py-16">

                    <div className="text-center mb-12">

                        <p className="text-blue-600 font-medium mb-2">
                            WHY MEDIY?
                        </p>

                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                            Healthcare made convenient
                        </h2>

                        <p className="text-slate-500 mt-3 max-w-xl mx-auto">
                            Everything you need to find doctors and manage
                            your appointments in one place.
                        </p>

                    </div>


                    <div className="grid md:grid-cols-3 gap-6">

                        {/* Card 1 */}
                        <div className="p-7 rounded-2xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition">

                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                                <Stethoscope
                                    className="text-blue-600"
                                    size={25}
                                />
                            </div>

                            <h3 className="font-semibold text-lg text-slate-800">
                                Find the Right Doctor
                            </h3>

                            <p className="text-slate-500 mt-2 leading-relaxed">
                                Browse doctor profiles and find the right
                                healthcare professional for your needs.
                            </p>

                        </div>


                        {/* Card 2 */}
                        <div className="p-7 rounded-2xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition">

                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                                <CalendarCheck
                                    className="text-blue-600"
                                    size={25}
                                />
                            </div>

                            <h3 className="font-semibold text-lg text-slate-800">
                                Simple Booking
                            </h3>

                            <p className="text-slate-500 mt-2 leading-relaxed">
                                Check available slots and book your doctor
                                appointment without unnecessary hassle.
                            </p>

                        </div>


                        {/* Card 3 */}
                        <div className="p-7 rounded-2xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition">

                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                                <ShieldCheck
                                    className="text-blue-600"
                                    size={25}
                                />
                            </div>

                            <h3 className="font-semibold text-lg text-slate-800">
                                Secure & Private
                            </h3>

                            <p className="text-slate-500 mt-2 leading-relaxed">
                                Your account and appointment information
                                are protected with secure authentication.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* ================= CTA ================= */}
            <section className="max-w-7xl mx-auto px-6 py-16">

                <div className="bg-blue-600 rounded-3xl px-8 py-12 md:px-14 flex flex-col md:flex-row items-center justify-between gap-8">

                    <div className="text-white">

                        <h2 className="text-3xl font-bold">
                            Ready to take care of your health?
                        </h2>

                        <p className="text-blue-100 mt-2">
                            Find a doctor and book your appointment today.
                        </p>

                    </div>

                    <Link
                        to="/doctors"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition whitespace-nowrap"
                    >
                        Find a Doctor
                        <ArrowRight size={18} />
                    </Link>

                </div>

            </section>


            {/* ================= FOOTER ================= */}
            <footer className="bg-slate-900 text-white">

                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between gap-4">

                    <div>
                        <h3 className="text-xl font-bold">
                            MediY
                        </h3>

                        <p className="text-slate-400 mt-1 text-sm">
                            Simple healthcare appointment management.
                        </p>
                    </div>

                    <div className="flex gap-6 text-sm text-slate-400">

                        <Link
                            to="/doctors"
                            className="hover:text-white transition"
                        >
                            Doctors
                        </Link>

                        <Link
                            to="/login"
                            className="hover:text-white transition"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="hover:text-white transition"
                        >
                            Register
                        </Link>

                    </div>

                </div>

                <div className="border-t border-slate-800 text-center py-4 text-sm text-slate-500">
                    © 2026 MediY. All rights reserved.
                </div>

            </footer>

        </div>
    );
}

export default Home;

