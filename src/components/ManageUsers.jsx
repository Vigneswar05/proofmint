import React, { useState } from 'react';
import { Building, Loader2 } from 'lucide-react';
import { useBlockchain } from '../BlockchainContext';

const ManageUsers = () => {
    const { registerInstitutionOnBlockchain, deleteInstitutionOnBlockchain, addCreditsOnBlockchain, blockchainInstitutions } = useBlockchain();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        await registerInstitutionOnBlockchain(name, password);
        setName('');
        setPassword('');
        setLoading(false);
    };

    const handleDelete = async (instName) => {
        if (window.confirm(`Are you sure you want to completely remove ${instName}?`)) {
            await deleteInstitutionOnBlockchain(instName);
        }
    };

    const handleAddCredit = async (instName) => {
        const input = window.prompt(`Enter amount of prepaid credits to add for ${instName}:\n(e.g., 100 for Rs.1000)`);
        const amount = parseInt(input, 10);
        if (amount && !isNaN(amount)) {
            await addCreditsOnBlockchain(instName, amount);
            alert(`Added ${amount} credits to ${instName}`);
        }
    };

    return (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem' }}>
            <style>{`
                @media (max-width: 900px) { .manage-grid { grid-template-columns: 1fr !important; } }
            `}</style>
            
            <div className="glass-card" style={{ padding: '2.5rem', height: 'fit-content' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '64px', height: '64px', margin: '0 auto 1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building size={32} color="#4ade80" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>On-Chain Registry</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Authorize a new issuing body</p>
                </div>
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>INSTITUTION NAME</label>
                        <input type="text" className="input-field" placeholder="e.g. Stanford University" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>INITIAL PASSWORD</label>
                        <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '1rem', marginTop: '1rem' }} disabled={loading}>
                        {loading ? <><Loader2 className="animate-spin" size={18} /> Mining...</> : 'Deploy Node'}
                    </button>
                </form>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Network Organizations</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                                <th className="th-cell">INSTITUTION</th>
                                <th className="th-cell">WALLET CREDITS</th>
                                <th className="th-cell">STATUS</th>
                                <th className="th-cell">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(blockchainInstitutions).map(([instName, data]) => data.isRegistered && (
                                <tr key={instName} style={{ borderTop: '1px solid var(--border)' }}>
                                    <td className="td-cell" style={{ fontWeight: 700 }}>{instName}</td>
                                    <td className="td-cell" style={{ color: '#f59e0b', fontWeight: 800 }}>{data.credits || 0}</td>
                                    <td className="td-cell">
                                        <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', fontSize: '0.7rem', fontWeight: 800 }}>ACTIVE</span>
                                    </td>
                                    <td className="td-cell" style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleAddCredit(instName)} style={{ padding: '6px 12px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>+ Add Credits</button>
                                        <button onClick={() => handleDelete(instName)} style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
