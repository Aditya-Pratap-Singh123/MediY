import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [role, setRole] = useState("patient");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Save token
            localStorage.setItem("token", data.token);

            // Save user information
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            // Check role from backend
            const loggedInRole = data.user?.role || role;

            if (loggedInRole === "doctor") {
                navigate("/doctor/dashboard");
            } else {
                navigate("/patient/dashboard");
            }

        } catch (error) {
            console.error("Login Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            <div style={styles.card}>

                {/* Logo */}
                <div style={styles.logo}>
                    🩺
                </div>

                <h1 style={styles.title}>Welcome to MediY</h1>

                <p style={styles.subtitle}>
                    Login to continue to your portal
                </p>

                {/* Role Selection */}
                <div style={styles.roleContainer}>

                    <button
                        type="button"
                        onClick={() => setRole("patient")}
                        style={{
                            ...styles.roleButton,
                            ...(role === "patient"
                                ? styles.activeRole
                                : {}),
                        }}
                    >
                        <span style={styles.roleIcon}>👤</span>
                        <span>Login as Patient</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setRole("doctor")}
                        style={{
                            ...styles.roleButton,
                            ...(role === "doctor"
                                ? styles.activeDoctorRole
                                : {}),
                        }}
                    >
                        <span style={styles.roleIcon}>👨‍⚕️</span>
                        <span>Login as Doctor</span>
                    </button>

                </div>

                {/* Error */}
                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin}>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    {/* Selected Role */}
                    <div style={styles.selectedRole}>
                        Logging in as{" "}
                        <strong>
                            {role === "doctor" ? "Doctor" : "Patient"}
                        </strong>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.loginButton,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {/* Register */}
                <p style={styles.registerText}>
                    Don't have an account?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        style={styles.registerLink}
                    >
                        Register
                    </span>
                </p>

                {/* Home */}
                <button
                    onClick={() => navigate("/")}
                    style={styles.homeButton}
                >
                    ← Back to Home
                </button>

            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
            "linear-gradient(135deg, #eef7ff 0%, #f7fbff 50%, #e8f5ff 100%)",
        padding: "20px",
        fontFamily:
            "Inter, Arial, Helvetica, sans-serif",
    },

    card: {
        width: "100%",
        maxWidth: "460px",
        background: "#ffffff",
        borderRadius: "24px",
        padding: "40px",
        boxShadow:
            "0 20px 60px rgba(30, 80, 120, 0.15)",
        border: "1px solid #e8eef5",
    },

    logo: {
        width: "64px",
        height: "64px",
        margin: "0 auto 18px",
        borderRadius: "18px",
        background: "#e8f5ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "32px",
    },

    title: {
        textAlign: "center",
        margin: "0",
        fontSize: "30px",
        fontWeight: "700",
        color: "#172b4d",
    },

    subtitle: {
        textAlign: "center",
        color: "#718096",
        marginTop: "10px",
        marginBottom: "30px",
        fontSize: "15px",
    },

    roleContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        marginBottom: "25px",
    },

    roleButton: {
        padding: "16px 10px",
        borderRadius: "14px",
        border: "1px solid #d9e2ec",
        background: "#ffffff",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "7px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#52606d",
        transition: "0.2s",
    },

    activeRole: {
        background: "#e8f5ff",
        border: "2px solid #27a9e1",
        color: "#1686b8",
    },

    activeDoctorRole: {
        background: "#eef1ff",
        border: "2px solid #647cff",
        color: "#465bd6",
    },

    roleIcon: {
        fontSize: "28px",
    },

    error: {
        background: "#fff1f0",
        color: "#d93025",
        border: "1px solid #ffd6d2",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "18px",
        fontSize: "14px",
        textAlign: "center",
    },

    inputGroup: {
        marginBottom: "20px",
    },

    label: {
        display: "block",
        marginBottom: "8px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#334e68",
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "14px 16px",
        borderRadius: "12px",
        border: "1px solid #d9e2ec",
        outline: "none",
        fontSize: "15px",
        color: "#243b53",
        background: "#fbfdff",
    },

    selectedRole: {
        background: "#f5f8fb",
        borderRadius: "10px",
        padding: "11px",
        textAlign: "center",
        color: "#627d98",
        fontSize: "14px",
        marginBottom: "18px",
    },

    loginButton: {
        width: "100%",
        padding: "15px",
        border: "none",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, #2499d3, #1677b7)",
        color: "#ffffff",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow:
            "0 8px 20px rgba(22, 119, 183, 0.25)",
    },

    registerText: {
        textAlign: "center",
        marginTop: "24px",
        color: "#718096",
        fontSize: "14px",
    },

    registerLink: {
        color: "#1686b8",
        fontWeight: "700",
        cursor: "pointer",
    },

    homeButton: {
        display: "block",
        margin: "15px auto 0",
        border: "none",
        background: "transparent",
        color: "#718096",
        cursor: "pointer",
        fontSize: "14px",
    },
};

export default Login;