import { ethers } from "ethers";
import entryAbi from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/Entry.sol/Entry.json";
import poolMasterAbi from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolMaster.sol/PoolMaster.json";
import poolRewardManagerAbi from "/workspace/NFL-Survivor-Select/backend/artifacts/contracts/PoolRewardManager.sol/PoolRewardManager.json";



class EthersProvider {
  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    this.signer = this.provider.getSigner();
  }

  getContract({ address, abi }) {
    return new ethers.Contract(address, abi, this.signer);
  }

  get entryContract() {
    const contract = this.getContract({
      abi: entryAbi.abi,
      address: entryAbi.address
    });
    return {
      getFundingProgress: async (nftID) => {
        const currentTeam = await contract.getPickedTeams(nftID);

        return currentTeam;
      },
    };
  }

  get poolMasterContract() {
    const contract = this.getContract({
      abi: poolMasterAbi.abi,
      address: poolMasterAbi.address
    });
    return {
      getTotalSupply: async () => await contract.totalSupply(),
      getTokenURI: async () => {
        const nfts = []
        const totalSupply = await contract.totalSupply()
        for (var i = 1; i <= totalSupply; i++) {
          const uri = await contract.tokenURI(i);
          const response = await fetch(uri)
          const metadapp = await response.json()
          nfts.push(metadapp)   
        }
        return nfts
      }
    }
  }

    get poolRewardManagerContract() {
      const contract = this.getContract({
        abi: poolRewardManagerAbi.abi,
        address: poolRewardManagerAbi.address
      });
      return {
        getTotalSupply: async () => await contract.totalSupply(),
        getTokenURI: async () => {
          const nfts = []
          const totalSupply = await contract.totalSupply()
          for (var i = 1; i <= totalSupply; i++) {
            const uri = await contract.tokenURI(i);
            const response = await fetch(uri)
            const metadapp = await response.json()
            nfts.push(metadapp)   
          }
          return nfts
        }
      }
    }

    attachLogSuccessListener(callback) {
    const contract = this.getContract({
      abi: entryAbi.abi,
      address: entryAbi.address
    });
    contract.on("LogSuccess", callback);
  }
}

export default EthersProvider;