import { ethers } from "ethers";
import fs from "fs";
const wallet = ethers.Wallet.createRandom();
fs.writeFileSync(".env", `PRIVATE_KEY="${wallet.privateKey}"\nTESTNET_RPC_URL="https://rpc2.sepolia.org"\n`);
console.log(wallet.address);
