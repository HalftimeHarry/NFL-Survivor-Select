import SignersProvider from "/workspace/Albatross-1/frontend/src/lib/providers/signersProvider.js";
import { writable } from "svelte/store";

const baseState = {
    seller: "loading seller...",
    lender: "loading lender...",
    inspector: "loading inspector...",
    dao: "loading dao..."
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
        const seller = await this.signersProvider?.escrowContract.getSeller();
        const lender = await this.signersProvider?.escrowContract.getLender();
        const inspector = await this.signersProvider?.escrowContract.getInspector();
        const dao = await this.signersProvider?.escrowContract.getDAO();
      this.#signersStore.set({ seller, lender, inspector, dao });
    }

}

export default new SignersController();