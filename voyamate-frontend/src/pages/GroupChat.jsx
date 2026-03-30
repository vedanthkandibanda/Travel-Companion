import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Users, ChevronLeft, Plane } from "lucide-react";
import io from "socket.io-client";
import api from "../js/api";

const socket = io("https://travel-companion-y8fn.onrender.com");

export default function GroupChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [flightInfo, setFlightInfo] = useState(null);
  const scrollRef = useRef();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // 1. Get user's active flight to know which room to join
    api.get(`/flights/user/${userId}`).then(res => {
      const active = res.data[0];
      if (active) {
        setFlightInfo(active);
        // Join the flight-specific socket room
        socket.emit("join_flight_chat", { flightNumber: active.flightNumber, userId });
      }
    });

    // 2. Listen for group messages
    socket.on("receive_group_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // 3. Listen for member count updates
    socket.on("flightCount", (data) => {
      setOnlineCount(data.count);
    });

    return () => {
      socket.off("receive_group_message");
      socket.off("flightCount");
    };
  }, [userId]);

  const sendMessage = () => {
    if (!input.trim() || !flightInfo) return;
    const msgData = {
      flightNumber: flightInfo.flightNumber,
      senderId: userId,
      senderName: localStorage.getItem("userName"),
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit("send_group_message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setInput("");
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="p-5 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20}/></button>
          <div>
            <h2 className="font-bold flex items-center gap-2">
              Flight {flightInfo?.flightNumber || "Crew"} <Plane size={14} className="text-cyan-400"/>
            </h2>
            <p className="text-[10px] text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              {onlineCount} travelers online
            </p>
          </div>
        </div>
        <Users size={20} className="text-slate-500" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.senderId == userId ? "items-end" : "items-start"}`}>
            {m.senderId != userId && <span className="text-[10px] text-slate-500 mb-1 ml-2">{m.senderName}</span>}
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              m.senderId == userId 
                ? "bg-cyan-500 text-black rounded-tr-none" 
                : "bg-white/5 border border-white/10 text-white rounded-tl-none"
            }`}>
              <p className="text-sm">{m.text}</p>
              <p className={`text-[9px] mt-1 text-right ${m.senderId == userId ? "text-black/60" : "text-slate-500"}`}>{m.time}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Field */}
      <div className="p-5 bg-[#0a0a0a] border-t border-white/10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-2 focus-within:border-cyan-500/40">
          <input 
            className="flex-1 bg-transparent outline-none px-3 text-sm"
            placeholder="Message the crew..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="p-3 bg-cyan-500 text-black rounded-xl hover:scale-105 transition-transform">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}