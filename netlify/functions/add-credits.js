import { getContract } from './initWallet.js';

export const handler = async (event) => {
    try {
        if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Not Allowed' };
        const contract = getContract();
        const { name, amount } = JSON.parse(event.body);
        if (!name || !amount) return { statusCode: 400, body: JSON.stringify({ error: "Missing name or amount" }) };

        const tx = await contract.addCredits(name, amount);
        const receipt = await tx.wait();
        
        return { statusCode: 200, body: JSON.stringify({ success: true, txHash: receipt.hash }) };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, body: JSON.stringify({ error: e.reason || e.message }) };
    }
};
