import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useBlockchain } from '../BlockchainContext';

const Navbar = () => {
    const { currentUser, logout, userRole, blockchainInstitutions } = useBlockchain();
    return (
        <nav className="glass-card" style={{
            margin: '1rem',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100,
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <img src="/logo.png" alt="ProofMint Logo" style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                <h2 className="gradient-text" style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>ProofMint</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'none', md: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(74, 222, 128, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' }} className="ssl-badge">
                    <ShieldCheck size={14} color="#4ade80" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#4ade80', letterSpacing: '0.5px' }}>SSL SECURE (HTTPS)</span>
                </div>
                {currentUser ? (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentUser.name}</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{
                                    color: 'var(--secondary)',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    background: 'rgba(6, 182, 212, 0.1)',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    marginTop: '2px'
                                }}>{userRole}</span>
                                {userRole === 'institution' && (
                                    <span style={{
                                        color: '#f59e0b', fontSize: '0.65rem', fontWeight: 800,
                                        letterSpacing: '0.5px', textTransform: 'uppercase', background: 'rgba(245, 158, 11, 0.1)',
                                        padding: '2px 8px', borderRadius: '4px', marginTop: '2px'
                                    }}>{blockchainInstitutions[currentUser.name]?.credits || 0} CREDITS</span>
                                )}
                            </div>
                        </div>
                        <button className="glass-card" onClick={logout} style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'white', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <LogOut size={16} /> Sign Out
                        </button>
                    </>
                ) : (
                    <button className="btn-primary" onClick={() => window.location.hash = '#login'}>
                        Portal Login
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
