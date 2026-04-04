import React, { useState } from 'react';
import { Layout, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBlockchain } from '../BlockchainContext';

const Login = () => {
    const { login } = useBlockchain();
    const [role, setRole] = useState('institution');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (name && password) login(role, name, password);
        else alert('Please enter both identifier/name and password.');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f172a 100%)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ maxWidth: '480px', width: '100%', padding: '3.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <img src="/logo.png" alt="ProofMint Logo" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)', objectFit: 'cover' }} />
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Secure Portal</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Enter the decentralized certificate network</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`login-role-btn ${role === 'admin' ? 'active' : ''}`}
                        >
                            <Layout size={18} /> Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('institution')}
                            className={`login-role-btn ${role === 'institution' ? 'active' : ''}`}
                        >
                            <Building size={18} /> Institution
                        </button>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {role === 'admin' ? 'ADMINISTRATOR IDENTIFIER' : 'INSTITUTION NAME'}
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder={role === 'admin' ? "ID Number or Name" : "e.g. Stanford University"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            ACCESS KEY / PASSWORD
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '1rem', width: '100%' }}>
                        Access Network
                    </button>
                    <button
                        type="button"
                        onClick={() => window.location.hash = ''}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', marginTop: '-0.8rem', fontWeight: 600 }}
                    >
                        ← Return to Public View
                    </button>
                </form>
            </motion.div>
            <style>{`
        .login-role-btn {
          flex: 1; padding: 12px; border-radius: 12px; border: none; background: transparent; color: var(--text-muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; transition: all 0.3s;
        }
        .login-role-btn.active { background: var(--surface); color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); border: 1px solid var(--border); }
      `}</style>
        </div>
    );
};

export default Login;
