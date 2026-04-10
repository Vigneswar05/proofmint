import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { readFileSync } from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const CONTRACT_ADDRESS = "0x96E872d905D55A885FAbd0B24e3397e264Daed37";
const RPC_URL = process.env.TESTNET_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

// Load artifact
const certChainPath = new URL('./artifacts/contracts/CertChain.sol/CertChain.json', import.meta.url).pathname;
// In commonJS we'd use require, but since type: module is in package.json, we use fs
const CertChainArtifact = JSON.parse(readFileSync(certChainPath, 'utf8'));

// Initialize Ethers Backend Wallet
let provider;
let wallet;
let contract;

try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    if (!process.env.PRIVATE_KEY) {
        console.warn("WARNING: PRIVATE_KEY not found in .env. Backend blockchain writes will fail.");
    } else {
        wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        contract = new ethers.Contract(CONTRACT_ADDRESS, CertChainArtifact.abi, wallet);
        console.log("Backend Ethereum Wallet initialized:", wallet.address);
    }
} catch (error) {
    console.error("Backend Web3 Initialization Error:", error);
}

app.post('/api/mint', async (req, res) => {
    try {
        if (!contract) return res.status(500).json({ error: "Blockchain contract not properly configured on backend." });
        
        const { hash, metadata } = req.body;
        if (!hash || !metadata) return res.status(400).json({ error: "Missing hash or metadata" });

        const bytes32Hash = hash.startsWith("0x") ? hash : "0x" + hash;
        
        console.log(`Backend minting certificate ${metadata.credentialId} to blockchain...`);
        const tx = await contract.issueCertificate(metadata.credentialId, bytes32Hash, metadata.institutionName);
        const receipt = await tx.wait();
        
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("/api/mint error:", error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

app.post('/api/revoke', async (req, res) => {
    try {
        if (!contract) return res.status(500).json({ error: "Blockchain contract not properly configured on backend." });
        
        const { hash } = req.body;
        if (!hash) return res.status(400).json({ error: "Missing hash" });

        const bytes32Hash = hash.startsWith("0x") ? hash : "0x" + hash;
        
        console.log(`Backend revoking certificate hash ${bytes32Hash}...`);
        const tx = await contract.revokeCertificate(bytes32Hash);
        const receipt = await tx.wait();
        
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("/api/revoke error:", error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

// Admin/Institution API Endpoints
app.post('/api/register-institution', async (req, res) => {
    try {
        if (!contract) return res.status(500).json({ error: "Blockchain contract not properly configured on backend." });
        
        const { name, password } = req.body;
        if (!name || !password) return res.status(400).json({ error: "Missing name or password" });

        const passHash = ethers.sha256(ethers.toUtf8Bytes(password));
        console.log(`Backend registering institution ${name}...`);
        const tx = await contract.registerInstitutionData(name, passHash);
        const receipt = await tx.wait();
        
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("/api/register-institution error:", error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

app.post('/api/delete-institution', async (req, res) => {
    try {
        if (!contract) return res.status(500).json({ error: "Blockchain contract not properly configured on backend." });
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Missing name" });

        console.log(`Backend removing institution ${name}...`);
        const tx = await contract.removeInstitution(name);
        const receipt = await tx.wait();
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("/api/delete-institution error:", error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

app.post('/api/add-credits', async (req, res) => {
    try {
        if (!contract) return res.status(500).json({ error: "Blockchain contract not properly configured on backend." });
        const { name, amount } = req.body;
        if (!name || !amount) return res.status(400).json({ error: "Missing name or amount" });

        console.log(`Backend adding credits securely for ${name}...`);
        const tx = await contract.addCredits(name, amount);
        const receipt = await tx.wait();
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("/api/add-credits error:", error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

app.listen(PORT, () => {
    console.log(`ProofMint Backend Server running on port ${PORT}`);
});
