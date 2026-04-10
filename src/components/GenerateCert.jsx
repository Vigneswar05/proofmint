import React, { useState } from 'react';
import { FileText, ShieldCheck, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import ImageModule from 'docxtemplater-image-module-free';
import { useBlockchain } from '../BlockchainContext';
import { defaultTemplate } from '../defaultTemplate.js';

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

const GenerateCert = () => {
    const { storeHashOnBlockchain, generateBlobHash, generateStringHash, currentUser, blockchainInstitutions, userRole } = useBlockchain();
    const [isBatch, setIsBatch] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [form, setForm] = useState({ name: '', course: '', duration: '', date: new Date().toISOString().split('T')[0] });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const fallbackTemplate = currentUser?.name?.toLowerCase().includes('abc') ? defaultTemplate : null;
    const templateDataUrl = localStorage.getItem('cert_template_docx') || fallbackTemplate;

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
                
                const fileHash = await generateBlobHash(docxBlob);
                // Binary file hash is now the primary on-chain anchor for 100% verification success on upload
                await storeHashOnBlockchain(fileHash, { courseName: c, duration: dur, institutionName: currentUser.name, credentialId });
            }

            const finalZipBuffer = exportBundle.generate({ type: 'arraybuffer' });
            const finalZipBlob = new Blob([finalZipBuffer], { type: 'application/zip' });
            saveAs(finalZipBlob, 'Validoc_Bulk_Certificates.zip');
            
            alert(`Success! ${rows.length} certificates securely minted into the blockchain.`);
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

            // Anchoring the FILE HASH (binary document hash) to the blockchain!
            // This ensures when a user uploads the .docx file to skip traditional verification,
            // the hashes match 100% and it validates on the ledger.
            const tx = await storeHashOnBlockchain(fileHash, {
                courseName: form.course,
                duration: form.duration,
                institutionName: currentUser.name,
                credentialId
            });

            const docxUrl = URL.createObjectURL(docxBlob);
            setSuccess({ tx, docxUrl, hash: fileHash, studentName: form.name });
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
                                <input type="text" className="input-field" placeholder="e.g. 15 March,2026 To 15 April,2026" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required={!isBatch} disabled={loading} maxLength={50} />
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
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}
                    >
                        <motion.div
                            animate={{ 
                                scale: [1, 1.15, 1],
                            }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            style={{ marginBottom: '3rem', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                style={{ position: 'absolute', width: '140px', height: '140px', border: '2px dashed var(--primary)', borderRadius: '50%', opacity: 0.5 }}
                            />
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                style={{ position: 'absolute', width: '170px', height: '170px', border: '1px solid var(--secondary)', borderRadius: '50%', opacity: 0.3 }}
                            />
                            <div style={{ position: 'absolute', width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(30px)', opacity: 0.6 }}></div>
                            <ShieldCheck size={64} className="gradient-text" style={{ zIndex: 1 }} />
                        </motion.div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: 'white', textAlign: 'center' }}>
                            {isBatch ? 'Deploying Batch to Blockchain...' : 'Minting Document to Ledger...'}
                        </h2>
                        <motion.p 
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            style={{ color: 'var(--secondary)', fontSize: '1rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}
                        >
                            <Loader2 className="animate-spin" size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '10px', marginBottom: '2px' }} />
                            Awaiting Network Consensus
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                    <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#fff', wordBreak: 'break-all' }}>{success.hash}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>LEDGER TRANSACTION ID</p>
                                    <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--secondary)', wordBreak: 'break-all' }}>{success.tx.txHash}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <a href={success.docxUrl} download={`${success.studentName || 'certificate'}.docx`} className="btn-primary" style={{ flex: 1, minWidth: '180px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, textDecoration: 'none' }}>
                                    <Download size={20} /> Download Word (.docx)
                                </a>
                                <button onClick={() => setSuccess(null)} className="glass-card" style={{ padding: '0 2rem', height: '56px', color: 'white', border: '1px solid var(--border)', borderRadius: '12px' }}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </div>
    );
};

export default GenerateCert;
