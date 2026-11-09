
import { Link } from "react-router-dom";
import {
    Stethoscope,
    CalendarCheck,
    ShieldCheck,
    Clock3,
    ArrowRight,
    HeartPulse,
    UserRoundCheck,
    Activity,
    Menu,
    CheckCircle2,
    Star,
    ChevronRight
} from "lucide-react";

function Home() {
    const features = [
        {
            icon: Stethoscope,
            title: "Find the Right Doctor",
            description:
                "Explore doctor profiles, qualifications and specializations to find the right healthcare professional.",
            color: "bg-blue-50 text-blue-600"
        },
        {
            icon: CalendarCheck,
            title: "Easy Appointment Booking",
            description:
                "Choose your preferred date and available time slot to book appointments without hassle.",
            color: "bg-indigo-50 text-indigo-600"
        },
        {
            icon: ShieldCheck,
            title: "Secure & Private",
            description:
                "Your account and appointment information are protected with secure authentication.",
            color: "bg-sky-50 text-sky-600"
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Find a Doctor",
            description: "Browse doctors and explore their profiles."
        },
        {
            number: "02",
            title: "Choose a Slot",
            description: "Select your preferred appointment date and time."
        },
        {
            number: "03",
            title: "Book Appointment",
            description: "Confirm your appointment in just a few clicks."
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-800 overflow-hidden">

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">

                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition">
                            <HeartPulse size={25} className="text-white" />
                        </div>

                        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Medi<span className="text-blue-600">Y</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-9">
                        <Link to="/" className="text-blue-600 font-semibold">
                            Home
                        </Link>

                        <Link to="/doctors" className="text-slate-600 hover:text-blue-600 font-medium transition">
                            Find Doctors
                        </Link>

                        <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium transition">
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    </div>

                    <Link
                        to="/register"
                        className="md:hidden bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative bg-gradient-to-br from-blue-50 via-white to-sky-50">
                <div className="absolute top-10 right-0 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* HERO CONTENT */}
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm mb-7">
                                <Activity size={17} />
                                Your Health, Our Priority
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.12] tracking-tight text-slate-900">
                                Healthcare
                                <br />
                                made{" "}
                                <span className="text-blue-600">simple.</span>
                            </h1>

                            <p className="mt-7 text-lg text-slate-600 leading-relaxed max-w-xl">
                                Find trusted doctors, explore their profiles
                                and book your appointments effortlessly.
                                Your journey towards better healthcare
                                starts with MediY.
                            </p>

                            <div className="flex flex-wrap gap-4 mt-9">
                                <Link
                                    to="/doctors"
                                    className="inline-flex items-center gap-3 bg-blue-600 text-white px-7 py-4 rounded-2xl font-semibold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition"
                                >
                                    Find a Doctor
                                    <ArrowRight size={19} />
                                </Link>

                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-7 py-4 rounded-2xl font-semibold hover:border-blue-300 hover:text-blue-600 transition"
                                >
                                    Create Account
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-x-7 gap-y-4 mt-10 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-blue-600" />
                                    Secure Platform
                                </div>

                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-blue-600" />
                                    Easy Booking
                                </div>

                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-blue-600" />
                                    Trusted Profiles
                                </div>
                            </div>
                        </div>

                        {/* HERO VISUAL */}
                        <div className="relative max-w-xl mx-auto w-full">

                            <div className="absolute -top-8 -right-5 w-32 h-32 bg-blue-200/60 rounded-full blur-2xl" />
                            <div className="absolute -bottom-8 -left-5 w-40 h-40 bg-sky-200/60 rounded-full blur-2xl" />

                            <div className="relative bg-white rounded-[2rem] p-5 sm:p-8 shadow-2xl shadow-blue-100 border border-blue-50">

                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">
                                            Welcome to
                                        </p>
                                        <h3 className="text-2xl font-extrabold text-slate-900">
                                            Medi<span className="text-blue-600">Y</span>
                                        </h3>
                                    </div>

                                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                        <HeartPulse size={30} className="text-white" />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm">
                                                Healthcare made easier
                                            </p>
                                            <h3 className="text-2xl font-bold mt-2">
                                                Take care of yourself.
                                            </h3>
                                            <p className="text-blue-100 text-sm mt-2">
                                                Your health matters every day.
                                            </p>
                                        </div>

                                        <HeartPulse size={55} className="opacity-90 shrink-0" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-600">
                                            <Stethoscope size={24} />
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">
                                                Find Doctors
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Explore doctor profiles
                                            </p>
                                        </div>

                                        <ChevronRight className="text-blue-500" />
                                    </div>

                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-sky-50 border border-sky-100">
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-600">
                                            <CalendarCheck size={24} />
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">
                                                Book Appointment
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Choose your preferred slot
                                            </p>
                                        </div>

                                        <ChevronRight className="text-blue-500" />
                                    </div>

                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-600">
                                            <Clock3 size={24} />
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">
                                                Manage Easily
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Keep track of appointments
                                            </p>
                                        </div>

                                        <ChevronRight className="text-blue-500" />
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-3 bg-slate-50 rounded-2xl p-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <ShieldCheck className="text-green-600" size={21} />
                                    </div>

                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">
                                            Your care, our commitment
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Simple and secure appointment management
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-5 -right-3 sm:-right-8 bg-white rounded-2xl px-5 py-4 shadow-xl border border-slate-100 hidden sm:flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">
                                        Simple Booking
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Just a few clicks
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-5 lg:px-8">

                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-blue-600 font-bold tracking-widest text-sm">
                            WHY CHOOSE MEDIY
                        </span>

                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4">
                            Healthcare that works for you
                        </h2>

                        <p className="text-slate-500 mt-4 leading-relaxed">
                            Everything you need to find doctors and manage
                            your appointments, all in one convenient place.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-7">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={index}
                                    className="group p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-2 transition duration-300"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
                                        <Icon size={27} />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900">
                                        {feature.title}
                                    </h3>

                                    <p className="text-slate-500 leading-relaxed mt-3">
                                        {feature.description}
                                    </p>

                                    <Link
                                        to="/doctors"
                                        className="inline-flex items-center gap-2 mt-6 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all"
                                    >
                                        Explore
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-5 lg:px-8">

                    <div className="text-center mb-14">
                        <span className="text-blue-600 font-bold tracking-widest text-sm">
                            SIMPLE PROCESS
                        </span>

                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-4">
                            Get started in 3 easy steps
                        </h2>

                        <p className="text-slate-500 mt-4">
                            Booking your healthcare appointment has never been easier.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-7">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="relative bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
                            >
                                <span className="text-5xl font-extrabold text-blue-100">
                                    {step.number}
                                </span>

                                <h3 className="text-xl font-bold text-slate-900 mt-5">
                                    {step.title}
                                </h3>

                                <p className="text-slate-500 mt-3 leading-relaxed">
                                    {step.description}
                                </p>

                                <div className="mt-6 w-10 h-1 rounded-full bg-blue-600" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-5 lg:px-8">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-700 to-blue-600 px-7 py-14 md:px-14 md:py-16">

                        <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full border-[35px] border-white/10" />
                        <div className="absolute right-48 -bottom-32 w-64 h-64 rounded-full bg-white/5" />

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-white max-w-2xl">
                                <div className="inline-flex items-center gap-2 text-blue-100 text-sm font-semibold mb-4">
                                    <HeartPulse size={18} />
                                    YOUR HEALTH MATTERS
                                </div>

                                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                                    Ready to take care of your health?
                                </h2>

                                <p className="text-blue-100 mt-4 leading-relaxed">
                                    Find the right doctor and book your
                                    appointment with MediY today.
                                </p>
                            </div>

                            <Link
                                to="/doctors"
                                className="shrink-0 inline-flex items-center gap-3 bg-white text-blue-700 px-7 py-4 rounded-2xl font-bold hover:bg-blue-50 hover:-translate-y-1 transition shadow-lg"
                            >
                                Find a Doctor
                                <ArrowRight size={19} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-950 text-white">
                <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14">

                    <div className="grid md:grid-cols-2 gap-10 pb-10">

                        <div>
                            <Link to="/" className="inline-flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center">
                                    <HeartPulse size={25} className="text-white" />
                                </div>

                                <span className="text-2xl font-extrabold">
                                    Medi<span className="text-blue-500">Y</span>
                                </span>
                            </Link>

                            <p className="text-slate-400 mt-5 max-w-sm leading-relaxed">
                                Making healthcare more accessible and
                                convenient through simple doctor discovery
                                and appointment management.
                            </p>
                        </div>

                        <div className="md:text-right">
                            <h3 className="font-bold text-lg mb-5">
                                Quick Links
                            </h3>

                            <div className="flex flex-wrap md:justify-end gap-x-7 gap-y-4 text-slate-400">
                                <Link to="/" className="hover:text-white transition">
                                    Home
                                </Link>

                                <Link to="/doctors" className="hover:text-white transition">
                                    Doctors
                                </Link>

                                <Link to="/login" className="hover:text-white transition">
                                    Login
                                </Link>

                                <Link to="/register" className="hover:text-white transition">
                                    Register
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-sm text-slate-500">
                        <p>© 2026 MediY. All rights reserved.</p>
                        <p>Made with care for better healthcare.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
