import { getContract } from './initWallet.js';
import { ethers } from 'ethers';

export const handler = async (event) => {
    try {
        if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Not Allowed' };
        const contract = getContract();
        const { name, password } = JSON.parse(event.body);
        if (!name || !password) return { statusCode: 400, body: JSON.stringify({ error: "Missing name or password" }) };

        const passHash = ethers.sha256(ethers.toUtf8Bytes(password));
        const tx = await contract.registerInstitutionData(name, passHash);
        const receipt = await tx.wait();
        
        return { statusCode: 200, body: JSON.stringify({ success: true, txHash: receipt.hash }) };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, body: JSON.stringify({ error: e.reason || e.message }) };
    }
};
