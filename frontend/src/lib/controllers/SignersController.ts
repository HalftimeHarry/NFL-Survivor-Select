import SignersProvider from "/workspace/NFL-Survivor-Select/frontend/src/lib/providers/signersProvider";
import { writable } from "svelte/store";

const baseState = {
    deployer: "loading deployer...",
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
        const deployer = await this.signersProvider?.escrowContract.getDeployer();
        const participant = await this.signersProvider?.escrowContract.getParticipant();
      this.#signersStore.set({ seller, lender, inspector, dao });
    }

}

export default new SignersController();
