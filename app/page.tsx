"use client";

import Link from "next/link";
import { Code, Users, Briefcase, Play, Mic, Video, ChevronRight, Star, CheckCircle, TrendingUp, Award, Shield, Zap, BarChart3, Clock, Target } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  // Clear any previous interview data when returning to home
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("chat_history");
      localStorage.removeItem("interview_user_info");
      localStorage.removeItem("video_metrics");
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">InterviewAI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/history" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              History
            </Link>
            <Link
              href="#start"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
            >
              Start Interview
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#start"
                className="group inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all shadow-xl"
              >
                <Play className="w-5 h-5" />
                Start Free Practice
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white/30 hover:bg-white/10 transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                View My Progress
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interview Types Section */}
      <section id="start" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Choose Your Interview Type
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select from our comprehensive range of interview simulations designed to prepare you for any scenario
            </p>
          </div>

          {/* Main Interview Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Technical */}
            <div className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                  <Code className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Technical Interview</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Deep dive into coding, system design, and technical problem-solving. Perfect for software engineers.
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Data Structures & Algorithms
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" /> System Design Questions
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Code Review Scenarios
                  </li>
                </ul>
                <div className="flex gap-3">
                  <Link href="/interview/technical" className="flex-1 text-center py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                    Text
                  </Link>
                  <Link href="/interview/voice/technical" className="p-3 bg-slate-100 rounded-xl hover:bg-purple-100 transition-colors" title="Voice Interview">
                    <Mic className="w-5 h-5 text-slate-600" />
                  </Link>
                  <Link href="/interview/video/technical" className="p-3 bg-slate-100 rounded-xl hover:bg-green-100 transition-colors" title="Video Interview">
                    <Video className="w-5 h-5 text-slate-600" />
                  </Link>
                </div>
              </div>
            </div>

            {/* HR */}
            <div className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <div className="p-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
                  <Users className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">HR Interview</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Master behavioral questions and showcase your soft skills. Essential for any job seeker.
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Behavioral Questions
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Culture Fit Assessment
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" /> STAR Method Practice
                  </li>
                </ul>
                <div className="flex gap-3">
                  <Link href="/interview/hr" className="flex-1 text-center py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors">
                    Text
                  </Link>
                  <Link href="/interview/voice/hr" className="p-3 bg-slate-100 rounded-xl hover:bg-purple-100 transition-colors" title="Voice Interview">
                    <Mic className="w-5 h-5 text-slate-600" />
                  </Link>
                  <Link href="/interview/video/hr" className="p-3 bg-slate-100 rounded-xl hover:bg-green-100 transition-colors" title="Video Interview">
                    <Video className="w-5 h-5 text-slate-600" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Managerial */}
            <div className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-500 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <div className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors">
                  <Briefcase className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Managerial Interview</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Demonstrate leadership and strategic thinking. Built for aspiring and current managers.
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Leadership Scenarios
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Team Management
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Strategic Decision Making
                  </li>
                </ul>
                <div className="flex gap-3">
                  <Link href="/interview/managerial" className="flex-1 text-center py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors">
                    Text
                  </Link>
                  <Link href="/interview/voice/managerial" className="p-3 bg-slate-100 rounded-xl hover:bg-purple-100 transition-colors" title="Voice Interview">
                    <Mic className="w-5 h-5 text-slate-600" />
                  </Link>
                  <Link href="/interview/video/managerial" className="p-3 bg-slate-100 rounded-xl hover:bg-green-100 transition-colors" title="Video Interview">
                    <Video className="w-5 h-5 text-slate-600" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Professionals Choose Us
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Advanced AI technology combined with proven interview techniques
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Feedback</h3>
              <p className="text-slate-600">
                Get instant AI-powered evaluation on your answers, tone, and delivery
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Detailed Analytics</h3>
              <p className="text-slate-600">
                Track your progress with comprehensive scoring across multiple parameters
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Video className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Body Language Analysis</h3>
              <p className="text-slate-600">
                AI-powered analysis of your expressions, eye contact, and engagement
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Practice Anytime</h3>
              <p className="text-slate-600">
                24/7 availability means you can practice whenever it suits your schedule
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-slate-600">
              See how our platform has helped professionals land their dream jobs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-700 mb-6 italic">
                "The AI feedback was incredibly accurate. After 5 practice sessions, I aced my Google interview. The video analysis helped me improve my body language significantly."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  SK
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Sarah K.</div>
                  <div className="text-sm text-slate-500">Software Engineer at Google</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-700 mb-6 italic">
                "The behavioral interview practice was spot-on. I felt so prepared for my HR rounds. The personalized improvement tips made all the difference."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  MR
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Michael R.</div>
                  <div className="text-sm text-slate-500">Product Manager at Meta</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-700 mb-6 italic">
                "As a non-native speaker, the voice interview feature helped me practice my communication. My clarity scores improved from 60% to 90% in just 2 weeks!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  AL
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Aisha L.</div>
                  <div className="text-sm text-slate-500">Data Scientist at Amazon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Interview Skills?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of professionals who have boosted their confidence and landed their dream jobs
          </p>
          <Link
            href="#start"
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl"
          >
            <Play className="w-6 h-6" />
            Start Your First Interview - Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">InterviewAI</span>
            </div>
            <div className="flex items-center gap-8 text-slate-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/history" className="hover:text-white transition-colors">History</Link>
              <Link href="/video-test" className="hover:text-white transition-colors">Video Test</Link>
            </div>
            <div className="text-slate-500 text-sm">
              © 2026 InterviewAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
