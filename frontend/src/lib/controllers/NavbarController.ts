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
        if (!window.ethereum) {
            console.error("Web3 provider (e.g., MetaMask) is not available");
            return;
        }

        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create a new instance of Web3Provider
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            this.ethersProvider = new EthersProvider(provider);

            this.#getDetails();
        } catch (error) {
            console.error("Error initializing Web3 provider:", error);
        }
        }
        async #getDetails() {
        if (!this.ethersProvider) return;

        const address = await this.ethersProvider.getSignerAddress();
        const amount = await this.ethersProvider.signer.getBalance();
        let balance = ethers.utils.formatEther(amount).toString();

        const truncatedAddress = `${address?.substring(0, 5)}...${address?.slice(-5)}`;
        balance = balance.substring(0, 6);

        this.#navbarManagerStore.update(s => ({ ...s, address: truncatedAddress, balance }));
        }
}

export default new NavbarController();