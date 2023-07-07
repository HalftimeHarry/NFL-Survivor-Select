import EthersProvider from "/workspace/NFL-Survivor-Select/frontend/src/lib/providers/ethersProvider";
import { writable } from "svelte/store";

const baseState = {
    poolMaster: "loading poolMaster address",
    deployer: "loading deployer address",
    totalEntries: 0,
    totalActiveEntries: 0,
    rewardPool: 0
};

class PoolRewardManagerController {
    #poolRewardsManagerStore = writable({ ...baseState });

    constructor() {
        this.ethersProvider = new EthersProvider();
    }

    get poolRewardsManagerStore() {
        return {
            subscribe: this.#poolRewardsManagerStore.subscribe,
        };
    }

    async init() {
        await this.#updatePoolRewardManagerDeployerAddress();
        await this.#updatePoolMaster();
        await this.#updateTotalEntries();
        await this.#updateTotalActiveEntries();
        await this.#updateRewardPool();
    }

    async #updatePoolRewardManagerDeployerAddress() {
        const deployer = await this.ethersProvider.deployerAddress;
        this.#poolRewardsManagerStore.update((s) => ({ ...s, deployer }));
    }

    async #updatePoolMaster() {
        // Assuming getPoolMaster method exists in the ethers provider
        const poolMaster = await this.ethersProvider.getPoolMasterAddress();
        this.#poolRewardsManagerStore.update((s) => ({ ...s, poolMaster }));
    }

    async #updateTotalEntries() {
        // Assuming getTotalEntries method exists in the ethers provider
        const totalEntries = await this.ethersProvider.getTotalEntries();
        this.#poolRewardsManagerStore.update((s) => ({ ...s, totalEntries }));
    }

    async #updateTotalActiveEntries() {
        // Assuming getTotalActiveEntries method exists in the ethers provider
        const totalActiveEntries = await this.ethersProvider.getTotalActiveEntries();
        this.#poolRewardsManagerStore.update((s) => ({ ...s, totalActiveEntries }));
    }

    async #updateRewardPool() {
        // Assuming getRewardPool method exists in the ethers provider
        const rewardPool = await this.ethersProvider.getRewardPool();
        this.#poolRewardsManagerStore.update((s) => ({ ...s, rewardPool }));
    }
}

const poolRewardsManagerController = new PoolRewardManagerController();

export default poolRewardsManagerController;
