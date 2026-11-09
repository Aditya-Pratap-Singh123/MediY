
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    HeartPulse,
    Stethoscope,
    UserRound,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Activity
} from "lucide-react";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [role, setRole] = useState("patient");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "https://mediy-1.onrender.com/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                        role
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Confirm backend role before storing login session
            if (!data.user || data.user.role !== role) {
                throw new Error("Account type verification failed.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            const redirectTo = location.state?.from;

            if (redirectTo && role === "patient") {
                navigate(redirectTo, { replace: true });
                return;
            }

            if (role === "doctor") {
                navigate("/doctor/dashboard", { replace: true });
            } else {
                navigate("/patient/dashboard", { replace: true });
            }

        } catch (error) {
            console.error("Login Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex flex-col">
            <nav className="w-full bg-white/90 backdrop-blur-xl border-b border-blue-100">
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

            <main className="flex-1 flex items-center justify-center px-5 py-12">
                <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-[2rem] shadow-2xl shadow-blue-100/70 border border-blue-100 overflow-hidden">

                    <div className="hidden lg:flex relative bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-12 flex-col justify-between overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border-[45px] border-white/10" />
                        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-white/5" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                                <HeartPulse size={35} className="text-white" />
                            </div>

                            <p className="text-blue-100 font-semibold tracking-widest text-sm mt-12">
                                WELCOME TO MEDIY
                            </p>

                            <h1 className="text-5xl font-extrabold text-white leading-tight mt-4">
                                Your health,
                                <br />
                                our priority.
                            </h1>

                            <p className="text-blue-100 leading-relaxed mt-6 max-w-md">
                                Access your healthcare portal, connect with trusted doctors and manage your appointments with ease.
                            </p>
                        </div>

                        <div className="relative z-10 space-y-5">
                            <div className="flex items-center gap-4 bg-white/10 border border-white/15 rounded-2xl p-4">
                                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                                    <Stethoscope className="text-white" size={23} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Trusted Doctors</h3>
                                    <p className="text-blue-100 text-sm">Explore healthcare professionals</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/10 border border-white/15 rounded-2xl p-4">
                                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                                    <ShieldCheck className="text-white" size={23} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Secure Access</h3>
                                    <p className="text-blue-100 text-sm">Your account stays protected</p>
                                </div>
                            </div>

                            <p className="text-blue-100/80 text-sm pt-3">
                                © 2026 MediY. All rights reserved.
                            </p>
                        </div>
                    </div>

                    <div className="p-7 sm:p-10 lg:p-14">
                        <div className="max-w-md mx-auto">

                            <div className="lg:hidden flex justify-center mb-7">
                                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                    <HeartPulse size={30} className="text-white" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-3 py-2 rounded-full mb-5">
                                    <Activity size={16} />
                                    YOUR HEALTHCARE PORTAL
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                                    Welcome back!
                                </h2>

                                <p className="text-slate-500 mt-3 leading-relaxed">
                                    Login to your account and continue your healthcare journey.
                                </p>
                            </div>

                            <div className="mb-7">
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Select your account type
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRole("patient");
                                            setError("");
                                        }}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${
                                            role === "patient"
                                                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                                : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"
                                        }`}
                                    >
                                        <UserRound size={27} />
                                        <span className="font-bold text-sm">Patient</span>
                                        {role === "patient" && (
                                            <span className="text-xs font-semibold">Selected</span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRole("doctor");
                                            setError("");
                                        }}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${
                                            role === "doctor"
                                                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                                : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"
                                        }`}
                                    >
                                        <Stethoscope size={27} />
                                        <span className="font-bold text-sm">Doctor</span>
                                        {role === "doctor" && (
                                            <span className="text-xs font-semibold">Selected</span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div role="alert" className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoComplete="email"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <LockKeyhole size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoComplete="current-password"
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition"
                                        >
                                            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                                    <span className="text-sm text-slate-600">Logging in as</span>
                                    <span className="text-sm font-bold text-blue-700">
                                        {role === "doctor" ? "Doctor" : "Patient"}
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            Login to Account
                                            <ArrowRight size={19} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-8">
                                <p className="text-sm text-slate-500">
                                    Don't have an account?{" "}
                                    <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700">
                                        Create Account
                                    </Link>
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 mt-7 text-xs text-slate-400">
                                <ShieldCheck size={15} />
                                Secure login powered by MediY
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="text-center py-5 text-sm text-slate-400">
                © 2026 MediY · Your health, our priority.
            </footer>
        </div>
    );
}

export default Login;
