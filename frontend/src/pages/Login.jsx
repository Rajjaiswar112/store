import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Dragon/power orbs for the left panel — different from Register's eye
const ORBS = Array.from({ length: 7 }).map((_, i) => ({
  id: i,
  size: 14 + i * 4,
  angle: (i / 7) * 360,
  color: i % 2 === 0 ? '#f59e0b' : '#a35252',
  glowColor: i % 2 === 0 ? 'rgba(245,158,11,0.6)' : 'rgba(239,68,68,0.6)',
  stars: i + 1,
}));

const PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  size: Math.random() * 3 + 2,
  x: Math.random() * 100,
  duration: Math.random() * 6 + 5,
  delay: Math.random() * 6,
  color: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#ef4444' : '#fca5a5',
}));

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Logging in...", email, password);
    // Add your login API logic here
  };

  return (
    <div className="min-h-screen w-full flex bg-[#030712] text-white overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* ── LEFT PANEL — Dragon Ball / Power theme ── */}
      <div className="hidden md:flex md:w-[42%] lg:w-[45%] relative flex-col justify-center items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0c0500 0%, #1a0a00 40%, #0a0510 100%)', borderRight: '1px solid rgba(245,158,11,0.2)' }}>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(245,158,11,0.02) 3px, rgba(245,158,11,0.02) 4px)'
        }} />

        {/* Speed lines — horizontal burst from center */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * 360;
          const len = 120 + Math.random() * 80;
          return (
            <motion.div key={i} className="absolute pointer-events-none"
              style={{
                width: len, height: 1,
                background: `linear-gradient(90deg, rgba(245,158,11,0.25), transparent)`,
                transformOrigin: '0 50%',
                left: '50%', top: '38%',
                transform: `rotate(${angle}deg)`,
              }}
              animate={{ opacity: [0.15, 0.5, 0.15], scaleX: [0.8, 1.1, 0.8] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          );
        })}

        {/* Corner brackets — amber theme */}
        <div className="absolute top-5 left-5 w-8 h-8" style={{ borderTop: '2px solid #f59e0b', borderLeft: '2px solid #f59e0b', borderRadius: '4px 0 0 0' }} />
        <div className="absolute top-5 right-5 w-8 h-8" style={{ borderTop: '2px solid rgba(239,68,68,0.5)', borderRight: '2px solid rgba(239,68,68,0.5)', borderRadius: '0 4px 0 0' }} />
        <div className="absolute bottom-5 left-5 w-8 h-8" style={{ borderBottom: '2px solid rgba(239,68,68,0.5)', borderLeft: '2px solid rgba(239,68,68,0.5)', borderRadius: '0 0 0 4px' }} />
        <div className="absolute bottom-5 right-5 w-8 h-8" style={{ borderBottom: '2px solid #f59e0b', borderRight: '2px solid #f59e0b', borderRadius: '0 0 4px 0' }} />

        {/* Floating ember particles */}
        {PARTICLES.map((p) => (
          <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, bottom: '-10px', background: p.color, boxShadow: `0 0 8px ${p.color}` }}
            animate={{ y: [0, -700], opacity: [0, 1, 1, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* ── DRAGON ORBS ARRANGEMENT ── */}
        <div className="relative mb-10" style={{ width: 180, height: 180 }}>
          {/* Central aura */}
          <motion.div className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Orbit ring */}
          <motion.div className="absolute inset-4 rounded-full"
            style={{ border: '1px solid rgba(245,158,11,0.2)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div className="absolute inset-8 rounded-full"
            style={{ border: '1px solid rgba(239,68,68,0.15)' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />

          {/* Dragon orbs orbiting */}
          {ORBS.map((orb, i) => {
            const rad = (orb.angle * Math.PI) / 180;
            const radius = 70;
            const cx = 90 + radius * Math.cos(rad);
            const cy = 90 + radius * Math.sin(rad);
            return (
              <motion.div key={orb.id}
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  width: orb.size, height: orb.size,
                  left: cx - orb.size / 2, top: cy - orb.size / 2,
                  background: `radial-gradient(circle at 35% 35%, ${orb.color}ee, ${orb.color}88)`,
                  boxShadow: `0 0 12px ${orb.glowColor}, 0 0 4px ${orb.color}`,
                }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
              >
                {/* Stars on each orb */}
                {Array.from({ length: Math.min(orb.stars, 4) }).map((_, si) => (
                  <div key={si} className="absolute rounded-full bg-white"
                    style={{ width: 2.5, height: 2.5, top: 3 + si * 4, left: 3 + (si % 2) * 5, opacity: 0.9 }}
                  />
                ))}
              </motion.div>
            );
          })}

          {/* Center power glow */}
          <motion.div className="absolute rounded-full"
            style={{ width: 36, height: 36, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, #fef3c7, #f59e0b 50%, #92400e)', boxShadow: '0 0 25px rgba(245,158,11,0.8), 0 0 50px rgba(245,158,11,0.4)' }}
            animate={{ scale: [1, 1.15, 1], boxShadow: ['0 0 25px rgba(245,158,11,0.8)', '0 0 40px rgba(245,158,11,1)', '0 0 25px rgba(245,158,11,0.8)'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Brand */}
        <div className="relative z-10 text-center px-8 mb-6">
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="font-black tracking-[6px] leading-none mb-1"
            style={{ fontSize: 42, fontFamily: "'Rajdhani', sans-serif", color: '#fff', textShadow: '0 0 40px rgba(245,158,11,0.7), 0 0 80px rgba(245,158,11,0.3)' }}
          >ZENKAI</motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontSize: 22, fontFamily: "'Rajdhani', sans-serif", color: '#fbbf24', letterSpacing: 8, textShadow: '0 0 20px rgba(251,191,36,0.6)' }}
          >STORE</motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-xs tracking-[3px] uppercase mt-3" style={{ color: '#475569' }}
          >Power beyond limits awaits</motion.p>
        </div>

        {/* Bottom badge */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[3px] px-4 py-1.5 rounded-full whitespace-nowrap"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24' }}>
          ✦ YOUR JOURNEY CONTINUES ✦
        </div>
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs tracking-[2px] px-3 py-1 rounded"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          POWER LEVEL: MAX
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full md:w-[58%] lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative" style={{ background: '#050b18' }}>
        {/* Amber ambient glow top-right */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        {/* Red ambient glow bottom-left */}
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Logo pill — amber theme */}
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', fontFamily: "'Rajdhani', sans-serif" }}>Z</div>
            <span className="text-xs tracking-widest font-semibold" style={{ color: '#fbbf24' }}>ZENKAI STORE</span>
          </div>

          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="font-black tracking-widest mb-1"
            style={{ fontSize: 30, fontFamily: "'Rajdhani', sans-serif", color: '#fff' }}
          >WELCOME BACK, NAKAMA</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-sm mb-8" style={{ color: '#475569' }}
          >Your squad has been waiting. Power up.</motion.p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 }} className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300"
                style={{ color: emailFocused ? '#f59e0b' : '#475569' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                placeholder="Email Address" required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 placeholder:text-slate-600 text-slate-200"
                style={{
                  background: emailFocused ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${emailFocused ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: emailFocused ? '0 0 0 3px rgba(245,158,11,0.1), 0 4px 20px rgba(245,158,11,0.1)' : 'none',
                }}
              />
              {emailFocused && (
                <motion.div className="absolute bottom-0 left-4 right-4 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }}
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300"
                style={{ color: passFocused ? '#ef4444' : '#475569' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)}
                placeholder="Password" required
                className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 placeholder:text-slate-600 text-slate-200"
                style={{
                  background: passFocused ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${passFocused ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: passFocused ? '0 0 0 3px rgba(239,68,68,0.1), 0 4px 20px rgba(239,68,68,0.1)' : 'none',
                }}
              />
              {passFocused && (
                <motion.div className="absolute bottom-0 left-4 right-4 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.3 }}
                />
              )}
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#475569' }}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </motion.div>

            {/* Forgot password */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex justify-end -mt-4 mb-5">
              <Link to="/forgot-password" className="text-xs transition-colors"
                style={{ color: '#475569' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >Forgot password?</Link>
            </motion.div>

            {/* Submit — amber/red gradient for Login */}
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 35px rgba(245,158,11,0.5), 0 0 60px rgba(239,68,68,0.2)' }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full relative overflow-hidden py-4 rounded-xl font-black tracking-[3px] text-white"
              style={{ background: 'linear-gradient(90deg, #92400e 0%, #ef4444 45%, #f59e0b 100%)', fontFamily: "'Rajdhani', sans-serif", fontSize: 15, boxShadow: '0 0 20px rgba(245,158,11,0.25)' }}
            >
              <motion.div className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)', transform: 'skewX(-20deg)' }}
                animate={{ x: ['-150%', '300%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
              />
              <span className="relative z-10">SIGN IN — POWER UP →</span>
            </motion.button>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.52 }}
            className="text-center text-xs mt-6" style={{ color: '#334155' }}
          >
            New to the squad?{' '}
            <Link to="/register" className="font-bold transition-colors" style={{ color: '#fbbf24' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
              onMouseLeave={e => e.currentTarget.style.color = '#fbbf24'}
            >Begin your arc →</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
