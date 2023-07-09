import EthersProvider from "/workspace/NFL-Survivor-Select/frontend/src/lib/providers/ethersProvider";
import { writable } from "svelte/store";

const baseState = {
    deployer: "loading deployer...",
    participant: "loading participant..."
};

class SignersController { 
    #signersStore = writable({...baseState});
    ethersProvider: EthersProvider;
  
    constructor() {
        this.ethersProvider = new EthersProvider();
    }
      
    async init() {
        await this.#getSigners();
    }
  
    async #getSigners() {
        const deployer = await this.ethersProvider.deployerAddress;
        // Assuming getParticipantAddress() method exists in the ethers provider
        const participant = await this.ethersProvider.getParticipantAddress(); 
        this.#signersStore.set({ deployer, participant });
    }

    get signersStore() {
        return {
            subscribe: this.#signersStore.subscribe,
        };
    }
}

export default new SignersController();
