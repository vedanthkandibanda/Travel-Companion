import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, MessageCircle, Sparkles, LogOut } from "lucide-react";
import api from "../lib/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeFlight, setActiveFlight] = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Get Profile
        const profileRes = await api.get("/auth/profile");
        setUser(profileRes.data);

        // Redirect if profile is empty (The First-Time Check)
        if (!profileRes.data.has_completed_setup) {
          navigate("/setup-profile");
        }

        // 2. Get Unread Notifications from your specific API
        const userId = localStorage.getItem("userId");
        const notifRes = await api.get(`/flights/unread/${userId}`);
        setUnread(notifRes.data.count);

        // 3. Get Flight Info
        const flightRes = await api.get(`/flights/user/${userId}`);
        setActiveFlight(flightRes.data[0]); // Takes the latest flight
      } catch (err) {
        console.error("Dashboard load failed", err);
      }
    };
    loadData();
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return <div className="bg-[#050505] min-h-screen flex items-center justify-center text-cyan-400">Loading VoyaMate...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-center bg-gradient-to-b from-cyan-500/10 to-transparent">
        <div>
          <p className="text-xs text-slate-500">Welcome back</p>
          <h1 className="text-2xl font-bold">{user.name.split(" ")[0]} ✈️</h1>
        </div>
        <button onClick={logout} className="p-2 bg-white/5 rounded-full border border-white/10 text-red-400">
          <LogOut size={20} />
        </button>
      </div>

      <div className="px-6 space-y-6 pb-28">
        {/* Active Flight - Dynamic */}
        <section className="bg-white/5 border border-white/10 p-6 rounded-[28px] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-cyan-400">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Active Trip</span>
          </div>
          {activeFlight ? (
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{activeFlight.departure_code || '---'}</div>
              <div className="flex-1 border-t border-dashed border-white/20 mx-4 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2">✈️</span>
              </div>
              <div className="text-3xl font-bold">{activeFlight.arrival_code || '---'}</div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No upcoming flights. Start a journey!</p>
          )}
        </section>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/find-travelers" className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center hover:border-cyan-500/50 transition-all">
            <div className="text-2xl mb-2 text-cyan-400">🌍</div>
            <span className="text-sm font-semibold">Discover</span>
          </Link>
          <Link to="/chat" className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center">
            <div className="text-2xl mb-2 text-cyan-400">💬</div>
            <span className="text-sm font-semibold">Messages</span>
          </Link>
        </div>
      </div>

      {/* Floating Bottom Nav - Base44 Style */}
      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-black/80 backdrop-blur-xl border border-white/10 rounded-[24px] flex justify-around items-center px-4">
        <Link to="/" className="text-cyan-400"><Plus size={24} /></Link>
        <Link to="/find-travelers" className="text-slate-500"><MessageCircle size={24} /></Link>
        <div className="relative">
          <Link to="/notifications" className="text-slate-500 text-2xl">🔔</Link>
          {unread > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
        </div>
        <Link to="/profile" className="text-slate-500 text-2xl">👤</Link>
      </nav>
    </div>
  );
}