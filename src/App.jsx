import React, { useState, useEffect } from 'react';
import { Layout, Upload, PlusCircle, User, Scan, Loader2, ShieldCheck, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockchainProvider, useBlockchain } from './BlockchainContext';

import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TemplateUpload from './components/TemplateUpload';
import GenerateCert from './components/GenerateCert';
import VerifyCert from './components/VerifyCert';
import ManageUsers from './components/ManageUsers';

function App() {
    return (
        <BlockchainProvider>
            <AppContent />
        </BlockchainProvider>
    );
}

const AppContent = () => {
    const { isReady, userRole, currentUser } = useBlockchain();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [currentHash, setCurrentHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => setCurrentHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Force redirect to Dashboard (Home Page) immediately when a user logs in
    useEffect(() => {
        if (currentUser) {
            setActiveTab('dashboard');
        }
    }, [currentUser?.id]);


    if (!isReady) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            <p style={{ fontWeight: 800, letterSpacing: '2px', opacity: 0.5 }}>SYNCHRONIZING NETWORK</p>
        </div>
    );

    if (!currentUser) {
        // Render standalone login page
        if (currentHash === '#login') {
            return (
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <Navbar />
                    <Login />
                    <Footer />
                </div>
            );
        }

        // Render main landing page
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                
                {/* Hero Section */}
                <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at 50% -20%, rgba(139, 92, 246, 0.15), transparent 60%)' }}>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                        style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}
                    >
                        Secure, Immutable <span className="gradient-text">Verifications.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem' }}
                    >
                        Validoc leverages blockchain technology to issue and verify digital certificates instantly, transparently, and securely. No more fraud. No more lost papers.
                    </motion.p>
                </div>

                <div style={{ padding: '0 2rem 4rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '900px' }}>
                        <VerifyCert isPublic />
                    </div>
                </div>

                {/* Why Validoc? Section */}
                <div style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '3rem' }}>Why Choose Validoc?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <ShieldCheck size={28} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Tamper-Proof Security</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Every document is cryptographically hashed and anchored to a smart contract, making it mathematically impossible to forge or manipulate.</p>
                            </div>
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <Scan size={28} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Instant Verification</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Employers and universities can verify documents in seconds by uploading the file or scanning a QR code. Zero bureaucracy, zero delays.</p>
                            </div>
                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <Building size={28} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>SaaS for Institutions</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Universities get a complete portal to manage credits, upload custom MS Word templates, and issue certificates in bulk.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How it Works Section */}
                <div style={{ padding: '4rem 2rem' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '3rem' }}>How Validoc Works</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', position: 'relative' }}>
                             <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--border)', marginBottom: '1rem', lineHeight: '1' }}>1</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Institution Uploads</h3>
                                <p style={{ color: 'var(--text-muted)' }}>An authorized entity logs into the portal, uploads their official custom .docx template and the student data.</p>
                             </div>
                             <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--border)', marginBottom: '1rem', lineHeight: '1' }}>2</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Smart Contract Minting</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Validoc fuses the data onto the MS Word document, generates an unbreakable SHA-256 binary hash, and records it on the blockchain.</p>
                             </div>
                             <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--border)', marginBottom: '1rem', lineHeight: '1' }}>3</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Global Verification</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Anyone presented with the certificate can upload it here directly or scan its QR code to guarantee its authenticity against the ledger.</p>
                             </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Are you an institution or admin?</p>
                    <button
                        className="glass-card"
                        style={{ marginTop: '1rem', padding: '12px 32px', color: 'white' }}
                        onClick={() => window.location.hash = '#login'}
                    >
                        Secure Login Portal
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
            case 'generate': return <GenerateCert />;
            case 'verify': return <VerifyCert />;
            case 'template': return <TemplateUpload />;
            case 'register': return <ManageUsers />;
            default: return <Dashboard setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '0 1rem', paddingBottom: '5rem' }}>
                <div className="glass-card" style={{
                    marginBottom: '2rem',
                    borderRadius: '16px',
                    display: 'flex',
                    padding: '0.4rem',
                    background: 'rgba(255,255,255,0.02)',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    scrollbarWidth: 'none'
                }}>
                    <button onClick={() => setActiveTab('dashboard')} className={`tab-btn ${activeTab === 'dashboard' && 'active'}`}><Layout size={18} /> Overview</button>

                    {(userRole === 'admin' || userRole === 'institution') && (
                        <>
                            <button onClick={() => setActiveTab('template')} className={`tab-btn ${activeTab === 'template' && 'active'}`}><Upload size={18} /> Templates</button>
                            <button onClick={() => setActiveTab('generate')} className={`tab-btn ${activeTab === 'generate' && 'active'}`}><PlusCircle size={18} /> Generate</button>
                        </>
                    )}

                    {userRole === 'admin' && (
                        <button onClick={() => setActiveTab('register')} className={`tab-btn ${activeTab === 'register' && 'active'}`}><User size={18} /> Manage Users</button>
                    )}

                    <button onClick={() => setActiveTab('verify')} className={`tab-btn ${activeTab === 'verify' && 'active'}`}><Scan size={18} /> Verification</button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
            <style>{`
        .tab-btn {
          flex: 1; padding: 14px; border-radius: 14px; border: none; background: transparent; color: var(--text-muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; transition: all 0.3s;
        }
        .tab-btn:hover { color: var(--text); background: rgba(255,255,255,0.03); }
        .tab-btn.active { 
            background: linear-gradient(135deg, var(--primary), var(--secondary)); 
            color: white; 
            box-shadow: 0 10px 20px rgba(139, 92, 246, 0.2);
        }
      `}</style>
            <Footer />
        </div>
    );
};

const Footer = () => (
    <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border)', marginTop: 'auto', background: 'rgba(0,0,0,0.2)', width: '100%' }}>
         <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} Ilanix Technologies. All rights reserved.</p>
         <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem', color: 'var(--text-muted)' }}>An MSME Registered Enterprise</p>
    </footer>
);

export default App;
