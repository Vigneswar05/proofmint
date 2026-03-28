import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import sha256 from 'sha256';

// Import ABI from the hardhat artifacts folder
import CertChainArtifact from '../artifacts/contracts/CertChain.sol/CertChain.json';

const CONTRACT_ADDRESS = "0x96E872d905D55A885FAbd0B24e3397e264Daed37";

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
            const tx = await contractWithSigner.issueCertificate(metadata.credentialId, bytes32Hash, metadata.institutionName);
            
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
        if (!contract) return null;
        try {
            // Decentralized on-chain lookup for the QR Code!
            const hash = await contract.getHashByCredential(credentialId);
            
            if (!hash || hash === "0x0000000000000000000000000000000000000000000000000000000000000000") {
                return null;
            }
            
            const rawHashStr = hash.substring(2);
            
            // Once we have the hash, we query verifyCertificate 
            const certData = await verifyHashOnBlockchain(rawHashStr);
            if (certData) {
                // Return data with raw hash string format so UI renders it nicely
                return { hash: rawHashStr, data: certData };
            }
            return null;
        } catch (error) {
            console.error("verifyCredential error:", error);
            return null;
        }
    };

    // --- ROBUST CRYPTOGRAPHIC HASHING ENGINE (ethers.js v6) ---
    // ethers.sha256 handles Uint8Array natively and is perfectly consistent
    
    const generateBlobHash = async (blob) => {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            // ethers.sha256 returns a '0x' prefixed hex string
            const fullHash = ethers.sha256(uint8Array);
            // We return the raw hex without '0x' to keep current app logic consistent
            return fullHash.substring(2);
        } catch (err) {
            console.error("Hashing Error:", err);
            return null;
        }
    };

    const generateStringHash = async (str) => {
        // ethers.id calculates the keccak256 hash of a UTF-8 string, but we want sha256
        // for cross-compatibility with our existing record system.
        const utf8Bytes = ethers.toUtf8Bytes(str);
        const fullHash = ethers.sha256(utf8Bytes);
        return fullHash.substring(2);
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
            generateStringHash,
            blockchainHashes
        }}>
            {children}
        </BlockchainContext.Provider>
    );
};
