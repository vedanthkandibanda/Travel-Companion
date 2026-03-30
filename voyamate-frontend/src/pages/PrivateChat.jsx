import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ChevronLeft, Image as ImageIcon } from "lucide-react";
import io from "socket.io-client";
import api from "../js/api";

const socket = io("https://travel-companion-y8fn.onrender.com");

export default function PrivateChat() {
  const { id } = useParams(); // Recipient ID
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const userId = localStorage.getItem("userId");
  const scrollRef = useRef();

  useEffect(() => {
    socket.emit("join_chat", { userId, recipientId: id });
    
    // Load history from your database
    api.get(`/messages/${userId}/${id}`).then(res => setMessages(res.data));

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, [id]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msgData = { senderId: userId, recipientId: id, text: input, timestamp: new Date() };
    socket.emit("send_message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setInput("");
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-black/50 backdrop-blur-md">
        <button onClick={() => navigate(-1)}><ChevronLeft /></button>
        <h2 className="font-bold">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.senderId == userId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${m.senderId == userId ? "bg-cyan-500 text-black rounded-tr-none" : "bg-white/10 text-white rounded-tl-none"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white/5 border-t border-white/10 flex gap-3">
        <button className="text-slate-500"><ImageIcon /></button>
        <input 
          className="flex-1 bg-transparent outline-none" 
          placeholder="Write a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="text-cyan-400"><Send /></button>
      </div>
    </div>
  );
}