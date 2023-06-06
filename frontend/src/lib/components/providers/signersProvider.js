import { ethers } from "ethers"
import escrow from "/workspace/Albatross-1/backend/artifacts/contracts/Escrow.sol/Escrow.json"

class SignersProvider {
    constructor() {
        this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        this.signer = this.provider.getSigner();
    }

    getContract({ address, abi }) {
        return new ethers.Contract(address, abi, this.signer);
    }

    get escrowContract() {
        const contract = this.getContract({
            abi: escrow.abi,
            address: escrow.address
        });
        return {
            getSeller: async () => await contract.seller(),
            getInspector: async () => await contract.inspector(),
            getLender: async () => await contract.lender(),
            getDAO: async () => await contract.dao(),
        }
    }
}

export default SignersProvider;