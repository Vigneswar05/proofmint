import React, { useState, useRef } from 'react';
import { FileCheck, Upload } from 'lucide-react';
import { useBlockchain } from '../BlockchainContext';
import { defaultTemplate } from '../defaultTemplate.js';

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

export default TemplateUpload;
