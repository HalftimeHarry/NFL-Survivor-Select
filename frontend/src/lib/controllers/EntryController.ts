import EthersProvider from "/workspace/NFL-Survivor-Select/frontend/src/lib/providers/ethersProvider";
import { writable } from "svelte/store";

const baseState = {
  entryOwner: "loading entryOwner address",
  totalSupply: [],
  nfts: []
};

class EntryController {
  #entryStore = writable({ ...baseState });
  ethersProvider: any;

  constructor() {
    this.ethersProvider = new EthersProvider();
  }

  get entryStore() {
    return {
      subscribe: this.#entryStore.subscribe,
    };
  }

  async init(nftID) {
    await this.#entryOwnerAddress(nftID);
    await this.#getTotalSupply();
    await this.#getTokenURI(nftID);
  }

  async #entryOwnerAddress(nftID) {
    const entryOwner = await this.ethersProvider.getEntryContract().ownerOf(nftID);
    this.#entryStore.update((s) => ({ ...s, entryOwner }));
  }

  async #getTotalSupply(){
    const totalSupply = await this.ethersProvider.getEntryContract().totalSupply();
    this.#entryStore.update(s => ({ ...s, totalSupply }));
  }

  async #getTokenURI(nftID) {
    const tokenURI = await this.ethersProvider.getEntryContract().tokenURI(nftID);
    this.#entryStore.update(s => ({ ...s, tokenURI }));
  }

  async pickTeam(entryId, weekId, teamId) {
    try {
      const transactionReceipt = await this.ethersProvider.getEntryContract().pickTeam(entryId, weekId, teamId);
      if (transactionReceipt) {
        await transactionReceipt.wait();
      } else {
        console.error("Transaction is undefined.");
      }
    } catch (error) {
      console.error("Error in pickTeam:", error);
    }
  }
}

const entryController = new EntryController();

export default entryController;
