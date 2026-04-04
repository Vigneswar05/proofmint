import React, { useState, useEffect } from 'react';
import { Layout, Upload, PlusCircle, User, Scan, Loader2 } from 'lucide-react';
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

    if (!isReady) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            <p style={{ fontWeight: 800, letterSpacing: '2px', opacity: 0.5 }}>SYNCHRONIZING NETWORK</p>
        </div>
    );

    if (!currentUser) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <div style={{ flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '900px' }}>
                        <VerifyCert isPublic />
                        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Are you an institution or admin?</p>
                            <button
                                className="glass-card"
                                style={{ marginTop: '1rem', padding: '12px 32px', color: 'white' }}
                                onClick={() => window.location.hash = '#login'}
                            >
                                Secure Login Portal
                            </button>
                        </div>
                    </div>
                </div>
                {currentHash === '#login' && <Login />}
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
        <div style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
            <Navbar />
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
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
        </div>
    );
};

export default App;
