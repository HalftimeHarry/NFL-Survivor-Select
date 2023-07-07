import { ethers } from "ethers";
import poolMasterABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolMaster.sol/PoolMaster.json";
import poolRewardManagerABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolRewardManager.sol/PoolRewardManager.json";
import {
  PoolMasterAddress,
  PoolRewardManagerAddress
} from "./contractAddresses";

class EthersProvider {
  provider: ethers.providers.Web3Provider;
  signer: ethers.providers.JsonRpcSigner;
  account: string;

  constructor(account: string = '') {
    this.account = account;

    if (typeof window !== 'undefined') {
      this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      this.signer = this.provider.getSigner();
    } else {
      console.error("Window object is not available");
    }
  }

  async getSignerAddress(): Promise<string> {
    const address = await this.signer.getAddress();
    return address;
  }

  setAccount(account: string) {
    this.account = account;
  }

  async getConnectedAccount() {
    if (typeof window === 'undefined') {
      console.error("Window object is not available");
      return;
    }

    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Get the user's account address
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return accounts[0]; // Return the first account in the array
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      console.error("No web3 provider detected");
    }
  }

  // Add this method to the EthersProvider class
  async listAccounts() {
    return await this.provider.listAccounts();
  }

  getContract({ abi, address }: { abi: any, address: string }) {
    const contract = new ethers.Contract(address, abi, this.signer);
    return contract;
  }

  getPoolMasterContract() {
    const contract = this.getContract({
      abi: poolMasterABI.abi,
      address: PoolMasterAddress,
    });

    return {
      // existing methods
    };
  }

  getPoolRewardManagerContract() {
    const contract = this.getContract({
      abi: poolRewardManagerABI.abi,
      address: PoolRewardManagerAddress,
    });

    return {
      updateEntryStatus: async (entryId: number, isActive: boolean) => {
        return await contract.updateEntryStatus(entryId, isActive);
      },
      endPool: async (poolId: number) => {
        return await contract.endPool(poolId);
      },
      updateEntryStatusOnOutcome: async (entryId: number, isWinner: boolean) => {
        return await contract.updateEntryStatusOnOutcome(entryId, isWinner);
      },
      distributeRewards: async () => {
        return await contract.distributeRewards();
      },
      isActiveEntry: async (entryId: number) => {
        return await contract.isActiveEntry(entryId);
      },
      totalEntries: async () => {
        return await contract.totalEntries();
      },
      totalActiveEntries: async () => {
        return await contract.totalActiveEntries();
      },
      rewardPool: async () => {
        return await contract.rewardPool();
      },
    };
  }
}

export default EthersProvider;
