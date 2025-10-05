"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Wrench, Calendar, Clock } from "lucide-react";

export default function UnderConstruction() {
  // Set the target date to 14 days from now
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 text-white flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Icon */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-blue-500/20 p-8 rounded-full">
              <Wrench className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Stránky jsou ve vývoji
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-blue-100 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Pracujeme na nové verzi webových stránek Pavla Fišera
          </motion.p>

          {/* Countdown Timer */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-blue-200" />
              <p className="text-lg text-blue-100">Očekávané dokončení za:</p>
            </div>

            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              {/* Days */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-5xl font-bold mb-2">{timeLeft.days}</div>
                <div className="text-sm text-blue-200 uppercase tracking-wide">Dní</div>
              </div>

              {/* Hours */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-5xl font-bold mb-2">{timeLeft.hours}</div>
                <div className="text-sm text-blue-200 uppercase tracking-wide">Hodin</div>
              </div>

              {/* Minutes */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-5xl font-bold mb-2">{timeLeft.minutes}</div>
                <div className="text-sm text-blue-200 uppercase tracking-wide">Minut</div>
              </div>

              {/* Seconds */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-5xl font-bold mb-2">{timeLeft.seconds}</div>
                <div className="text-sm text-blue-200 uppercase tracking-wide">Sekund</div>
              </div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-200" />
              <h2 className="text-2xl font-bold">Co se chystá?</h2>
            </div>
            <p className="text-blue-100 text-lg leading-relaxed">
              Připravujeme pro vás modernizované webové stránky s lepším přehledem o práci 
              zastupitele Pavla Fišera, aktuálními informacemi z Prahy 4 a jednoduchou 
              komunikací. Děkujeme za trpělivost!
            </p>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <p className="text-blue-200">
              V případě naléhavých záležitostí nás můžete kontaktovat na:{" "}
              <a 
                href="mailto:info@fiserpavel.cz" 
                className="text-white font-semibold hover:underline"
              >
                info@fiserpavel.cz
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
