import { ethers } from "ethers";
import poolMasterABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolMaster.sol/PoolMaster.json";
import poolRewardManagerABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolRewardManager.sol/PoolRewardManager.json";
import entryABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/Entry.sol/Entry.json";
import poolTokenABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolToken.sol/PoolToken.json";
import poolABI from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/Pool.sol/Pool.json";
import {
  EntryAddress,
  PoolMasterAddress,
  PoolRewardManagerAddress,
  PoolAddress,
  PoolTokenAddress,
} from "./contractAddresses";

class EthersProvider {
  deployerAddress: any;
  getParticipantAddress() {
    const participantAddress = "example participant address"; // Replace this with the actual logic to retrieve the participant address
    console.log("Participant Address:", participantAddress); // Log the participant address
    return participantAddress; // Return the participant address
  }
  provider: ethers.providers.Web3Provider;
  signer: ethers.providers.JsonRpcSigner;
  account: string;

  constructor(account: string = "") {
    this.account = account;

    if (typeof window !== "undefined") {
      this.provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
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
    if (typeof window === "undefined") {
      console.error("Window object is not available");
      return;
    }

    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Get the user's account address
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
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

  getContract({ abi, address }: { abi: any; address: string }) {
    const contract = new ethers.Contract(address, abi, this.signer);
    return contract;
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
        return await contract.list(
          weekId,
          name,
          cost,
          maxSpots,
          date,
          time,
          entryDeadline,
          pickDeadline
        );
      },
      enter: async (id: number) => {
        return await contract.enter(id);
      },
      getPool: async (id: number) => {
        return await contract.getPool(id);
      },
      getWeek: async (weekId: number) => {
        return await contract.getWeek(weekId);
      },
      getEntriesCount: async (id: number) => {
        return await contract.getEntriesCount(id);
      },
      canSelectTeam: async (id: number) => {
        return await contract.canSelectTeam(id);
      },
      setByeWeek: async (teamId: number, weekId: number) => {
        return await contract.setByeWeek(teamId, weekId);
      },
      getPickDeadline: async (id: number) => {
        return await contract.getPickDeadline(id);
      },
      withdraw: async () => {
        return await contract.withdraw();
      },
    };
  }

  getEntryContract() {
    const contract = this.getContract({
      abi: entryABI.abi,
      address: EntryAddress,
    });

    return {
      ownerOf: async (tokenId: number) => {
        return await contract.ownerOf(tokenId);
      },
      totalSupply: async () => {
        return await contract.totalSupply();
      },
      tokenURI: async (tokenId: number) => {
        return await contract.tokenURI(tokenId);
      },
      pickTeam: async (entryId: number, weekId: number, teamId: number) => {
        try {
          const result = await contract.pickTeam(entryId, weekId, teamId);
          return result;
        } catch (error) {
          console.error("Error picking team:", error);
        }
      },
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

  getPoolContract() {
    const contract = this.getContract({
      abi: poolABI.abi,
      address: PoolAddress,
    });

    return {
      enter: async (tokenId: number) => {
        return await contract.enter(tokenId);
      },
      closePool: async () => {
        return await contract.closePool();
      },
      withdrawLoserNFTs: async () => {
        return await contract.withdrawLoserNFTs();
      },
    };
  }

  getPoolTokenContract() {
    const contract = this.getContract({
      abi: poolTokenABI.abi,
      address: PoolTokenAddress,
    });

    return {
      mint: async (to: string, tokenId: number) => {
        return await contract.mint(to, tokenId);
      },
    };
  }
}

export default EthersProvider;
