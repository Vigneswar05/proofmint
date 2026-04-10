import { getContract } from './initWallet.js';

export const handler = async (event) => {
    try {
        if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Not Allowed' };
        const contract = getContract();
        const { hash, metadata } = JSON.parse(event.body);
        if (!hash || !metadata) return { statusCode: 400, body: JSON.stringify({ error: "Missing hash or metadata" }) };

        const bytes32Hash = hash.startsWith("0x") ? hash : "0x" + hash;
        const tx = await contract.issueCertificate(metadata.credentialId, bytes32Hash, metadata.institutionName);
        const receipt = await tx.wait();
        
        return { statusCode: 200, body: JSON.stringify({ success: true, txHash: receipt.hash }) };
    } catch (e) {
        console.error("Minting Error:", e);
        return { statusCode: 500, body: JSON.stringify({ error: e.reason || e.message }) };
    }
};
