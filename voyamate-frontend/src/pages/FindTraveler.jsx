import { useState, useEffect } from "react";
import { Search, Filter, MessageSquare, UserPlus, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import api from "../js/api";

export default function FindTravelers() {
  const [travelers, setTravelers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTravelers = async () => {
      try {
        // Calling your real backend endpoint for users
        const res = await api.get("/flights/passengers"); 
        setTravelers(res.data);
      } catch (err) {
        console.error("Error fetching travelers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTravelers();
  }, []);

  const filteredTravelers = travelers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24 font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="pt-8 mb-6">
        <h1 className="text-2xl font-bold">Find <span className="text-cyan-400">Buddies</span></h1>
        <p className="text-slate-500 text-sm">Travelers sharing your vibe</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text"
          placeholder="Search by name or city..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Travelers List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Scanning the globe...</div>
        ) : filteredTravelers.map((person, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={person.id}
            className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex items-center gap-4 hover:border-white/20 transition-all"
          >
            <div className="relative">
                <img 
                src={person.avatar || `https://ui-avatars.com/api/?name=${person.name}&background=0D8ABC&color=fff`} 
                className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500/20"
                alt={person.name}
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#050505] rounded-full"></div>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg">{person.name}</h3>
              <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                <MapPin size={12} />
                <span>{person.location || "Global Citizen"}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {JSON.parse(person.interests || "[]").slice(0, 3).map(interest => (
                    <span key={interest} className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {interest}
                    </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
                <button className="p-3 bg-cyan-500 rounded-xl text-black">
                    <UserPlus size={18} />
                </button>
                <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white">
                    <MessageSquare size={18} />
                </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}