import { useState } from 'react';
import { motion } from 'framer-motion';
import { webtoons } from '../data/webtoons';
import { useApp } from '../context/AppContext';
import WebtoonGrid from '../components/home/WebtoonGrid';
import { fadeInUp } from '../animations/variants';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DailyPage() {
  const { darkMode } = useApp();
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [activeDay, setActiveDay] = useState(today);

  const dayWebtoons = webtoons.filter(w => w.updateDay === activeDay);

  return (
    <div className={`min-h-screen pt-20 pb-20 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-10">
          <h1 className={`text-4xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Daily <span className="gradient-text">Updates</span>
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>New episodes every day of the week</p>
        </motion.div>

        {/* Day Tabs */}
        <div className={`flex gap-2 p-1.5 rounded-2xl mb-10 overflow-x-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
          {days.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeDay === day
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:bg-white'
              }`}
            >
              {day === today ? `${day.slice(0, 3)} (Today)` : day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Results */}
        <motion.div key={activeDay} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {dayWebtoons.length > 0 ? (
            <>
              <p className={`mb-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {dayWebtoons.length} webtoons update on {activeDay}
              </p>
              <WebtoonGrid webtoons={dayWebtoons} />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📅</div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Rest Day!</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No scheduled updates today. Check back tomorrow!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
