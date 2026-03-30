import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, Sparkles, ChevronRight, Check } from "lucide-react";
import api from "../js/api";

const INTERESTS_OPTIONS = [
  "Startups", "AI", "Photography", "Hiking", "Coffee", "Music", "Travel", "Cooking", 
  "Art", "Reading", "Surfing", "Yoga", "Gaming", "Sports", "Design", "Cricket", 
  "Movies", "Tech", "History", "Fitness", "Coding", "Fashion", "Nature", "Pets", "Science"
];

export default function SetupProfile() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    location: "",
    interests: []
  });
  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleFinish = async () => {
    try {
      const userId = localStorage.getItem("userId");
      
      // 1. Save Profile Data
      await api.post("/profile/update", {
        userId,
        ...formData,
        interests: JSON.stringify(formData.interests)
      });

      // 2. Update the 'users' table flag
      await api.post("/auth/complete-setup", { userId });

      // 3. Move to Dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Setup failed", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-['Plus_Jakarta_Sans']">
      {/* Progress Bar */}
      <div className="max-w-md mx-auto mb-10 pt-8">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Step {step} of 2</span>
          <span className="text-xs text-slate-500">{step === 1 ? "Basic Info" : "Interests"}</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-cyan-500"
            initial={{ width: "50%" }}
            animate={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h1 className="text-3xl font-bold">Personalize your <span className="text-cyan-400">Profile</span></h1>
              <p className="text-slate-400">Tell other travelers a bit about yourself.</p>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Username</label>
                  <input 
                    className="w-full bg-transparent outline-none pt-1" 
                    placeholder="@traveler_johndoe"
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Bio</label>
                  <textarea 
                    className="w-full bg-transparent outline-none pt-1 resize-none h-24" 
                    placeholder="Avid hiker and coffee enthusiast..."
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                  <MapPin size={20} className="text-cyan-400" />
                  <input 
                    className="w-full bg-transparent outline-none" 
                    placeholder="Current Location (City, Country)"
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                Continue to Interests <ChevronRight size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h1 className="text-3xl font-bold">Pick your <span className="text-cyan-400">Vibes</span></h1>
              <p className="text-slate-400">Select at least 3 things you love.</p>

              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      formData.interests.includes(item)
                        ? "bg-cyan-500 border-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleFinish}
                className="w-full bg-cyan-500 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-8"
              >
                Complete Setup <Sparkles size={20} />
              </button>
              <button onClick={() => setStep(1)} className="w-full text-slate-500 text-sm py-2">Go Back</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}