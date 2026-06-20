import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  size: Math.random() * 3 + 2,
  x: Math.random() * 100,
  duration: Math.random() * 6 + 5,
  delay: Math.random() * 6,
  color: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#7c3aed' : '#a78bfa',
}));

const SAKURA = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  duration: Math.random() * 6 + 8,
  delay: Math.random() * 8,
  color: i % 2 === 0 ? '#c4b5fd' : '#67e8f9',
}));

const InputField = ({ icon, type, placeholder, value, onChange, accentColor = '#7c3aed' }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative group mb-4">
      <div
        className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300"
        style={{ color: focused ? accentColor : '#475569' }}
      >
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required
        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 placeholder:text-slate-600 text-slate-200"
        style={{
          background: focused ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? accentColor + '80' : 'rgba(255,255,255,0.07)'}`,
          boxShadow: focused ? `0 0 0 3px ${accentColor}18, 0 4px 20px ${accentColor}15` : 'none',
        }}
      />
      {focused && (
        <motion.div
          className="absolute bottom-0 left-4 right-4 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Registering...", name, email, password);
    // Add your registration API logic here
  };

  return (
    <div className="min-h-screen w-full flex bg-[#030712] text-white overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex md:w-[42%] lg:w-[45%] relative flex-col justify-center items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d0221 0%, #1a0533 50%, #080d20 100%)', borderRight: '1px solid rgba(139,92,246,0.25)' }}>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139,92,246,0.025) 3px, rgba(139,92,246,0.025) 4px)'
        }} />

        {/* Speed lines */}
        {[20, 40, 60, 80].map((top) => (
          <div key={top} className="absolute w-full h-px" style={{
            top: `${top}%`,
            background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.12) 40%, rgba(6,182,212,0.08) 60%, transparent 100%)'
          }} />
        ))}

        {/* Corner brackets */}
        <div className="absolute top-5 left-5 w-8 h-8" style={{ borderTop: '2px solid #7c3aed', borderLeft: '2px solid #7c3aed', borderRadius: '4px 0 0 0' }} />
        <div className="absolute top-5 right-5 w-8 h-8" style={{ borderTop: '2px solid rgba(6,182,212,0.5)', borderRight: '2px solid rgba(6,182,212,0.5)', borderRadius: '0 4px 0 0' }} />
        <div className="absolute bottom-5 left-5 w-8 h-8" style={{ borderBottom: '2px solid rgba(6,182,212,0.5)', borderLeft: '2px solid rgba(6,182,212,0.5)', borderRadius: '0 0 0 4px' }} />
        <div className="absolute bottom-5 right-5 w-8 h-8" style={{ borderBottom: '2px solid #7c3aed', borderRight: '2px solid #7c3aed', borderRadius: '0 0 4px 0' }} />

        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, bottom: '-10px', background: p.color, boxShadow: `0 0 6px ${p.color}` }}
            animate={{ y: [0, -700], opacity: [0, 1, 1, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* Sakura petals */}
        {SAKURA.map((s) => (
          <motion.div key={s.id} className="absolute text-base pointer-events-none select-none"
            style={{ left: `${s.x}%`, top: '-20px', color: s.color, opacity: 0.5 }}
            animate={{ y: [0, 700], rotate: [0, 360] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'linear' }}
          >✿</motion.div>
        ))}

        {/* Anime Eye */}
        <motion.div className="relative mb-8"
          animate={{ filter: ['drop-shadow(0 0 15px rgba(124,58,237,0.6))', 'drop-shadow(0 0 30px rgba(139,92,246,0.9))', 'drop-shadow(0 0 15px rgba(124,58,237,0.6))'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {[140, 100].map((size, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{
                width: size, height: size * 0.6,
                border: `1px solid ${i === 0 ? 'rgba(139,92,246,0.2)' : 'rgba(6,182,212,0.15)'}`,
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
          <div className="relative flex items-center justify-center"
            style={{ width: 110, height: 65, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.7)', boxShadow: '0 0 25px rgba(139,92,246,0.4), inset 0 0 15px rgba(139,92,246,0.1)' }}>
            {[-20, -8, 4, 16, 28].map((x, i) => (
              <div key={i} className="absolute" style={{ width: 1.5, height: i === 2 ? 12 : 9, background: 'rgba(139,92,246,0.8)', top: -10, left: `calc(50% + ${x}px)`, borderRadius: 1 }} />
            ))}
            <div className="rounded-full flex items-center justify-center"
              style={{ width: 46, height: 46, background: 'radial-gradient(circle at 35% 35%, #c4b5fd, #7c3aed 45%, #2e1065)', boxShadow: '0 0 15px rgba(139,92,246,0.7)' }}>
              <div className="rounded-full" style={{ width: 20, height: 20, background: '#030712' }}>
                <div className="rounded-full" style={{ width: 7, height: 7, background: 'rgba(255,255,255,0.95)', marginTop: 4, marginLeft: 5 }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Brand */}
        <div className="relative z-10 text-center px-8 mb-6">
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="font-black tracking-[6px] leading-none mb-1"
            style={{ fontSize: 42, fontFamily: "'Rajdhani', sans-serif", color: '#fff', textShadow: '0 0 40px rgba(139,92,246,0.7), 0 0 80px rgba(139,92,246,0.3)' }}
          >ZENKAI</motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontSize: 22, fontFamily: "'Rajdhani', sans-serif", color: '#a78bfa', letterSpacing: 8, textShadow: '0 0 20px rgba(167,139,250,0.6)' }}
          >STORE</motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-xs tracking-[3px] uppercase mt-3" style={{ color: '#475569' }}
          >Your universe of anime awaits</motion.p>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[3px] px-4 py-1.5 rounded-full whitespace-nowrap"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd' }}>
          ✦ LEVEL UP YOUR COLLECTION ✦
        </div>
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs tracking-[2px] px-3 py-1 rounded"
          style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', color: '#67e8f9' }}>
          SEASON 01
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full md:w-[58%] lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative" style={{ background: '#050b18' }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Logo pill */}
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', fontFamily: "'Rajdhani', sans-serif" }}>Z</div>
            <span className="text-xs tracking-widest font-semibold" style={{ color: '#a78bfa' }}>ZENKAI STORE</span>
          </div>

          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="font-black tracking-widest mb-1"
            style={{ fontSize: 30, fontFamily: "'Rajdhani', sans-serif", color: '#fff' }}
          >BEGIN YOUR ARC</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-sm mb-8" style={{ color: '#475569' }}
          >Create your account. Your story starts here.</motion.p>

          <form onSubmit={handleSubmit}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <InputField type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                accentColor="#a78bfa"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 }}>
              <InputField type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
                accentColor="#7c3aed"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
              />
            </motion.div>

            {/* Password with show/hide */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.39 }} className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: '#475569' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Create Password" required
                className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 placeholder:text-slate-600 text-slate-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#475569' }}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 35px rgba(124,58,237,0.5), 0 0 60px rgba(6,182,212,0.2)' }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full relative overflow-hidden py-4 rounded-xl font-black tracking-[3px] text-white"
              style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #4f46e5 40%, #06b6d4 100%)', fontFamily: "'Rajdhani', sans-serif", fontSize: 15, boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
            >
              <motion.div className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', transform: 'skewX(-20deg)' }}
                animate={{ x: ['-150%', '300%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
              />
              <span className="relative z-10">SIGN UP — LET'S GO →</span>
            </motion.button>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="text-center text-xs mt-6" style={{ color: '#334155' }}
          >
            Already a nakama?{' '}
            <Link to="/login" className="font-bold transition-colors" style={{ color: '#a78bfa' }}
              onMouseEnter={e => e.currentTarget.style.color = '#67e8f9'}
              onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
            >Return to base →</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
