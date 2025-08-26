// ProblemSolution2Up: left = pains, right = solution, neobrutal split
import React from "react";
import { User, Bot, Mail, CreditCard, CheckCircle, Settings2, Zap, Cookie, Timer, Plug } from "lucide-react";
import { motion } from "framer-motion";

export const ProblemSolution2Up: React.FC = () => (
  <section className="w-full py-20 px-4 bg-white" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}>
    <h2 className="text-3xl font-black text-center mb-2 text-[#0f172a]">From Chaos to Clarity in <span className="text-blue-600">One Step</span></h2>
    <p className="text-lg text-center mb-12 text-gray-700 font-semibold max-w-2xl mx-auto">
      Every fraud pain point — bots, trial abuse, fake signups, stolen credentials, chargebacks — gets filtered through our device intelligence engine, producing one simple outcome:<br />
      <span className="inline-flex items-center justify-center gap-2 mt-2 text-green-700 text-xl font-bold"><CheckCircle className="inline w-6 h-6 text-green-600" strokeWidth={2.4} /> Fraud stopped. <CheckCircle className="inline w-6 h-6 text-green-600" strokeWidth={2.4} /> Customers approved.</span>
    </p>
    <div className="flex flex-col md:flex-row items-center justify-center gap-10 relative w-full">
      {/* Pain Points Stack */}
      <div className="flex flex-col gap-4 z-10">
        {[
          { icon: <User className="w-6 h-6 text-[#164e63]" />, label: "Blind Spots in Identity" },
          { icon: <Bot className="w-6 h-6 text-[#164e63]" />, label: "Bots & Automation" },
          { icon: <Mail className="w-6 h-6 text-[#164e63]" />, label: "Fake Emails & Accounts" },
          { icon: <Zap className="w-6 h-6 text-[#164e63]" />, label: "Trial Abuse" },
          { icon: <CreditCard className="w-6 h-6 text-[#164e63]" />, label: "Payment Fraud" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="bg-white rounded-xl px-6 py-4 flex items-center gap-4 border border-gray-200 shadow-sm"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            {item.icon}
            <span className="font-bold text-[#0f172a]">{item.label}</span>
          </motion.div>
        ))}
      </div>
      {/* Merging arrow from pain points to engine */}
      <div className="hidden md:flex flex-col justify-center items-center mx-2 min-w-[48px]">
        <svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="16" x2="52" y2="16" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
          <polyline points="44,8 52,16 44,24" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Engine Box */}
      <div className="flex flex-col items-center justify-center bg-white rounded-xl px-8 py-10 min-w-[310px] max-w-xs border border-gray-200 shadow-sm self-center">
        <img src="/Logo.png" alt="Logo" className="h-12 w-auto mb-2 mx-auto" />
        <div className="text-xl font-black mb-2 text-[#0f172a] text-center">VisitorIQ Device Intelligence Engine</div>
        <div className="text-[#164e63] font-semibold text-center text-sm mb-1">100+ signals analyzed in real-time</div>
        <div className="flex gap-2 mt-2 animate-pulse">
          <Zap className="text-[#0ea5e9] w-5 h-5" />
          <Cookie className="text-[#0ea5e9] w-5 h-5" />
          <Timer className="text-[#0ea5e9] w-5 h-5" />
          <Plug className="text-[#0ea5e9] w-5 h-5" />
        </div>
      </div>
      {/* Single right arrow from engine to output */}
      <div className="hidden md:flex flex-col items-center mx-2 min-w-[48px] justify-center">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="10" y1="30" x2="50" y2="30" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
          <polyline points="40,20 50,30 40,40" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Output Card */}
      <motion.div
        className="flex flex-col items-center gap-4 z-10"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white rounded-xl px-8 py-8 flex flex-col items-center min-w-[250px] border border-gray-200 shadow-sm">
          <CheckCircle className="w-10 h-10 text-[#0ea5e9] mb-2" strokeWidth={2.4} />
          <div className="text-2xl font-black text-[#164e63] mb-1">Fraud Stopped.</div>
          <div className="text-lg font-bold text-[#164e63] mb-2">Real Customers Approved.</div>
          <button className="mt-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#0ea5e9] to-[#164e63] text-white font-extrabold text-lg border-none shadow-sm hover:from-[#164e63] hover:to-[#0ea5e9] transition">See It in Action</button>
        </div>
      </motion.div>
    </div>
  </section>
);
