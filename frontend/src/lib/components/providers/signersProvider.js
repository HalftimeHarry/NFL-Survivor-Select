import { ethers } from "ethers"
import escrow from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolMaster.sol/PoolMaster.json"

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
            getDeployer: async () => await contract.deployer(),
            getParticipant: async () => await contract.participant(),
        }
    }
}

export default SignersProvider;