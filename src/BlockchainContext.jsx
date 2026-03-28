import React, { createContext, useContext, useState, useEffect } from 'react';
import sha256 from 'sha256';

const BlockchainContext = createContext();

export const useBlockchain = () => useContext(BlockchainContext);

export const BlockchainProvider = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [blockchainInstitutions, setBlockchainInstitutions] = useState(() => {
        const saved = localStorage.getItem('blockchain_institutions');
        return saved ? JSON.parse(saved) : {
            'ABC Institute': { passwordHash: sha256('123456'), credits: 10, isRegistered: true }
        };
    });

    useEffect(() => {
        const savedUser = localStorage.getItem('cert_user');
        if (savedUser) {
            const u = JSON.parse(savedUser);
            setCurrentUser(u);
            setUserRole(u.role);
        }
        setIsReady(true);
    }, []);

    const login = (role, name, password) => {
        if (role === 'institution') {
            const hashedPassword = password ? sha256(password) : '';
            const isLocalFallback = (name === 'ABC Institute' && password === '123456');
            const isOnChain = blockchainInstitutions[name] && blockchainInstitutions[name].passwordHash === hashedPassword;
            
            if (!isLocalFallback && !isOnChain) {
                alert('Invalid institution credentials on the blockchain.');
                return null;
            }
        } else if (role === 'admin') {
            if (name !== 'Admin@123' || password !== '1234') {
                alert('Invalid administrator credentials.');
                return null;
            }
        } else {
            alert('Unknown role.');
            return null;
        }

        const user = { role, name, id: Math.random().toString(36).substr(2, 9) };
        localStorage.setItem('cert_user', JSON.stringify(user));
        setCurrentUser(user);
        setUserRole(role);
        window.location.hash = '';
        return user;
    };

    const logout = () => {
        localStorage.removeItem('cert_user');
        setCurrentUser(null);
        setUserRole(null);
    };

    const registerInstitutionOnBlockchain = async (name, password) => {
        if (!name || !password) return null;
        
        // Simulate blockchain transaction delay
        await new Promise(r => setTimeout(r, 2000));
        
        const newInst = { 
            ...blockchainInstitutions, 
            [name]: {
                passwordHash: sha256(password),
                txHash: '0x' + sha256(name + Date.now()).substring(0, 64),
                timestamp: Date.now(),
                credits: 0,
                isRegistered: true
            }
        };
        
        setBlockchainInstitutions(newInst);
        localStorage.setItem('blockchain_institutions', JSON.stringify(newInst));
        return newInst[name];
    };

    const deleteInstitutionOnBlockchain = async (name) => {
        await new Promise(r => setTimeout(r, 1000));
        const newInsts = { ...blockchainInstitutions };
        delete newInsts[name]; // Remove from ledger mock
        setBlockchainInstitutions(newInsts);
        localStorage.setItem('blockchain_institutions', JSON.stringify(newInsts));
        return true;
    };

    const addCreditsOnBlockchain = async (name, amount) => {
        await new Promise(r => setTimeout(r, 1000));
        const inst = blockchainInstitutions[name];
        if (!inst) return false;

        const newInsts = {
            ...blockchainInstitutions,
            [name]: { ...inst, credits: (inst.credits || 0) + amount }
        };
        setBlockchainInstitutions(newInsts);
        localStorage.setItem('blockchain_institutions', JSON.stringify(newInsts));
        return true;
    };

    const [blockchainHashes, setBlockchainHashes] = useState(() => {
        const saved = localStorage.getItem('blockchain_hashes');
        return saved ? JSON.parse(saved) : {};
    });

    const storeHashOnBlockchain = async (hash, metadata) => {
        if (metadata.institutionName) {
            const inst = blockchainInstitutions[metadata.institutionName];
            if (!inst || (inst.credits || 0) < 1) {
                throw new Error("Insufficient credits. Please recharge your account.");
            }
            // Deduct 1 credit for processing
            const updatedInsts = {
                ...blockchainInstitutions,
                [metadata.institutionName]: { ...inst, credits: inst.credits - 1 }
            };
            setBlockchainInstitutions(updatedInsts);
            localStorage.setItem('blockchain_institutions', JSON.stringify(updatedInsts));
        }

        await new Promise(r => setTimeout(r, 1500));

        // PRIVACY ENFORCEMENT: Never store PII (Personally Identifiable Information like studentName) on public ledger
        const publicLedgerData = {
            courseName: metadata.courseName,
            institutionName: metadata.institutionName,
            credentialId: metadata.credentialId,
            timestamp: Date.now(),
            txHash: '0x' + sha256(hash + Date.now()).substring(0, 64),
            isRevoked: false
        };

        const newHashes = {
            ...blockchainHashes,
            [hash]: publicLedgerData
        };

        setBlockchainHashes(newHashes);
        localStorage.setItem('blockchain_hashes', JSON.stringify(newHashes));
        return publicLedgerData;
    };

    const revokeHashOnBlockchain = async (hash) => {
        await new Promise(r => setTimeout(r, 1000));
        if (blockchainHashes[hash]) {
            const newHashes = {
                ...blockchainHashes,
                [hash]: { ...blockchainHashes[hash], isRevoked: true }
            };
            setBlockchainHashes(newHashes);
            localStorage.setItem('blockchain_hashes', JSON.stringify(newHashes));
            return true;
        }
        return false;
    };

    const verifyHashOnBlockchain = async (hash) => {
        await new Promise(r => setTimeout(r, 1000));
        return blockchainHashes[hash] || null;
    };

    const verifyCredentialIdOnBlockchain = async (credentialId) => {
        await new Promise(r => setTimeout(r, 1000));
        for (const [hash, data] of Object.entries(blockchainHashes)) {
            if (data.credentialId === credentialId) {
                return { hash, data };
            }
        }
        return null;
    };

    const generateBlobHash = async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const generateFileHash = generateBlobHash;


    return (
        <BlockchainContext.Provider value={{
            isReady,
            userRole,
            currentUser,
            login,
            logout,
            registerInstitutionOnBlockchain,
            deleteInstitutionOnBlockchain,
            addCreditsOnBlockchain,
            blockchainInstitutions,
            storeHashOnBlockchain,
            revokeHashOnBlockchain,
            verifyHashOnBlockchain,
            verifyCredentialIdOnBlockchain,
            generateFileHash,
            generateBlobHash,
            blockchainHashes
        }}>
            {children}
        </BlockchainContext.Provider>
    );
};
