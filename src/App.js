// src/App.js
import "@fortawesome/fontawesome-free/css/all.min.css";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./page/LandingPage.jsx";
import Login from "./page/LoginPage.jsx";
import SignUp from "./page/SignUpPage.jsx";
import MaindashboardPage from "./page/MaindashboardPage.jsx";
import Analytics from "./page/AnalyticsPage.jsx";
import Results from "./page/ResultPage.jsx";
import ErrorPage from "./page/ErrorPage.jsx";
import UserProfilePage from "./page/UserProfilePage.jsx";
import CommingSoonPage from "./page/CommingSoonPage.jsx";
import { useAuthContext } from "./hook/useAuthContext";

function App() {
  const { user } = useAuthContext();
  return (
    <Router>
      <Routes>
          <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/maindashboard" />}
          // element={<Login/>}
        />
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/signup"
          // element={!user ? <SignUp /> : <Navigate to="/maindashboard" />}
          element={<SignUp/>}
        />
        <Route
          path="/analytics"
          element={user ? <Analytics /> : <Navigate to="/login" />}
          // element={<Analytics />}
        />
        <Route
          path="/result/:interviewId"
          element={user ? <Results /> : <Navigate to="/login" />}
          // element={<Results />}
        />
        <Route
          path="/maindashboard"
          element={user ? <MaindashboardPage /> : <Navigate to="/login" />}
          // element={<MaindashboardPage />}
        />
        <Route
          path="/userprofile"
          // element={user ? <UserProfilePage /> : <Navigate to="/login" />}
          element={<UserProfilePage />}
        />
        <Route path="/error" element={<ErrorPage />}></Route>
        <Route path="/comingsoon" element={<CommingSoonPage />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
