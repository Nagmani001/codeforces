"use client"

import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Play, 
  Code2, 
  ChevronRight, 
  Zap,
  LayoutGrid,
  User
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

import { useMotionValue, useAnimationFrame } from "framer-motion";

const OrbitIcon = ({
  size,
  duration,
  delay = 0,
  count = 1,
}: {
  size: number;
  duration: number;
  delay?: number;
  count?: number;
}) => {
  const radius = size / 2;
  const rotation = useMotionValue(0);

  useAnimationFrame((t) => {
    rotation.set((t / 1000) * (360 / duration));
  });

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: size, height: size, rotate: rotation }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;

        return (
          <motion.div
            key={i}
            style={{ rotate: rotation.get() * -1 }} // 👈 cancels rotation
            className="absolute top-1/2 left-1/2 w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow-sm border border-border flex items-center justify-center text-muted-foreground"
            transformTemplate={({ rotate }) => `
              rotate(${angle}deg)
              translateY(-${radius}px)
              rotate(${rotate})
            `}
          >
            <User size={14} />
          </motion.div>
        );
      })}
    </motion.div>
  );
};
export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Everything You Need to Excel</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Powerful tools and resources designed to help you become a better programmer.
            </p>
          </motion.div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {/* 1. Track Progress */}
          <motion.div variants={item} className="p-8 flex flex-col justify-between group rounded-3xl bg-card border border-border hover:-translate-y-1 hover:border-foreground/20 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                    <img src="https://picsum.photos/seed/abhishek/100/100" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Abhishek Salunke</p>
                    <p className="text-[11px] text-muted-foreground">Candidate Master</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Current Rating</p>
                    <p className="text-3xl font-bold text-foreground">1720</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm mb-1">
                    <TrendingUp size={14} />
                    <span>+270</span>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center h-8">
                  {[1200, 1450, 1720].map((rating, i) => (
                    <React.Fragment key={i}>
                      <div className="text-xs font-medium text-muted-foreground">{rating}</div>
                      {i < 2 && <ChevronRight size={10} className="text-muted-foreground/50" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-1 text-foreground">Track Progress</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Monitor your growth with detailed statistics and performance analytics.</p>
            </div>
          </motion.div>

          {/* 2. Global Community */}
          <motion.div variants={item} className="p-8 flex flex-col justify-between relative overflow-hidden group rounded-3xl bg-card border border-border hover:-translate-y-1 hover:border-foreground/20 transition-all duration-300">
            <div className="relative h-48 flex items-center justify-center">
              {/* Orbits */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border w-56 h-56" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border w-40 h-40" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border w-24 h-24" />
              
              {/* Center Logo */}
              <div className="relative z-10 w-10 h-10 rounded-xl bg-card shadow-lg border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Code2 size={20} className="text-foreground" />
              </div>

              {/* Revolving Icons */}
              <OrbitIcon size={224} duration={50} count={2} />
              <OrbitIcon size={160} duration={30} count={2} delay={1} />
              <OrbitIcon size={96} duration={70} count={1} delay={2} />
              
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-1 text-foreground">Global Community</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Connect with programmers worldwide, share solutions, and learn together.</p>
            </div>
          </motion.div>

          {/* 3. Rated Contests */}
          <motion.div variants={item} className="p-8 flex flex-col justify-between group rounded-3xl bg-card border border-border hover:-translate-y-1 hover:border-foreground/20 transition-all duration-300">
            <div className="space-y-3">
              {[
                { name: "Contest #1", time: "6:00 PM", tag: "Div 2", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
                { name: "Contest #2", time: "8:30 PM", tag: "Global", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
                { name: "Contest #3", time: "10:00 PM", tag: "Div 1", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
              ].map((contest, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border group-hover:bg-muted/80 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
                      <Calendar size={14} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{contest.name}</p>
                      <p className="text-[10px] text-muted-foreground">{contest.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${contest.color}`}>{contest.tag}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-1 text-foreground">Rated Contests</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Participate in regular rated competitions and earn your official rating.</p>
            </div>
          </motion.div>

          {/* 5. Vast Problemset (Large Card) */}
          <motion.div variants={item} className="p-8 md:col-span-2 flex flex-col justify-between group overflow-hidden rounded-3xl bg-card border border-border hover:-translate-y-1 hover:border-foreground/20 transition-all duration-300">
            <div className="flex flex-wrap items-center justify-center gap-4 p-6 min-h-[16rem] mb-4">
              {[
                { text: "Two Sum", rotate: -5 },
                { text: "Add Two Numbers", rotate: 3 },
                { text: "Longest Substring Without Repeating Characters", rotate: -2 },
                { text: "Median of Two Sorted Arrays", rotate: 5 },
                { text: "Longest Palindromic Substring", rotate: -4 },
                { text: "Zigzag Conversion", rotate: 2 },
                { text: "Reverse Integer", rotate: -3 },
              ].map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ 
                    opacity: 1, 
                    scale: 1,
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    delay: i * 0.1,
                    y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" }
                  }}
                  viewport={{ once: true }}
                  className="px-6 py-3 rounded-full bg-card shadow-sm border border-border text-sm font-medium text-foreground whitespace-nowrap hover:shadow-md transition-all cursor-default"
                  style={{ 
                    transform: `rotate(${v.rotate}deg)`
                  }}
                >
                  {v.text}
                </motion.div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutGrid size={18} className="text-muted-foreground" />
                <h3 className="text-xl font-bold text-foreground">Vast Problemset</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">Access thousands of algorithmic problems ranging from beginner to grandmaster level. Filter by tags, difficulty, or popularity.</p>
            </div>
          </motion.div>

          {/* 4. Virtual Contests */}
          <motion.div variants={item} className="p-8 flex flex-col justify-between group rounded-3xl bg-card border border-border hover:-translate-y-1 hover:border-foreground/20 transition-all duration-300">
            <div className="space-y-4">
              {[
                { name: "Round #145", type: "Virtual", icon: <Play size={12} fill="currentColor" /> },
                { name: "Educational Round", type: "Practice", icon: <Zap size={12} fill="currentColor" /> },
                { name: "Global Round 25", type: "Virtual", icon: <Play size={12} fill="currentColor" /> },
              ].map((v, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between group-hover:bg-muted/80 transition-all duration-300">
                  <div>
                    <p className="text-xs font-bold text-foreground">{v.name}</p>
                    <p className="text-[10px] text-muted-foreground">{v.type}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-none pb-[2px] pr-[1px]">
                    {v.icon}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-1 text-foreground">Virtual Contests</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Practice with past contests in a simulated competitive environment.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
