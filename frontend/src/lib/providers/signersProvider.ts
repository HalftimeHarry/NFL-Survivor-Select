import { ethers } from "ethers"
import entry from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/Entry.sol/Entry.json"

class SignersProvider {
    constructor() {
        this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        this.signer = this.provider.getSigner();
    }

    getContract({ address, abi }) {
        return new ethers.Contract(address, abi, this.signer);
    }

    get entryContract() {
        const contract = this.getContract({
            abi: entry.abi,
            address: entry.address
        });
        return {
            getDeployer: async () => await contract.deployer(),
            getParticipant: async () => await contract.participant(),
        }
    }
}

export default SignersProvider;
