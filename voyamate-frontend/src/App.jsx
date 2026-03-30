import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SetupProfile from "./pages/SetupProfile";
import FindTravelers from "./pages/FindTravelers";
import AddFlight from "./pages/AddFlight";
import GroupChat from "./pages/GroupChat";
import PrivateChat from "./pages/PrivateChat";
import PhotoViewer from "./pages/PhotoViewer";
import Connections from "./pages/Connections";
import Profile from "./pages/Profile";

function App() {
  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/setup-profile" element={<SetupProfile />} />
        <Route path="/find-travelers" element={<FindTravelers />} />
        <Route path="/add-flight" element={<AddFlight />} />
        <Route path="/group-chat" element={<GroupChat />} />
        <Route path="/chat/:id" element={<PrivateChat />} />
        <Route path="/photo-viewer" element={<PhotoViewer />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/profile" element={<Profile />} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;