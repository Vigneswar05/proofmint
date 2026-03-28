import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import sha256 from 'sha256';

// Import ABI from the hardhat artifacts folder
import CertChainArtifact from '../artifacts/contracts/CertChain.sol/CertChain.json';

const CONTRACT_ADDRESS = "0x26F8dF71807cA65352bfC1BEae1863cBFb8f5C9e";

const BlockchainContext = createContext();
export const useBlockchain = () => useContext(BlockchainContext);

export const BlockchainProvider = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);

    // Keep institutions for mock login unless we update entirely to Web3 login
    const [blockchainInstitutions, setBlockchainInstitutions] = useState({
        'ABC Institute': { passwordHash: sha256('123456'), credits: 1000, isRegistered: true }
    });

    const [blockchainHashes, setBlockchainHashes] = useState({});

    // Initialize Web3 Ethers Provider
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                try {
                    const web3Provider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(web3Provider);
                    const web3Contract = new ethers.Contract(CONTRACT_ADDRESS, CertChainArtifact.abi, web3Provider);
                    setContract(web3Contract);
                } catch (e) {
                    console.error("MetaMask error", e);
                }
            } else {
                console.warn("No MetaMask detected. Read-only mode via Public Node.");
                const publicProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
                const publicContract = new ethers.Contract(CONTRACT_ADDRESS, CertChainArtifact.abi, publicProvider);
                setProvider(publicProvider);
                setContract(publicContract);
            }
            
            const savedUser = localStorage.getItem('cert_user');
            if (savedUser) {
                const u = JSON.parse(savedUser);
                setCurrentUser(u);
                setUserRole(u.role);
            }
            setIsReady(true);
        };
        initWeb3();
    }, []);

    const login = async (role, name, password) => {
        if (!window.ethereum) {
            alert("MetaMask is required for secure Web3 login.");
            return null;
        }
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (role === 'institution') {
            const isLocalFallback = (name === 'ABC Institute' && password === '123456');
            if (!isLocalFallback) {
                alert('Invalid institution credentials.');
                return null;
            }
        } else if (role !== 'admin') {
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

    // Keep stub for backwards UI compatibility
    const registerInstitutionOnBlockchain = async () => { alert("This feature requires Web3 Admin keys."); };
    const deleteInstitutionOnBlockchain = async () => {};
    const addCreditsOnBlockchain = async () => {};

    // --- TRUE WEB3 STORE HASH ---
    const storeHashOnBlockchain = async (hash, metadata) => {
        if (!window.ethereum) throw new Error("MetaMask is required to mint to blockchain.");
        if (!contract) throw new Error("Contract not initialized.");

        // We need a signer to completely mutate the state
        const signer = await provider.getSigner();
        const contractWithSigner = contract.connect(signer);

        // Deduct local credits for UI feel (real check is in contract)
        if (metadata.institutionName) {
            const inst = blockchainInstitutions[metadata.institutionName];
            if (!inst || (inst.credits || 0) < 1) throw new Error("Insufficient local credits.");
            setBlockchainInstitutions({...blockchainInstitutions, [metadata.institutionName]: { ...inst, credits: inst.credits - 1 }});
        }

        try {
            // Convert hash string to bytes32 format '0x...'
            const bytes32Hash = "0x" + hash;
            
            // This triggers the MetaMask Popup!
            const tx = await contractWithSigner.issueCertificate(bytes32Hash, metadata.institutionName);
            
            // Transaction submitted, now we wait for it to be mined
            const receipt = await tx.wait();

            const publicLedgerData = {
                courseName: metadata.courseName,
                institutionName: metadata.institutionName,
                credentialId: metadata.credentialId,
                timestamp: Date.now(),
                txHash: receipt.hash, // The actual network transaction hash
                isRevoked: false
            };

            setBlockchainHashes({...blockchainHashes, [hash]: publicLedgerData});
            return publicLedgerData;
        } catch (error) {
            console.error("Web3 Error:", error);
            throw new Error(error.reason || error.message);
        }
    };

    const revokeHashOnBlockchain = async (hash) => {
        if (!window.ethereum || !contract) return false;
        try {
            const signer = await provider.getSigner();
            const contractWithSigner = contract.connect(signer);
            const tx = await contractWithSigner.revokeCertificate("0x" + hash);
            await tx.wait();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    // --- TRUE WEB3 VERIFY ---
    const verifyHashOnBlockchain = async (hash) => {
        if (!contract) return null;
        try {
            // Read from the public smart contract (no MetaMask gas needed)
            const result = await contract.verifyCertificate("0x" + hash);
            const exists = result[0];
            const isRevoked = result[1];
            const institution = result[2];
            const timestamp = Number(result[3]) * 1000;

            if (exists) {
                return {
                    isRevoked,
                    institutionName: institution,
                    courseName: "Authenticated by Blockchain Ledger", // Fallback text
                    timestamp: timestamp
                };
            }
            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const verifyCredentialIdOnBlockchain = async (credentialId) => {
        // Advanced decentralized indexing isn't set up, we rely on local cache for UI, but the real test is file upload (binary hash)
        for (const [hash, data] of Object.entries(blockchainHashes)) {
            if (data.credentialId === credentialId) return { hash, data };
        }
        return null; // A robust full dApp uses The Graph or Indexers for scanning QRs without files
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
