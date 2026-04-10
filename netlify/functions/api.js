import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { ethers } from 'ethers';

const app = express();
app.use(cors());
app.use(express.json());

const CONTRACT_ADDRESS = "0x96E872d905D55A885FAbd0B24e3397e264Daed37";
// Netlify provides environment variables set in their UI dashboard seamlessly
const RPC_URL = process.env.TESTNET_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

// No fs.readFileSync or dynamic paths needed anymore, keeping Netlify perfectly stable.
import { abi } from './abi.js';

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
        contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
        console.log("Netlify Backend Wallet initialized:", wallet.address);
    }
} catch (error) {
    console.error("Backend Web3 Initialization Error:", error);
}

const router = express.Router();

// Same API routes, matching what the frontend fetch is configured to request.
router.post('/mint', async (req, res) => {
    try {
        if (!contract) return res.status(500).json({ error: "Blockchain contract not properly configured on backend." });
        const { hash, metadata } = req.body;
        if (!hash || !metadata) return res.status(400).json({ error: "Missing hash or metadata" });

        const bytes32Hash = hash.startsWith("0x") ? hash : "0x" + hash;
        const tx = await contract.issueCertificate(metadata.credentialId, bytes32Hash, metadata.institutionName);
        const receipt = await tx.wait();
        
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("/api/mint error:", error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

router.post('/revoke', async (req, res) => {
    try {
        if (!contract) return res.status(500).json({ error: "Blockchain contract not properly configured on backend." });
        const { hash } = req.body;
        if (!hash) return res.status(400).json({ error: "Missing hash" });

        const bytes32Hash = hash.startsWith("0x") ? hash : "0x" + hash;
        const tx = await contract.revokeCertificate(bytes32Hash);
        const receipt = await tx.wait();
        
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("/api/revoke error:", error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

router.post('/register-institution', async (req, res) => {
    try {
        if (!contract) return res.status(500).json({ error: "Blockchain contract not properly configured on backend." });
        const { name, password } = req.body;
        if (!name || !password) return res.status(400).json({ error: "Missing name or password" });

        const passHash = ethers.sha256(ethers.toUtf8Bytes(password));
        const tx = await contract.registerInstitutionData(name, passHash);
        const receipt = await tx.wait();
        
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("/api/register-institution error:", error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

router.post('/delete-institution', async (req, res) => {
    try {
        if (!contract) return res.status(500).json({ error: "Blockchain contract not properly configured on backend." });
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Missing name" });

        const tx = await contract.removeInstitution(name);
        const receipt = await tx.wait();
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("/api/delete-institution error:", error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

router.post('/add-credits', async (req, res) => {
    try {
        if (!contract) return res.status(500).json({ error: "Blockchain contract not properly configured on backend." });
        const { name, amount } = req.body;
        if (!name || !amount) return res.status(400).json({ error: "Missing name or amount" });

        const tx = await contract.addCredits(name, amount);
        const receipt = await tx.wait();
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("/api/add-credits error:", error);
        res.status(500).json({ error: error.reason || error.message });
    }
});

// We attach the router to multiple incoming paths. 
// '/api' for local Vite proxy, and '/.netlify/functions/api' for Netlify's cloud.
app.use('/api', router);
app.use('/.netlify/functions/api', router);

// Wrap our Express API in serverless-http to deploy on Netlify seamlessly
export const handler = serverless(app);
