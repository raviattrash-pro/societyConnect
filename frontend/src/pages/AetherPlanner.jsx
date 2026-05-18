import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AetherPlanner() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Task 1', completed: false },
    { id: 2, text: 'Task 2', completed: false },
    { id: 3, text: 'Task 3', completed: false },
    { id: 4, text: 'Task 4', completed: false },
    { id: 5, text: 'Task 5', completed: false },
    { id: 6, text: 'Task 6', completed: false },
  ]);

  const [timer, setTimer] = useState(1500); // 25 min

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '5px' }}>Aether Planner</h1>
          <h2 style={{ fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--primary-dark)' }}>Good Morning 🌞</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', padding: '10px', borderRadius: '30px', boxShadow: 'var(--neu-flat)' }}>
            {['#fcd385', '#60a5fa', '#34d399', '#1e3a8a', '#8b5cf6', '#f472b6', '#2dd4bf', '#d4d4d8'].map(c => (
              <div key={c} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, boxShadow: 'var(--neu-inset)' }}></div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '10px 20px', borderRadius: '30px', boxShadow: 'var(--neu-flat)' }}>
            <span>🗑️</span> <span>&lt;</span> <strong>15-05-2026 📅</strong> <span>&gt;</span>
          </div>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
          <small>DAILY PROGRESS</small>
          <span>0%</span>
        </div>
        <div style={{ height: '12px', borderRadius: '10px', boxShadow: 'var(--neu-inset)', overflow: 'hidden' }}>
          <div style={{ width: '0%', height: '100%', background: 'var(--primary)' }}></div>
        </div>
      </div>

      {/* Zen Breath */}
      <div className="card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ marginBottom: '5px', fontSize: '1.2rem' }}>Zen Breath 🌊</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Sync your breathing. Inhale 4s, Exhale 4s.</p>
        </div>
        <button style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', background: 'var(--bg)', boxShadow: 'var(--neu-flat)', color: 'var(--primary-dark)', fontWeight: 'bold', cursor: 'pointer' }}>START</button>
      </div>

      {/* Main Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}
      >
        
        {/* Column 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card">
            <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>🎯 PRIME FOCUS 🎯</h4>
            <div style={{ padding: '12px 20px', borderRadius: '12px', boxShadow: 'var(--neu-inset)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⭐ <span style={{ color: 'var(--text-muted)' }}>Main Priority...</span>
            </div>
            <div style={{ padding: '12px 20px', borderRadius: '12px', boxShadow: 'var(--neu-inset)', color: 'var(--text-muted)' }}>
              Secondary Goal
            </div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>🕒 TIMELINE ⏳</h4>
            {['5 PM', '6 PM', '7 PM', '8 PM'].map(time => (
              <div key={time} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', width: '40px', color: 'var(--primary-dark)' }}>{time}</span>
                <div style={{ flex: 1, height: '40px', borderRadius: '12px', boxShadow: 'var(--neu-inset)' }}></div>
              </div>
            ))}
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>💡 WISDOM 💡</h4>
            <p style={{ fontStyle: 'italic', textAlign: 'center', marginBottom: '10px' }}>"Success is not final, failure is not fatal."</p>
            <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '20px' }}>- Winston Churchill</p>
            <button className="btn" style={{ width: '100%', color: 'var(--primary-dark)' }}>New Quote</button>
          </div>

        </div>

        {/* Column 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card">
            <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>✔️ TASKS ✅</h4>
            {tasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', boxShadow: 'var(--neu-inset)' }}></div>
                <div style={{ flex: 1, padding: '12px 20px', borderRadius: '12px', boxShadow: 'var(--neu-flat-sm)', color: 'var(--text-secondary)' }}>
                  {t.text}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>⏱️ FOCUS TIMER ⏱️</h4>
            <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>25:00</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn" style={{ flex: 1, background: 'var(--primary-dark)', color: 'white' }}>Start</button>
              <button className="btn" style={{ flex: 1 }}>Pause</button>
              <button className="btn" style={{ flex: 1 }}>Reset</button>
            </div>
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>🎧 AUDIO 🎵</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #fca5a5, #818cf8)', boxShadow: 'var(--neu-flat)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ▶️
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Forest Rain</div>
                <div style={{ height: '4px', background: 'var(--neu-inset)', borderRadius: '2px' }}>
                  <div style={{ width: '50%', height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Column 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card">
            <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>❤️ WELLNESS ❤️</h4>
            <div style={{ marginBottom: '15px' }}>
              <strong>Hydration 💧</strong>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {[1,2,3,4,5,6,7,8].map(i => <span key={i} style={{ opacity: i === 1 ? 1 : 0.3 }}>💧</span>)}
              </div>
            </div>
            <div>
              <strong>Mood ✨</strong>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', fontSize: '1.5rem' }}>
                <span>😫</span> <span>😐</span> <span>🙂</span> <span>😁</span> <span>🔥</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>📅 HABITS 🔥</h4>
            {['Reading 📖', 'Exercise 💪'].map(h => (
              <div key={h} style={{ marginBottom: '15px' }}>
                <strong>{h}</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  {['M','T','W','T','F','S','S'].map((day, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <small style={{ fontSize: '0.7rem' }}>{day}</small>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', boxShadow: 'var(--neu-inset)' }}></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>💳 EXPENSES 💸</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input type="text" placeholder="Item" style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--bg)', boxShadow: 'var(--neu-inset)' }} />
              <input type="text" placeholder="$" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--bg)', boxShadow: 'var(--neu-inset)' }} />
              <button style={{ width: '40px', borderRadius: '8px', border: 'none', background: 'var(--bg)', boxShadow: 'var(--neu-flat)', fontWeight: 'bold' }}>+</button>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-dark)' }}>Total: $0.00</div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>🧠 BRAIN DUMP 🧠</h4>
            <textarea placeholder="Ideas..." style={{ width: '100%', height: '100px', padding: '15px', borderRadius: '12px', border: 'none', background: 'var(--bg)', boxShadow: 'var(--neu-inset)', resize: 'none' }}></textarea>
          </div>

        </div>
      </div>
    </div>
  );
}
