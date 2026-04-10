import { getContract } from './initWallet.js';

export const handler = async (event) => {
    try {
        if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Not Allowed' };
        const contract = getContract();
        const { name } = JSON.parse(event.body);
        if (!name) return { statusCode: 400, body: JSON.stringify({ error: "Missing name" }) };

        const tx = await contract.removeInstitution(name);
        const receipt = await tx.wait();
        
        return { statusCode: 200, body: JSON.stringify({ success: true, txHash: receipt.hash }) };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, body: JSON.stringify({ error: e.reason || e.message }) };
    }
};
