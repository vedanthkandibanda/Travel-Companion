import { useState, useEffect } from "react";
import { Search, MessageCircle, UserMinus, Globe } from "lucide-react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await api.get(`/connections/${userId}`);
        setConnections(res.data);
      } catch (err) {
        console.error("Error fetching connections", err);
      } finally {
        setConnections([]); // If empty, defaults to empty array
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24 font-['Plus_Jakarta_Sans']">
      <div className="pt-8 mb-6">
        <h1 className="text-2xl font-bold">My <span className="text-cyan-400">Network</span></h1>
        <p className="text-slate-500 text-sm">Your verified travel companions</p>
      </div>

      <div className="space-y-4">
        {connections.length === 0 && !loading ? (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <Globe className="mx-auto text-slate-700 mb-4" size={40} />
            <p className="text-slate-500">No connections yet. Explore the "Find Buddies" page!</p>
          </div>
        ) : (
          connections.map((conn) => (
            <div key={conn.id} className="bg-white/5 border border-white/10 rounded-[24px] p-4 flex items-center gap-4">
              <img src={conn.avatar || `https://ui-avatars.com/api/?name=${conn.name}`} className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <h3 className="font-bold">{conn.name}</h3>
                <p className="text-xs text-slate-500">Connected on {new Date(conn.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/chat/${conn.id}`)} className="p-2 bg-cyan-500 text-black rounded-lg">
                  <MessageCircle size={18} />
                </button>
                <button className="p-2 bg-white/5 text-red-400 rounded-lg border border-white/10">
                  <UserMinus size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}