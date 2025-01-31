import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import "./index.css";
import ReinaValeraBooks from "./components/ui/ReinaValeraBooks";
import Login from "./components/ui/Login";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/home" element={user ? <ReinaValeraBooks /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;