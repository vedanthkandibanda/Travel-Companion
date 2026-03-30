import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaneTakeoff, PlaneLanding, Calendar, Hash, ArrowRight, Loader2 } from "lucide-react";
import api from "../js/api";

export default function AddFlight() {
  const [formData, setFormData] = useState({
    flightNumber: "",
    departure: "",
    destination: "",
    date: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleAddFlight = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const userId = localStorage.getItem("userId");
      // Use your real backend route from your project file
      await api.post("/flights/add", {
        userId,
        ...formData
      });
      
      setMessage("Flight added successfully! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add flight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="pt-8 mb-8">
        <h1 className="text-3xl font-bold italic tracking-tight">Add <span className="text-cyan-400 text-glow">Flight</span></h1>
        <p className="text-slate-500 mt-2">Enter your flight details to find your crew.</p>
      </div>

      <form onSubmit={handleAddFlight} className="space-y-4 max-w-md mx-auto">
        {/* Flight Number */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 focus-within:border-cyan-500/50 transition-all">
          <Hash className="text-cyan-400" size={20} />
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 block">Flight Number</label>
            <input 
              type="text" 
              placeholder="e.g. EK502"
              className="bg-transparent w-full outline-none pt-1 uppercase placeholder:text-slate-700"
              onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Departure */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 focus-within:border-cyan-500/50 transition-all">
          <PlaneTakeoff className="text-cyan-400" size={20} />
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 block">From</label>
            <input 
              type="text" 
              placeholder="Airport Code (e.g. DXB)"
              className="bg-transparent w-full outline-none pt-1 uppercase"
              onChange={(e) => setFormData({...formData, departure: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Destination */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 focus-within:border-cyan-500/50 transition-all">
          <PlaneLanding className="text-cyan-400" size={20} />
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 block">To</label>
            <input 
              type="text" 
              placeholder="Airport Code (e.g. LHR)"
              className="bg-transparent w-full outline-none pt-1 uppercase"
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Date */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 focus-within:border-cyan-500/50 transition-all">
          <Calendar className="text-cyan-400" size={20} />
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 block">Departure Date</label>
            <input 
              type="date" 
              className="bg-transparent w-full outline-none pt-1 [color-scheme:dark]"
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
        </div>

        {message && (
          <div className={`text-center p-3 rounded-xl text-sm ${message.includes("success") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Schedule Journey"}
          {!loading && <ArrowRight size={20} />}
        </button>
      </form>
    </div>
  );
}