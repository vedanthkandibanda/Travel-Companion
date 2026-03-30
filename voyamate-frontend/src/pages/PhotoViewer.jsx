import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Download, Share2, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhotoViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use passed photos or fallback to a sample gallery
  const gallery = location.state?.photos || [
    "https://images.unsplash.com/photo-1500835595353-b0ad2c726ad1",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
    "https://images.unsplash.com/photo-1503220317375-aaad61436b1b"
  ];
  
  const [currentIndex, setCurrentIndex] = useState(location.state?.index || 0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % gallery.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Controls */}
      <div className="p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
          <X size={24} className="text-white" />
        </button>
        <div className="text-white text-sm font-bold tracking-widest">
          {currentIndex + 1} / {gallery.length}
        </div>
        <div className="flex gap-4">
          <button className="text-white/70"><Share2 size={20}/></button>
          <button className="text-white/70"><Download size={20}/></button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={gallery[currentIndex]}
            initial={{ opacity: 0, scale: 0.9, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="max-h-[85vh] max-w-full object-contain shadow-2xl shadow-cyan-500/10"
          />
        </AnimatePresence>

        {/* Desktop Navigation Arrows */}
        <button onClick={prev} className="absolute left-6 p-4 bg-white/5 rounded-full hover:bg-white/10 transition-colors hidden md:block">
          <ChevronLeft size={32} />
        </button>
        <button onClick={next} className="absolute right-6 p-4 bg-white/5 rounded-full hover:bg-white/10 transition-colors hidden md:block">
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Bottom Thumbnails */}
      <div className="p-8 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-center gap-3 overflow-x-auto py-2">
          {gallery.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentIndex(i)}
              className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === currentIndex ? "border-cyan-500 scale-110 shadow-lg shadow-cyan-500/40" : "border-transparent opacity-40"
              }`}
            >
              <img src={img} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}