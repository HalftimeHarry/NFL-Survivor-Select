import EthersProvider from "../providers/ethersProvider.js";
import { ethers } from "ethers";
import { writable } from "svelte/store";

const baseState={
    account: "loading account...",
    balance: "0.00"
}

class NavbarController { 
    #navbarManagerStore=writable({...baseState})
  nav_store: any;
  ethersProvider: any;
  
    constructor() {
        this.nav_store = {
            subscribe: this.#navbarManagerStore.subscribe
        }
    }
      
    async init() {
        // Create a new instance of Web3Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        
        // Get the list of accounts and extract the first account from the list
        const accounts = await provider.listAccounts();
        const account = accounts[0];

        // Pass the account address to the EthersProvider constructor
        this.ethersProvider = new EthersProvider(account);

        this.#getDetails();
    }
  
    async #getDetails() {
        let address = await this.ethersProvider?.signer.getAddress()
        const amount = await this.ethersProvider?.signer.getBalance();
        let balance = ethers.utils.formatEther(amount).toString()

        address = `${address?.substring(0, 5)}...${address?.slice(-5)}`
        balance =`${balance?.substring(0,6)}`

        this.#navbarManagerStore.update(s=>({...s,address,balance}))
    }

}

export default new NavbarController();