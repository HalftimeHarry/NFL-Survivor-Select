import EthersProvider from "../providers/ethersProvider.js";
import { ethers } from "ethers";
import { writable } from "svelte/store";

const baseState={
    account: "loading account...",
    balance: "0.00"
}

class NavbarController { 
    #navbarManagerStore=writable({...baseState})
  
    constructor() {
        this.nav_store = {
            subscribe: this.#navbarManagerStore.subscribe
        }
    }
      
    async init() {
        this.ethersProvider = new EthersProvider();
        this.#getDetails();
    }
  
    async #getDetails() {
        let address = await this.ethersProvider?.signer.getAddress()
        let amount = await this.ethersProvider?.signer.getBalance();
        let balance = ethers.utils.formatEther(amount).toString()

        address = `${address?.substring(0, 5)}...${address?.slice(-5)}`
        balance =`${balance?.substring(0,6)}`

        this.#navbarManagerStore.update(s=>({...s,address,balance}))
    }

}

export default new NavbarController();