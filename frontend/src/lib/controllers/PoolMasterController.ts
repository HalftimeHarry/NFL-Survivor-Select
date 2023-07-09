import EthersProvider from "/workspace/NFL-Survivor-Select/frontend/src/lib/providers/ethersProvider";
import { writable } from "svelte/store";

const baseState = {
  deployer: "loading deployer address",
  participant: "loading participant address...",
};

class PoolMasterController {
  #poolMasterStore = writable({ ...baseState });
  ethersProvider: EthersProvider;

  constructor() {
    this.ethersProvider = new EthersProvider();
  }

  get poolMasterStore() {
    return {
      subscribe: this.#poolMasterStore.subscribe,
    };
  }

  async init() {
    this.#updateDeployerAddress();
    this.#updateParticipantAddress();
  }

  async #updateDeployerAddress() {
    const deployer = await this.ethersProvider.getPoolMasterContract().deployerAddress;
    this.#poolMasterStore.update((s) => ({ ...s, deployer }));
  }

  async #updateParticipantAddress() {
    // Assuming getParticipantAddress method exists in the ethers provider
    const participant = await this.ethersProvider.getParticipantAddress();
    this.#poolMasterStore.update((s) => ({ ...s, participant }));
  }
}

const poolMasterController = new PoolMasterController();

export default poolMasterController;
