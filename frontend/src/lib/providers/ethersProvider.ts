import { ethers } from "ethers";
import entryABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/Entry.sol/Entry.json";
import poolMasterABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolMaster.sol/PoolMaster.json";
import poolRewardMasterABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolRewardManager.sol/PoolRewardManager.json";
import {
  DeployerAddress,
  PoolMasterAddress,
  PoolRewardAddress,
  EntryAddress
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

  get deployerAddress() {
    return DeployerAddress;
  }

  getPoolMasterContract() {
    const contract = this.getContract({
      abi: poolMasterABI.abi,
      address: PoolMasterAddress,
    });

    return {
      list: async (
        weekId: number,
        name: string,
        cost: number,
        maxSpots: number,
        date: string,
        time: string,
        entryDeadline: string,
        pickDeadline: string
      ) => {
        return await contract.methods
          .list(
            weekId,
            name,
            cost,
            maxSpots,
            date,
            time,
            entryDeadline,
            pickDeadline
          )
          .send({ from: this.account });
      },
      enter: async (id: number) => {
        return await contract.methods.enter(id).send({ from: this.account });
      },
      getPool: async (id: number) => {
        return await contract.methods.getPool(id).call({ from: this.account });
      },
      getWeek: async (weekId: number) => {
        return await contract.methods.getWeek(weekId).call({ from: this.account });
      },
      getEntriesCount: async (id: number) => {
        return await contract.methods.getEntriesCount(id).call({ from: this.account });
      },
      canSelectTeam: async (id: number) => {
        return await contract.methods.canSelectTeam(id).call({ from: this.account });
      },
      setByeWeek: async (teamId: number, weekId: number) => {
        return await contract.methods.setByeWeek(teamId, weekId).send({ from: this.account });
      },
      getPickDeadline: async (id: number) => {
        return await contract.methods.getPickDeadline(id).call({ from: this.account });
      },
      withdraw: async () => {
        return await contract.methods.withdraw().send({ from: this.account });
      },
    };
  }

  getEntryContract() {
    const contract = this.getContract({
      abi: entryABI.abi,
      address: EntryAddress,
    });

    return {
      pickTeam: async (entryId: number, weekId: number, teamId: number) => {
        try {
          const result = await contract.pickTeam(entryId, weekId, teamId);
          return result;
        } catch (error) {
          console.error('Error picking team:', error);
        }
      },
      ownerOf: async (tokenId: number) => {
        try {
          const result = await contract.ownerOf(tokenId);
          return result;
        } catch (error) {
          console.error('Error getting owner of token:', error);
        }
      },
      totalSupply: async () => {
        try {
          const result = await contract.totalSupply();
          return result;
        } catch (error) {
          console.error('Error getting total supply:', error);
        }
      },
      tokenURI: async (tokenId: number) => {
        try {
          const result = await contract.tokenURI(tokenId);
          return result;
        } catch (error) {
          console.error('Error getting token URI:', error);
        }
      },
    };
  }
}

export default EthersProvider;
