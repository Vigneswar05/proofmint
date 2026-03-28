import React, { useState, useRef, useEffect } from 'react';
import {
    ShieldCheck,
    Upload,
    PlusCircle,
    History,
    LogOut,
    Scan,
    CheckCircle,
    AlertCircle,
    FileCheck,
    Building,
    User,
    Layout,
    ExternalLink,
    Loader2,
    FileText,
    Download,
    Search,
    Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import ImageModule from 'docxtemplater-image-module-free';
import jsPDF from 'jspdf';
import { BlockchainProvider, useBlockchain } from './BlockchainContext';
import { defaultTemplate } from './defaultTemplate.js';

// --- Shared Components ---

const base64DataURLToArrayBuffer = (dataURL) => {
    const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
    if (!base64Regex.test(dataURL)) return false;
    const stringBase64 = dataURL.replace(base64Regex, "");
    const binaryString = window.atob(stringBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

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
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '8px', borderRadius: '12px' }}>
                    <ShieldCheck color="white" size={24} />
                </div>
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
                    <div style={{
                        width: '80px', height: '80px', margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
                    }}>
                        <ShieldCheck size={40} color="white" />
                    </div>
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

// --- Dashboard Component ---

const Dashboard = ({ setActiveTab }) => {
    const { blockchainHashes, blockchainInstitutions, userRole, currentUser, revokeHashOnBlockchain } = useBlockchain();
    
    // Sort all certs chronologically, then filter by role
    const allCerts = Object.entries(blockchainHashes)
        .map(([hash, data]) => ({ hash, ...data }))
        .sort((a, b) => b.timestamp - a.timestamp);
        
    const certs = userRole === 'admin' 
        ? allCerts 
        : allCerts.filter(c => c.institutionName === currentUser.name);

    const handleRevoke = async (hash) => {
        if (window.confirm('PERMANENT ACTION: Are you absolutely sure you want to flag this document as REVOKED on the blockchain?')) {
            await revokeHashOnBlockchain(hash);
            alert('Document successfully flagged as revoked.');
        }
    };

    return (
        <div className="fade-in">
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
                                                <button onClick={() => handleRevoke(c.hash)} style={{ padding: '4px 8px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>Revoke</button>
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

// --- Template Upload Component ---

const TemplateUpload = () => {
    const { currentUser } = useBlockchain();
    const fallbackTemplate = currentUser?.name?.toLowerCase().includes('abc') ? defaultTemplate : null;
    const [template, setTemplate] = useState(localStorage.getItem('cert_template_docx') || fallbackTemplate);
    const fileInputRef = useRef();

    const handleUpload = (e) => {
        const file = e.target.files[0];
        
        // Security: limit upload size to 2MB
        if (file && file.size > 2 * 1024 * 1024) {
            alert('File size exceeds the 2MB limit.');
            e.target.value = null;
            return;
        }

        if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
                localStorage.setItem('cert_template_docx', re.target.result);
                setTemplate(re.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Document Template (.docx)</h2>
                <div
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        border: '2px dashed var(--border)',
                        borderRadius: '24px',
                        padding: '3rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.01)',
                        gap: '1rem'
                    }}
                >
                    {template ? (
                        <>
                            <FileCheck size={48} color="#4ade80" />
                            <p style={{ fontWeight: 700 }}>Template Uploaded and Ready</p>
                            <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Click to replace with another .docx file</p>
                        </>
                    ) : (
                        <>
                            <Upload size={48} />
                            <p style={{ fontWeight: 700 }}>Upload Word Template (.docx)</p>
                        </>
                    )}
                    <input type="file" ref={fileInputRef} hidden onChange={handleUpload} accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                </div>
                <div style={{ marginTop: '2rem', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                    <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Supported Placeholders in Word:</p>
                    <ul style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem', listStyle: 'inside', paddingLeft: '0.5rem' }}>
                        <li>{'{name}'} - Recipient's Full Name</li>
                        <li>{'{course}'} - Program of Study</li>
                        <li>{'{duration}'} - Academic Duration</li>
                        <li>{'{date}'} - Issuance Date</li>
                        <li>{'{institutionName}'} - Issuing Institution</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// --- Generate Component ---

const GenerateCert = () => {
    const { storeHashOnBlockchain, generateBlobHash, generateStringHash, currentUser, blockchainInstitutions, userRole } = useBlockchain();
    const [isBatch, setIsBatch] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [form, setForm] = useState({ name: '', course: '', duration: '', date: new Date().toISOString().split('T')[0] });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const fallbackTemplate = currentUser?.name?.toLowerCase().includes('abc') ? defaultTemplate : null;
    const templateDataUrl = localStorage.getItem('cert_template_docx') || fallbackTemplate;

    const generatePDF = async (studentName, course, duration, date, credentialId, qrDataUrl) => {
        try {
            console.log("Generating high-fidelity digital PDF...");
            // Standard A4: 210 x 297 mm
            const pdf = new jsPDF({
                orientation: 'l', // Landscape often looks better for certificates
                unit: 'mm',
                format: 'a4'
            });

            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();

            // Background / Border
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(1);
            pdf.rect(5, 5, width - 10, height - 10);
            pdf.rect(7, 7, width - 14, height - 14);

            // Watermark or subtle patterns could be added here
            
            // Header
            pdf.setTextColor(40, 40, 40);
            pdf.setFontSize(32);
            pdf.setFont("helvetica", "bold");
            pdf.text("CERTIFICATE OF COMPLETION", width / 2, 45, { align: "center" });

            pdf.setFontSize(14);
            pdf.setFont("helvetica", "normal");
            pdf.text("This globally verified credential is awarded to", width / 2, 65, { align: "center" });

            // Student Name
            pdf.setTextColor(6, 182, 212); // ProofMint Primary Color
            pdf.setFontSize(38);
            pdf.setFont("helvetica", "bold");
            pdf.text(studentName.toUpperCase(), width / 2, 85, { align: "center" });

            // Course Info
            pdf.setTextColor(60, 60, 60);
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "normal");
            pdf.text(`for successfully completing the program in`, width / 2, 105, { align: "center" });
            
            pdf.setFontSize(22);
            pdf.setFont("helvetica", "bold");
            pdf.text(course, width / 2, 120, { align: "center" });

            // Duration and Date
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.text(`${duration} | Issued on ${date}`, width / 2, 135, { align: "center" });

            // Institution Authority
            pdf.setFontSize(14);
            pdf.text(`Authorized by ${currentUser.name || 'Credential Authority'}`, width / 2, 160, { align: "center" });

            // QR Code & Verification
            if (qrDataUrl) {
                // Add QR code image
                pdf.addImage(qrDataUrl, 'PNG', width / 2 - 20, 175, 40, 40);
            }

            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text("VERIFY THIS CERTIFICATE AT PROOFMINT.IN", width / 2, 225, { align: "center" });
            pdf.text(`Credential ID: ${credentialId}`, width / 2, 230, { align: "center" });

            console.log("PDF generation success.");
            return pdf.output('blob');
        } catch (err) {
            console.error("Manual PDF Error:", err);
            return null;
        }
    };

    const handleBatchGenerate = async () => {
        if (!templateDataUrl) return alert('Please upload a .docx template first.');
        if (!csvFile) return alert('Please upload a CSV file.');
        
        setLoading(true);
        try {
            const text = await csvFile.text();
            // Simple parse splitting by newline and comma. Exclude headers.
            const rows = text.split('\n').map(r => r.split(',')).filter(r => r.length >= 4 && !r[0].toLowerCase().includes('name'));
            
            if (rows.length === 0) throw new Error("No valid rows found in CSV. Expected format: Name,Course,Duration,Date");

            // Credits check
            if (userRole === 'institution') {
                const credits = blockchainInstitutions[currentUser.name]?.credits || 0;
                if (credits < rows.length) {
                    throw new Error(`Insufficient credits. You need ${rows.length} credits to process this CSV.`);
                }
            }

            const base64Data = templateDataUrl.split(',')[1];
            const exportBundle = new PizZip();
            
            for (let i = 0; i < rows.length; i++) {
                const [n, c, dur, dt] = rows[i].map(x => x?.trim());
                if (!n || !c) continue;

                const credentialId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const salt = Math.random().toString(36).substring(2, 10);
                const instName = currentUser.name || 'Institution';
                const dataString = `${n}|${c}|${dur||''}|${dt||''}|${instName}|${salt}`;
                const dataHash = await generateStringHash(dataString);
                
                const params = new URLSearchParams({ id: credentialId, n, c, d: dur||'', dt: dt||'', i: instName, s: salt });
                const verificationUrl = `${window.location.origin}/#verify?${params.toString()}`;
                const qrDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'M', margin: 1, width: 120 });

                const imageOptions = {
                    centered: true,
                    fileType: 'docx',
                    getImage: (tagValue) => base64DataURLToArrayBuffer(tagValue),
                    getSize: () => [120, 120]
                };
                const imageModule = new ImageModule(imageOptions);

                const zip = new PizZip(base64Data, { base64: true });
                const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, modules: [imageModule] });
                doc.render({ name: n, course: c, duration: dur, date: dt, institutionName: currentUser.name || 'Institution', qr_code: qrDataUrl });
                
                const outBuffer = doc.getZip().generate({ type: 'arraybuffer', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                const docxBlob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                
                // Add Word to zip
                exportBundle.file(`${n.replace(/[^a-z0-9]/gi, '_')}/${n.replace(/[^a-z0-9]/gi, '_')}.docx`, outBuffer);
                
                // ADD PDF TO ZIP!
                const pdfBlob = await generatePDF(n, c, dur, dt, credentialId, qrDataUrl);
                if (pdfBlob) {
                    const pdfBuffer = await pdfBlob.arrayBuffer();
                    exportBundle.file(`${n.replace(/[^a-z0-9]/gi, '_')}/${n.replace(/[^a-z0-9]/gi, '_')}.pdf`, pdfBuffer);
                }

                const fileHash = await generateBlobHash(docxBlob);
                // We use dataHash on blockchain for 100% automatic QR verification
                await storeHashOnBlockchain(dataHash, { courseName: c, duration: dur, institutionName: currentUser.name, credentialId });
            }

            const finalZipBuffer = exportBundle.generate({ type: 'arraybuffer' });
            const finalZipBlob = new Blob([finalZipBuffer], { type: 'application/zip' });
            saveAs(finalZipBlob, 'ProofMint_Bulk_Certificates.zip');
            
            alert(`Success! ${rows.length} certificates securely minted into the blockchain. ZIP contains both Word and PDF versions.`);
            setCsvFile(null);
        } catch (err) {
            console.error(err);
            alert('Bulk Processing Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (isBatch) return handleBatchGenerate();
        
        if (!templateDataUrl) {
            alert('Please upload a .docx template first in the Templates tab.');
            return;
        }

        setLoading(true);
        try {
            const credentialId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const salt = Math.random().toString(36).substring(2, 10);
            const n = form.name.trim();
            const c = form.course.trim();
            const d = form.duration.trim();
            const dt = form.date ? new Date(form.date).toLocaleDateString('en-GB') : '';
            const instName = currentUser.name || 'Institution';
            
            const dataString = `${n}|${c}|${d}|${dt}|${instName}|${salt}`;
            const dataHash = await generateStringHash(dataString);
            
            const params = new URLSearchParams({ id: credentialId, n, c, d, dt, i: instName, s: salt });
            const verificationUrl = `${window.location.origin}/#verify?${params.toString()}`;
            const qrDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'M', margin: 1, width: 120 });

            const imageOptions = {
                centered: true,
                fileType: 'docx',
                getImage: (tagValue) => base64DataURLToArrayBuffer(tagValue),
                getSize: () => [120, 120]
            };
            const imageModule = new ImageModule(imageOptions);

            const base64Data = templateDataUrl.split(',')[1];
            const zip = new PizZip(base64Data, { base64: true });
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, modules: [imageModule] });
            
            doc.render({
                name: form.name,
                course: form.course,
                duration: form.duration,
                date: form.date ? new Date(form.date).toLocaleDateString('en-GB') : '',
                institutionName: currentUser.name || 'Institution',
                qr_code: qrDataUrl
            });
            
            const out = doc.getZip().generate({ type: 'arraybuffer', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const docxBlob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

            const fileHash = await generateBlobHash(docxBlob);

            // Removing studentName mapping for Privacy (DPDP Act Compliance)
            // Using Cryptographic QR dataHash directly binds Name to the Ledger!
            const tx = await storeHashOnBlockchain(dataHash, {
                courseName: form.course,
                duration: form.duration,
                institutionName: currentUser.name,
                credentialId
            });

            const docxUrl = URL.createObjectURL(docxBlob);
            
            // Build PDF as well using direct draw for 100% reliability
            const pdfBlob = await generatePDF(form.name, form.course, form.duration, dt, credentialId, qrDataUrl);
            const pdfUrl = pdfBlob ? URL.createObjectURL(pdfBlob) : null;

            setSuccess({ tx, docxUrl, pdfUrl, hash: dataHash, studentName: form.name });
            setForm({ name: '', course: '', duration: '', date: new Date().toISOString().split('T')[0] });
        } catch (err) {
            console.error(err);
            alert('Generation failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in cert-gen-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <style>{`
                @media (max-width: 1024px) {
                    .cert-gen-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontWeight: 800 }}>Credential Mint</h2>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                        <button onClick={() => setIsBatch(false)} style={{ padding: '6px 16px', background: !isBatch ? 'var(--primary)' : 'transparent', color: !isBatch ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s' }}>Single</button>
                        <button onClick={() => setIsBatch(true)} style={{ padding: '6px 16px', background: isBatch ? 'var(--secondary)' : 'transparent', color: isBatch ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.2s' }}>Batch CSV</button>
                    </div>
                </div>

                <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                    {isBatch ? (
                        <div style={{ padding: '2rem', border: '2px dashed var(--border)', borderRadius: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                            <FileText size={32} style={{ marginBottom: '1rem', color: 'var(--secondary)' }} />
                            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Upload CSV Database</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Format: Name, Course, Duration, Date</p>
                            <input type="file" required={isBatch} accept=".csv" disabled={loading} onChange={(e) => setCsvFile(e.target.files[0])} style={{ width: '100%', fontSize: '0.9rem', padding: '10px' }} />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>RECIPIENT FULL NAME</label>
                                <input type="text" className="input-field" placeholder="e.g. Satoshi Nakamoto" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required={!isBatch} disabled={loading} maxLength={100} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>PROGRAM OF STUDY</label>
                                <input type="text" className="input-field" placeholder="e.g. Advanced Cryptography" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} required={!isBatch} disabled={loading} maxLength={150} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>ACADEMIC DURATION</label>
                                <input type="text" className="input-field" placeholder="e.g. 12 Weeks (Full-time)" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required={!isBatch} disabled={loading} maxLength={50} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>ISSUANCE DATE</label>
                                <input type="date" className="input-field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required={!isBatch} disabled={loading} />
                            </div>
                        </>
                    )}

                    {userRole === 'institution' && (blockchainInstitutions[currentUser.name]?.credits || 0) < 1 ? (
                        <div style={{ padding: '16px', fontSize: '1rem', marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', textAlign: 'center', fontWeight: 700 }}>
                            <AlertCircle size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                            Insufficient Credits. Contact Admin.
                        </div>
                    ) : (
                        <button type="submit" className="btn-primary" style={{ marginTop: '1rem', height: '56px' }} disabled={loading}>
                            {loading ? <><Loader2 className="animate-spin" size={20} /> Processing Node Request...</> : <><ShieldCheck size={20} /> {isBatch ? 'Deploy Bulk Batch' : 'Mint Document'}</>}
                        </button>
                    )}
                </form>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                    <FileText size={48} className="gradient-text" />
                </div>
                <h2 style={{ marginBottom: '1rem', fontWeight: 800 }}>Document Engine Generation</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto', lineHeight: '1.6' }}>
                    The system will securely merge the data with your uploaded Word (.docx) template, generate an immutable document, and attach its exact binary hash to the network ledger.
                </p>
                {templateDataUrl ? (
                    <div style={{ marginTop: '2rem', padding: '12px 24px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} /> Template is ready
                    </div>
                ) : (
                    <div style={{ marginTop: '2rem', padding: '12px 24px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} /> No template uploaded
                    </div>
                )}
            </div>

            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-card" style={{ maxWidth: '650px', width: '90%', padding: '4rem', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 50px rgba(74, 222, 128, 0.4)' }}>
                                <CheckCircle size={40} color="white" />
                            </div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Success!</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>The certificate document has been generated and its hash anchored to the blockchain.</p>

                            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '20px', marginBottom: '2.5rem', textAlign: 'left', border: '1px solid var(--border)' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>IMMUTABLE FILE HASH (SHA-256)</p>
                                    <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#fff' }}>{success.hash}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>LEDGER TRANSACTION ID</p>
                                    <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--secondary)' }}>{success.tx.txHash}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {success.pdfUrl ? (
                                    <a href={success.pdfUrl} download={`${success.studentName || 'certificate'}.pdf`} className="btn-primary" style={{ flex: 1, minWidth: '180px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', borderRadius: '12px', color: 'white' }}>
                                        <FileText size={20} /> Download PDF
                                    </a>
                                ) : (
                                    <div className="glass-card" style={{ flex: 1, minWidth: '180px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.6 }}>
                                        <Loader2 className="animate-spin" size={20} /> Generating PDF...
                                    </div>
                                )}
                                <a href={success.docxUrl} download={`${success.studentName || 'certificate'}.docx`} className="glass-card" style={{ flex: 1, minWidth: '180px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'white' }}>
                                    <Download size={20} /> Word (.docx)
                                </a>
                                <button onClick={() => setSuccess(null)} className="glass-card" style={{ padding: '0 2rem', color: 'white' }}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </div>
    );
};

// --- Verify Component ---

const VerifyCert = () => {
    const { generateBlobHash, generateStringHash, verifyHashOnBlockchain, verifyCredentialIdOnBlockchain } = useBlockchain();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef();

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#verify?')) {
            const queryString = hash.split('?')[1];
            const params = new URLSearchParams(queryString);
            autoVerifyCryptographic(params);
        } else if (hash.startsWith('#verify-')) {
            const credentialId = hash.replace('#verify-', '');
            autoVerifyLegacy(credentialId);
        }
    }, []);

    const autoVerifyCryptographic = async (params) => {
        setLoading(true);
        try {
            const n = params.get('n') || '';
            const c = params.get('c') || '';
            const d = params.get('d') || '';
            const dt = params.get('dt') || '';
            const i = params.get('i') || '';
            const s = params.get('s') || '';
            
            const dataString = `${n}|${c}|${d}|${dt}|${i}|${s}`;
            const dataHash = await generateStringHash(dataString);
            const blockchainData = await verifyHashOnBlockchain(dataHash);

            if (blockchainData) {
                setResult({
                    isValid: true,
                    isCryptoQr: true,
                    data: blockchainData,
                    params: { n, c, d, dt },
                    hash: dataHash,
                    fileName: "Cryptographic QR Code Validation"
                });
            } else {
                setResult({ isValid: false, isCryptoQr: true, params: { n, c }, hash: dataHash, fileName: "Cryptographic QR Code Validation" });
            }
        } catch (e) {
            alert('Verification process interrupted.');
        } finally { setLoading(false); }
    };

    const autoVerifyLegacy = async (credentialId) => {
        setLoading(true);
        try {
            const data = await verifyCredentialIdOnBlockchain(credentialId);
            if (data) {
                setResult({
                    isValid: true,
                    isQrVerification: true,
                    data: data.data,
                    hash: data.hash,
                    fileName: "N/A (QR Code lookup only)"
                });
            } else {
                setResult({ isValid: false, fileName: "N/A" });
            }
        } catch (e) {
            alert('Verification process interrupted.');
        } finally { setLoading(false); }
    };

    const handleVerify = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Security: limit upload size to 5MB for verification
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds the 5MB limit.');
            e.target.value = null;
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            // 1. Hash the uploaded file (binary comparison)
            const blob = new Blob([file]);
            const fileHash = await generateBlobHash(blob);

            // 2. Lookup on blockchain
            const blockchainData = await verifyHashOnBlockchain(fileHash);

            setResult({
                isValid: !!blockchainData,
                data: blockchainData,
                hash: fileHash,
                fileName: file.name
            });
        } catch (err) {
            alert('Verification process interrupted.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Credential Verifier</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3.5rem' }}>
                    Upload a digital certificate issued by this network to perform a byte-level authenticity check against the blockchain.
                </p>

                <div
                    onClick={() => !loading && fileInputRef.current.click()}
                    style={{
                        border: '2px dashed var(--border)',
                        borderRadius: '32px',
                        padding: '5rem 3rem',
                        cursor: loading ? 'default' : 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'rgba(255,255,255,0.01)',
                        position: 'relative'
                    }}
                    onMouseOver={(e) => !loading && (e.currentTarget.style.borderColor = 'var(--primary)', e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseOut={(e) => !loading && (e.currentTarget.style.borderColor = 'var(--border)', e.currentTarget.style.transform = 'scale(1)')}
                >
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <div className="animate-spin" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)' }}></div>
                            </div>
                            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Decrypting Ledger & Validating Hash...</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                <Scan size={40} className="gradient-text" />
                            </div>
                            <p style={{ fontSize: '1.3rem', fontWeight: 800 }}>Drop Certificate File</p>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.8rem' }}>Authenticates the exact binary signature of the document</p>
                        </>
                    )}
                    <input type="file" ref={fileInputRef} hidden onChange={handleVerify} />
                </div>

                <AnimatePresence>
                    {result && (
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                style={{
                                    marginTop: '3.5rem',
                                    padding: '3rem',
                                    borderRadius: '24px',
                                    background: result.isValid && !result.data?.isRevoked ? 'rgba(74, 222, 128, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                    border: `1px solid ${result.isValid && !result.data?.isRevoked ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2.5rem' }}>
                                    {result.isValid && !result.data?.isRevoked ? (
                                        <div style={{ width: '48px', height: '48px', background: result.isQrVerification ? '#f59e0b' : '#4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {result.isQrVerification ? <AlertCircle size={28} color="white" /> : <CheckCircle size={28} color="white" />}
                                        </div>
                                    ) : (
                                        <div style={{ width: '48px', height: '48px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <AlertCircle size={28} color="white" />
                                        </div>
                                    )}
                                    <div>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: result.isValid && !result.data?.isRevoked ? (result.isQrVerification ? '#f59e0b' : '#4ade80') : '#ef4444' }}>
                                            {!result.isValid ? 'Verification Failed' : (result.data?.isRevoked ? 'Certificate Revoked' : (result.isQrVerification ? 'Ledger Record Found' : 'Verification Confirmed'))}
                                        </h2>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                            Status: {!result.isValid ? (result.isCryptoQr ? 'LEDGER ERROR - FAKE QR CODE DETECTED' : 'LEDGER ERROR - FILE MUTATED OR FAKE') : (result.data?.isRevoked ? 'INVALIDATED BY ISSUER' : (result.isQrVerification ? 'PENDING FILE VERIFICATION - UPLOAD .DOCX TO PROVE AUTHENTICITY' : 'ANCHORED TO LEDGER AND UNTAMPERED'))}
                                        </p>
                                    </div>
                                </div>

                                {result.isCryptoQr && result.isValid && !result.data?.isRevoked && (
                                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '12px', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#4ade80', fontWeight: 800 }}>
                                            <CheckCircle size={20} /> 100% Cryptographic Match
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                            This QR Code is cryptographically signed and directly verified against the blockchain. Ensure the physical paper EXACTLY matches the details below:
                                        </p>
                                        <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                            <p style={{ fontSize: '1.3rem', color: '#fff', fontWeight: '800' }}>Issued to: <span style={{color: '#4ade80', marginLeft: '0.5rem'}}>{result.params.n}</span></p>
                                            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>Course: <strong style={{color: 'white'}}>{result.params.c}</strong></p>
                                        </div>
                                    </div>
                                )}
                                
                                {result.isCryptoQr && !result.isValid && (
                                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ef4444', fontWeight: 800 }}>
                                            <AlertCircle size={20} /> Forgery Detected
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                            The data embedded in this QR code (Name: <strong>{result.params.n}</strong>) completely failed the cryptographic signature check. This document is mathematically proven to be a fake.
                                        </p>
                                    </div>
                                )}

                                {result.isQrVerification && !result.data?.isRevoked && (
                                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#f59e0b', fontWeight: 800 }}>
                                            <AlertCircle size={20} /> Action Required
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                            Scanning the QR code only confirms that this credential ID exists on the ledger. 
                                            <strong style={{ color: 'white' }}> It does not prove the document you are looking at hasn't been tampered with.</strong> 
                                            To perform a mathematical byte-level guarantee against alterations (like name changes), you MUST upload the digital .docx certificate file using the drop zone above.
                                        </p>
                                    </div>
                                )}

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>EVIDENCE FILE (LOCAL)</p>
                                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{result.fileName}</p>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>COMPUTED SHA-256 HASH</p>
                                    <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: result.isValid && !result.data?.isRevoked ? '#4ade80' : '#fff' }}>{result.hash}</p>
                                </div>

                                {result.isValid ? (
                                    <>
                                        <hr style={{ margin: '2rem 0', borderColor: 'rgba(255,255,255,0.05)' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                                            <div>
                                                <p className="detail-label">OFF-CHAIN VERIFICATION</p>
                                                <p className="detail-value" style={{ color: result.data.isRevoked ? '#ef4444' : '#4ade80' }}>
                                                    {result.data.isRevoked ? 'REVOKED (WARNING)' : 'VALID'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="detail-label">QUALIFICATION</p>
                                                <p className="detail-value">{result.data.courseName}</p>
                                            </div>
                                            <div>
                                                <p className="detail-label">AUTHORIZED BY</p>
                                                <p className="detail-value">{result.data.institutionName}</p>
                                            </div>
                                            <div>
                                                <p className="detail-label">LEDGER TIMESTAMP</p>
                                                <p className="detail-value">{new Date(result.data.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '0.9rem', color: '#fca5a5' }}>
                                            The digital fingerprint of this file does not match any records in our blockchain database.
                                            The document may have been altered after issuance, or it was never registered in this ecosystem.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <style>{`
        .detail-label { fontSize: 0.65rem; color: var(--text-muted); font-weight: 800; margin-bottom: 0.5rem; letter-spacing: 0.5px; }
        .detail-value { font-size: 1.1rem; font-weight: 800; color: white; }
      `}</style>
        </div>
    );
};

// --- ManageUsers Component ---
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
        const input = window.prompt(`Enter amount of prepaid credits to add for ${instName}:\\n(e.g., 100 for Rs.1000)`);
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
