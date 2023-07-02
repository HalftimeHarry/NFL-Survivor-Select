import { ethers } from "ethers"
import poolMaster from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolMaster.sol/PoolMaster.json"

class SignersProvider {
    constructor() {
        this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        this.signer = this.provider.getSigner();
    }

    getContract({ address, abi }) {
        return new ethers.Contract(address, abi, this.signer);
    }

    get poolMasterContract() {
        const contract = this.getContract({
            abi: poolMaster.abi,
            address: poolMaster.address
        });
        return {
            getDeployer: async () => await contract.deployer(),
            getParticipant: async () => await contract.participant(),
        }
    }
}

export default SignersProvider;