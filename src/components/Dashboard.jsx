import React, { useState } from 'react';
import { PlusCircle, FileText, ShieldCheck, Hash, Search, FileCheck, Loader2 } from 'lucide-react';
import { useBlockchain } from '../BlockchainContext';

const Dashboard = ({ setActiveTab }) => {
    const { blockchainHashes, blockchainInstitutions, userRole, currentUser, revokeHashOnBlockchain } = useBlockchain();
    const [revokingHashes, setRevokingHashes] = useState({});
    
    // Sort all certs chronologically, then filter by role
    const allCerts = Object.entries(blockchainHashes)
        .map(([hash, data]) => ({ hash, ...data }))
        .sort((a, b) => b.timestamp - a.timestamp);
        
    const certs = userRole === 'admin' 
        ? allCerts 
        : allCerts.filter(c => c.institutionName === currentUser.name);

    const handleRevoke = async (hash) => {
        if (window.confirm('PERMANENT ACTION: Are you absolutely sure you want to flag this document as REVOKED on the blockchain?')) {
            setRevokingHashes(prev => ({ ...prev, [hash]: true }));
            try {
                await revokeHashOnBlockchain(hash);
                alert('Document successfully flagged as revoked.');
            } catch (error) {
                console.error('Error revoking document:', error);
                alert('Failed to revoke document.');
            } finally {
                setRevokingHashes(prev => ({ ...prev, [hash]: false }));
            }
        }
    };

    return (
        <div className="fade-in">
            {Object.values(revokingHashes).some(Boolean) && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Loader2 size={64} className="animate-spin" style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
                    <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Revoking Document</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Broadcasting revocation to the blockchain ledger...</p>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
                        {userRole === 'admin' ? 'Network Snapshot' : `${currentUser.name} Portal`}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {userRole === 'admin' ? 'Real-time verification metrics from the blockchain' : 'Manage your securely anchored digital certificates'}
                    </p>
                </div>
                {(userRole === 'admin' || userRole === 'institution') && (
                    <button className="btn-primary" onClick={() => setActiveTab('generate')}>
                        <PlusCircle size={18} /> Issue New Certificate
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}><FileText size={32} /></div>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Total {userRole === 'admin' ? 'Registered' : 'Issued'}</h3>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>{certs.length}</h1>
                </div>
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <div style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}><ShieldCheck size={32} /></div>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Validation Success</h3>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>100%</h1>
                </div>
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <div style={{ color: '#4ade80', marginBottom: '1.5rem' }}><Hash size={32} /></div>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {userRole === 'admin' ? 'Network Nodes' : 'Wallet Credits'}
                    </h3>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>
                        {userRole === 'admin' ? '12,8PK' : (blockchainInstitutions[currentUser.name]?.credits || 0)}
                    </h1>
                </div>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 800 }}>Recent Ledger Entries</h3>
                    <Search size={18} color="white" style={{ opacity: 0.3 }} />
                </div>
                {certs.length === 0 ? (
                    <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileCheck size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                        <p style={{ fontSize: '1.1rem' }}>The blockchain ledger is currently empty.</p>
                        <p style={{ fontSize: '0.9rem' }}>Issue your first certificate to see activity here.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                                    <th className="th-cell">DOCUMENT HASH</th>
                                    <th className="th-cell">COURSE</th>
                                    {userRole === 'admin' && <th className="th-cell">INSTITUTION</th>}
                                    <th className="th-cell">TRANSACTION HASH</th>
                                    <th className="th-cell">DATE</th>
                                    <th className="th-cell">STATUS</th>
                                    <th className="th-cell">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certs.map(c => (
                                    <tr key={c.txHash} style={{ borderTop: '1px solid var(--border)' }}>
                                        <td className="td-cell" style={{ fontWeight: 700, fontFamily: 'monospace' }}>{c.hash.substring(0, 16)}...</td>
                                        <td className="td-cell">{c.courseName}</td>
                                        {userRole === 'admin' && <td className="td-cell" style={{ color: 'var(--text-muted)' }}>{c.institutionName}</td>}
                                        <td className="td-cell" style={{ fontFamily: 'monospace', color: 'var(--secondary)', fontSize: '0.75rem' }}>
                                            {c.txHash.substring(0, 32)}...
                                        </td>
                                        <td className="td-cell" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {new Date(c.timestamp).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="td-cell">
                                            {c.isRevoked ? (
                                                <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.7rem', fontWeight: 800 }}>REVOKED</span>
                                            ) : (
                                                <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', fontSize: '0.7rem', fontWeight: 800 }}>MINTED</span>
                                            )}
                                        </td>
                                        <td className="td-cell">
                                            {!c.isRevoked && (userRole === 'admin' || currentUser.name === c.institutionName) && (
                                                <button 
                                                    onClick={() => handleRevoke(c.hash)} 
                                                    disabled={revokingHashes[c.hash]}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, cursor: revokingHashes[c.hash] ? 'not-allowed' : 'pointer', opacity: revokingHashes[c.hash] ? 0.7 : 1 }}
                                                >
                                                    {revokingHashes[c.hash] ? (
                                                        <><Loader2 size={12} className="animate-spin" /> Revoking...</>
                                                    ) : (
                                                        'Revoke'
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style>{`
        .th-cell { padding: 1.2rem 2rem; fontSize: 0.7rem; fontWeight: 800; opacity: 0.5; color: var(--text-muted); }
        .td-cell { padding: 1.2rem 2rem; }
      `}</style>
        </div>
    );
};

export default Dashboard;
