import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import DoctorProfile from "./pages/DoctorProfile";
import BookAppointment from "./pages/BookAppointment";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/doctors"
                    element={<Doctors />}
                />

                <Route
                    path="/doctor/:doctorId"
                    element={<DoctorProfile />}
                />

                <Route
                    path="/book/:doctorId"
                    element={<BookAppointment />}
                />

                <Route
                    path="/patient/dashboard"
                    element={<PatientDashboard />}
                />

                <Route
                    path="/doctor/dashboard"
                    element={<DoctorDashboard />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;