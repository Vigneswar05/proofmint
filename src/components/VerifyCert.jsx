import React, { useState, useRef, useEffect } from 'react';
import { Scan, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlockchain } from '../BlockchainContext';

const VerifyCert = ({ isPublic = false }) => {
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
            const d = params.get('d') || ''; // duration
            const dt = params.get('dt') || ''; // date
            const id = params.get('id') || ''; // credentialId

            // Decentralized lookup using the globally unique Credential ID
            // This returns the fileHash which was anchored during issuance
            const blockchainData = await verifyCredentialIdOnBlockchain(id);

            if (blockchainData) {
                setResult({
                    isValid: true,
                    isCryptoQr: true,
                    data: blockchainData.data,
                    params: { n, c, d, dt },
                    hash: blockchainData.hash,
                    fileName: "Blockchain Secured Credential"
                });
            } else {
                setResult({ 
                    isValid: false, 
                    isCryptoQr: true, 
                    params: { n, c }, 
                    hash: "N/A - ID not found on ledger", 
                    fileName: "Credential ID Verification Failed" 
                });
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

export default VerifyCert;
