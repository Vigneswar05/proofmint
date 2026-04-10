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
            let web3Contract;
            if (window.ethereum) {
                try {
                    const web3Provider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(web3Provider);
                    web3Contract = new ethers.Contract(CONTRACT_ADDRESS, CertChainArtifact.abi, web3Provider);
                    setContract(web3Contract);
                } catch (e) {
                    console.error("MetaMask error", e);
                }
            } else {
                console.warn("No MetaMask detected. Read-only mode via Public Node.");
                const publicProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
                web3Contract = new ethers.Contract(CONTRACT_ADDRESS, CertChainArtifact.abi, publicProvider);
                setProvider(publicProvider);
                setContract(web3Contract);
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

    const loadBlockchainData = async () => {
        if (!contract) return;
        try {
            // Load Certificates from Blockchain
            const filter = contract.filters.CertificateIssued();
            const events = await contract.queryFilter(filter);
            const hashesMap = {};
            for (let event of events) {
                const isRevokedData = await contract.verifyCertificate(event.args.hash);
                hashesMap[event.args.hash.substring(2)] = {
                    courseName: "Blockchain Anchored", 
                    institutionName: event.args.institution,
                    credentialId: event.args.credentialId,
                    timestamp: Number(event.args.timestamp) * 1000,
                    txHash: event.transactionHash,
                    isRevoked: isRevokedData.isRevoked
                };
            }
            setBlockchainHashes(hashesMap);

            // Load Institutions and their Credits from Blockchain
            const instFilter = contract.filters.InstitutionRegistered();
            const instEvents = await contract.queryFilter(instFilter);
            const instsMap = {};
            for (let e of instEvents) {
                const name = e.args.name;
                const instData = await contract.registeredInstitutions(name);
                if (instData.isRegistered) {
                    instsMap[name] = {
                        credits: Number(instData.credits),
                        isRegistered: instData.isRegistered
                    };
                }
            }
            setBlockchainInstitutions(instsMap);
        } catch (e) {
            console.error("Error loading blockchain data:", e);
        }
    };

    useEffect(() => {
        if (contract) loadBlockchainData();
    }, [contract]);

    const login = async (role, name, password) => {
        // No MetaMask popup necessary. The blockchain can be read via the public RPC node connection automatically.
        if (role === 'admin') {
            if (name !== 'VKNexora' || password !== 'Vigneswar@05') {
                alert('Invalid admin credentials.');
                return null;
            }
        } else if (role === 'institution') {
            if (contract) {
                const passHash = ethers.sha256(ethers.toUtf8Bytes(password));
                const isValid = await contract.verifyInstitutionLogin(name, passHash);
                if (!isValid) {
                    alert('Invalid institution credentials from blockchain.');
                    return null;
                }
            } else {
                alert('No Web3 provider found to verify login.');
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
        try {
            const res = await fetch('/.netlify/functions/register-institution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to register institution');
            }
            await loadBlockchainData();
            alert("Institution successfully deployed to registry.");
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
    };
    
    const deleteInstitutionOnBlockchain = async (name) => {
        try {
            const res = await fetch('/.netlify/functions/delete-institution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (!res.ok) throw new Error('Failed to delete institution');
            await loadBlockchainData();
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
    };

    const addCreditsOnBlockchain = async (name, amount) => {
        try {
            const res = await fetch('/.netlify/functions/add-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, amount })
            });
            if (!res.ok) throw new Error('Failed to add credits');
            await loadBlockchainData();
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
    };

    // --- TRUE WEB3 STORE HASH ---
    const storeHashOnBlockchain = async (hash, metadata) => {
        try {
            const res = await fetch('/.netlify/functions/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash, metadata })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to mint on backend');
            }

            const data = await res.json();

            await loadBlockchainData();

            return {
                courseName: metadata.courseName,
                institutionName: metadata.institutionName,
                credentialId: metadata.credentialId,
                timestamp: Date.now(),
                txHash: data.txHash,
                isRevoked: false
            };
        } catch (error) {
            console.error("Backend Mint Error:", error);
            throw new Error(error.message);
        }
    };

    const revokeHashOnBlockchain = async (hash) => {
        try {
            const res = await fetch('/.netlify/functions/revoke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hash })
            });
            if (!res.ok) throw new Error('Revoke failed');
            await loadBlockchainData();
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
