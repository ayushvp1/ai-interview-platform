"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X, Code, Users, Briefcase, Play, Mic, Video, ChevronRight, Star, CheckCircle, TrendingUp, Award, Shield, Zap, BarChart3, Clock, Target, Sparkles, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import CandidateGatekeeper from "@/components/CandidateGatekeeper";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showGatekeeper, setShowGatekeeper] = useState(false);
  const [gatekeeperMode, setGatekeeperMode] = useState<'login' | 'signup'>('signup');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem("candidate_token");
    const userInfo = localStorage.getItem("interview_user_info");
    if (token && userInfo) {
      router.push("/candidate/dashboard");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50">

      <Navbar 
        onSignInClick={() => {
          setGatekeeperMode('login');
          setShowGatekeeper(true);
        }} 
        onGetStartedClick={() => {
          setGatekeeperMode('signup');
          setShowGatekeeper(true);
        }} 
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Enhanced Perspective Grid Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Grid (Perspective) */}
          <div className="absolute top-0 left-0 right-0 h-[40%] opacity-[0.15]" style={{ perspective: '1000px' }}>
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(56, 189, 248, 0.2) 1px, transparent 1px),
                linear-gradient(to right, rgba(56, 189, 248, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'rotateX(-75deg)',
              transformOrigin: 'top center',
              height: '200%'
            }} />
          </div>

          {/* Bottom Grid (Perspective) */}
          <div className="absolute bottom-0 left-0 right-0 h-[40%] opacity-[0.15]" style={{ perspective: '1000px' }}>
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to top, rgba(56, 189, 248, 0.2) 1px, transparent 1px),
                linear-gradient(to right, rgba(56, 189, 248, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'rotateX(75deg)',
              transformOrigin: 'bottom center',
              height: '200%',
              top: '-100%'
            }} />
          </div>

          {/* Vignette Overlay to focus center */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0f172a_85%)]" />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full mb-8 border border-white/20">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/90">Trusted by Professionals Worldwide</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Ace Your Next Interview with
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> AI Precision</span>
            </h1>

            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Practice with our advanced AI interviewer, get real-time feedback on your responses,
              body language, and communication skills. Land your dream job with confidence.
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setGatekeeperMode('signup');
                  setShowGatekeeper(true);
                }}
                className="group inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all shadow-2xl hover:scale-105 active:scale-95"
              >
                <Play className="w-6 h-6 fill-blue-600 text-blue-600" />
                Start Free Practice
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interview Types Section */}
      <section id="start" className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Technical Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(15, 23, 42, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl opacity-50" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4 text-sm font-bold tracking-wide">
              <Zap className="w-4 h-4" />
              SPECIALIZED PATHS
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Master Every <span className="text-blue-600">Interview Mode</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Tailored simulations for the most in-demand roles. Choose your path and start perfecting your delivery.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10">
            {/* Technical Interview Card */}
            <div className="group h-full bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />

              <div className="relative flex-1 flex flex-col">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-8 group-hover:rotate-6 transition-transform">
                  <Code className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Technical Interview</h3>
                <p className="text-slate-600 mb-8 leading-relaxed min-h-[4rem]">
                  Master complex algorithms, system design, and coding challenges with real-time feedback.
                </p>

                <div className="space-y-4 mb-10">
                  {['Data Structures & Algorithms', 'System Architecture', 'Code Clarity & Optimization'].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-3">
                  <Link href="/interview/technical" className="flex-1 bg-slate-900 text-white px-4 py-3.5 rounded-xl font-bold text-center hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-600/20">
                    Test Mode
                  </Link>
                  <Link href="/interview/voice/technical" className="p-3.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100" title="Voice Interview">
                    <Mic className="w-5 h-5" />
                  </Link>
                  <Link href="/interview/video/technical" className="p-3.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100" title="Video Interview">
                    <Video className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* HR Interview Card */}
            <div className="group h-full bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-500 hover:-translate-y-2 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />

              <div className="relative flex-1 flex flex-col">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-8 group-hover:-rotate-6 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">HR Interview</h3>
                <p className="text-slate-600 mb-8 leading-relaxed min-h-[4rem]">
                  Perfect your storytelling and behavioral responses using the STAR method.
                </p>

                <div className="space-y-4 mb-10">
                  {['Behavioral Analysis', 'Cultural Alignment', 'Conflict Resolution'].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-3">
                  <Link href="/interview/hr" className="flex-1 bg-slate-900 text-white px-4 py-3.5 rounded-xl font-bold text-center hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-600/20">
                    Test Mode
                  </Link>
                  <Link href="/interview/voice/hr" className="p-3.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100" title="Voice Interview">
                    <Mic className="w-5 h-5" />
                  </Link>
                  <Link href="/interview/video/hr" className="p-3.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100" title="Video Interview">
                    <Video className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Managerial Interview Card */}
            <div className="group h-full bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-purple-200/40 transition-all duration-500 hover:-translate-y-2 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />

              <div className="relative flex-1 flex flex-col">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30 mb-8 group-hover:rotate-12 transition-transform">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Managerial Interview</h3>
                <p className="text-slate-600 mb-8 leading-relaxed min-h-[4rem]">
                  Demonstrate leadership potential and strategic decision-making capabilities.
                </p>

                <div className="space-y-4 mb-10">
                  {['Team Leadership Keys', 'Strategic Roadmap Planning', 'KPI & Goal Delivery'].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-3">
                  <Link href="/interview/managerial" className="flex-1 bg-slate-900 text-white px-4 py-3.5 rounded-xl font-bold text-center hover:bg-purple-600 transition-all shadow-lg hover:shadow-purple-600/20">
                    Test Mode
                  </Link>
                  <Link href="/interview/voice/managerial" className="p-3.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all border border-slate-100" title="Voice Interview">
                    <Mic className="w-5 h-5" />
                  </Link>
                  <Link href="/interview/video/managerial" className="p-3.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all border border-slate-100" title="Video Interview">
                    <Video className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-24 bg-white relative overflow-hidden">
        {/* Technical Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(15, 23, 42, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Why <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Professionals</span> Choose Us
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Experience the future of interview preparation with our industry-leading AI features.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="group bg-slate-50/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Real-time Feedback</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Get instant AI-powered evaluation on your answers, tone, and delivery while you speak.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-50/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-2">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Detailed Analytics</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Track your progress with comprehensive scoring across multiple professional parameters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-50/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 hover:border-purple-200 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-purple-600/20 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Body Language</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                AI analysis of your expressions, eye contact, and engagement to perfect your presence.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-slate-50/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 hover:border-amber-200 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-2">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-amber-600/20 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Practice Anytime</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                24/7 availability means you can practice whenever it suits your personal schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Real Results, <span className="text-blue-600">Real Success</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals who have already achieved their career goals with our platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              {
                name: "Sarah K.",
                role: "Software Engineer at Google",
                content: "The AI feedback was incredibly accurate. After 5 practice sessions, I aced my Google interview. The video analysis helped me improve my body language significantly.",
                color: "from-blue-500 to-blue-600",
                initials: "SK"
              },
              {
                name: "Michael R.",
                role: "Product Manager at Meta",
                content: "The behavioral interview practice was spot-on. I felt so prepared for my HR rounds. The personalized improvement tips made all the difference.",
                color: "from-emerald-500 to-emerald-600",
                initials: "MR"
              },
              {
                name: "Aisha L.",
                role: "Data Scientist at Amazon",
                content: "As a non-native speaker, the voice interview feature helped me practice my communication. My clarity scores improved from 60% to 90% in just 2 weeks!",
                color: "from-purple-500 to-purple-600",
                initials: "AL"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col hover:shadow-2xl transition-all duration-500 group">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm" />
                  ))}
                </div>

                <div className="relative mb-8">
                  <span className="absolute -top-4 -left-2 text-6xl text-slate-100 font-serif leading-none select-none group-hover:text-blue-50 transition-colors">"</span>
                  <p className="text-lg text-slate-700 font-medium leading-relaxed italic relative z-10">
                    {testimonial.content}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-4 pt-8 border-t border-slate-50">
                  <div className={`w-14 h-14 bg-gradient-to-br ${testimonial.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg tracking-tight">{testimonial.name}</div>
                    <div className="text-sm font-semibold text-blue-600/80">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Immersive background with mesh-style gradient */}
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-indigo-900/40" />

        {/* Floating decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-bold text-white tracking-widest uppercase">Start for Free</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter leading-[1.1]">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Transform</span> Your Career?
          </h2>

          <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed font-medium">
            Join 10,000+ professionals boosting their confidence and landing dream jobs. Start your journey today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => {
                setGatekeeperMode('signup');
                setShowGatekeeper(true);
              }}
              className="group relative px-10 py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-500/20 hover:shadow-white/20 transition-all duration-500 hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              <PlayCircle className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform" />
              Start Free Practice
            </button>

          </div>
        </div>
      </section>

      {/* Simplified Premium Footer */}
      <footer id="footer" className="bg-slate-950 text-slate-400 py-12 relative overflow-hidden">
        {/* Subtle grid background for footer */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="AI Interview Platform" 
              width={300} 
              height={75} 
              className="h-16 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity" 
            />
          </Link>
          <div className="text-sm text-slate-500 font-medium tracking-wide">
            © 2026 AI Interview Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {
        showGatekeeper && (
          <CandidateGatekeeper
            interviewType="General"
            initialMode={gatekeeperMode}
            onBack={() => setShowGatekeeper(false)}
            onComplete={() => {
              setShowGatekeeper(false);
              router.push("/candidate/dashboard");
            }}
          />
        )
      }
    </main>
  );
}
