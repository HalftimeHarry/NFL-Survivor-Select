import SignersProvider from "/workspace/NFL-Survivor-Select/frontend/src/lib/components/providers/signersProvider.js";
import { writable } from "svelte/store";

const baseState = {
    deployer: "loading depolyer...",
    participant: "loading participant..."
}


class SignersController { 
    #signersStore=writable({...baseState})
  
    constructor() {
        this.signers_store = {
            subscribe: this.#signersStore.subscribe
        }
    }
      
    async init() {
        this.signersProvider = new SignersProvider();
        this.#getSigners();
    }
  
    async #getSigners() {
        const deployer = await this.signersProvider?.poolMasterContract.getDeployer();
        const participant = await this.signersProvider?.poolMasterContract.getParticipant();
      this.#signersStore.set({ deployer, participant });
    }

}

export default new SignersController();