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

  constructor(account?: string) {
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
  getContract({ abi, address }) {
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
      participant: string,
      cost: number,
      maxSpots: number,
      spots: number,
      date: string,
      time: string,
      entryDeadline: string,
      pickDeadline: string
    ) => {
      return await contract.methods
        .list(weekId, participant, cost, maxSpots, spots, date, time, entryDeadline, pickDeadline)
        .send({ from: this.account });
    },
  };
}

    getPoolRewardContract() {
    const contract = this.getContract({
        abi: poolRewardMasterABI.abi,
        address: PoolRewardAddress,
    });
    return {
      updateEntryStatus: async (address: string) => {
        return await contract.updateEntryStatus(address);
      },
    };
  }
    getEntryContract() {
    const contract = this.getContract({
      abi: entryABI.abi,
      address: EntryAddress,
    });
    // Add the rest of the HorseMarket contract methods here and return the object
    return {
      listHorseForSale: async (tokenId: number, saleType: number, price: number, deadline: number, account: string) => {
          try {
            const result = await contract.listHorseForSale(tokenId, saleType, price, deadline, account);
            return result;
          } catch (error) {
            console.error('Error listing horse for sale:', error);
          }
      },
    };
  }
}

export default EthersProvider;