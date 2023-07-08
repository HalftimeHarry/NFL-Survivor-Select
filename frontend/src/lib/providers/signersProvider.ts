import EthersProvider from "/workspace/NFL-Survivor-Select/frontend/src/lib/providers/ethersProvider";
import entryABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/Entry.sol/Entry.json";
import { DeployerAddress } from "/workspace/NFL-Survivor-Select/frontend/src/lib/providers/contractAddresses";

class SignersProvider {
    constructor() {
        this.ethersProvider = new EthersProvider();
    }

    async getDeployer() {
        // DeployerAddress is used for the Entry contract
        return this.ethersProvider.getContract({
            abi: entryABI.abi,
            address: DeployerAddress
        });
    }

    async getParticipant() {
        // In this example, participant and deployer are assumed to be the same.
        // Replace with the correct address if needed.
        return this.ethersProvider.getContract({
            abi: entryABI.abi,
            address: DeployerAddress
        });
    }
}

export default SignersProvider;
