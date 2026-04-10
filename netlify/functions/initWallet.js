import { ethers } from 'ethers';
import { abi } from './abi.js';

export function getContract() {
    const RPC_URL = process.env.TESTNET_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
    const CONTRACT_ADDRESS = "0x96E872d905D55A885FAbd0B24e3397e264Daed37";
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    if (!process.env.PRIVATE_KEY) throw new Error("Missing PRIVATE_KEY environment variable in Netlify");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    return new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
}
