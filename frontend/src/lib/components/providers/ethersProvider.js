import { ethers } from "ethers";
import escrowAbi from "/workspace/Albatross-1/backend/artifacts/contracts/Escrow.sol/Escrow.json";
import franchiseAbi from "/workspace/Albatross-1/backend/artifacts/contracts/Franchise.sol/Franchise.json";



class EthersProvider {
  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    this.signer = this.provider.getSigner();
  }

  getContract({ address, abi }) {
    return new ethers.Contract(address, abi, this.signer);
  }

  get escrowContract() {
    const contract = this.getContract({
      abi: escrowAbi.abi,
      address: escrowAbi.address
    });
    return {
      getFundingProgress: async (nftID) => {
        const currentDeposit = await contract.currentDeposit(nftID);
        const goalAmount = await contract.goalAmount(nftID);
        if (goalAmount.eq(0)) {
          return 0;
        }
        return currentDeposit.mul(100).div(goalAmount);
      },
      approveSale: async (nftID) => {
        const transaction = await contract.connect(this.signer).approveSale(nftID);
        await transaction.wait();
      },
      updateInspectionStatus: async (nftID, status) => {
        const transaction = await contract.connect(this.signer).updateInspectionStatus(nftID, status);
        await transaction.wait();
      },
      getInspector: async () => await contract.inspector(),
      getLender: async () => await contract.lender(),
      getDao: async () => await contract.dao(),
      getSeller: async () => await contract.seller(),
      getApprovalStatus: async (nftID, address) => {
        return await contract.approval(nftID, address);
      },
      buyerDepositEarnest: async (nftID, { amount }) => {
        const amountInWei = ethers.utils.parseUnits(amount.toString(), 'ether');
        const tx = await contract.connect(this.signer).depositEarnest(nftID, { value: amountInWei });
        const receipt = await tx.wait();
        return receipt;
      },
      lenderLendFunds: async (nftID, { amount }) => {
        const amountInWei = ethers.utils.parseUnits(amount.toString(), 'ether');
        const tx = await contract.connect(this.signer).depositEarnest(nftID, { value: amountInWei });
        const receipt = await tx.wait();
        return receipt;
      },
      finalizeSale: async (nftID) => {
        const tx = await contract.connect(this.signer).finalizeSale(nftID);
        const receipt = await tx.wait();
        return receipt;
      },
      getInspectionStatus: async (nftID) => {
        return await contract.inspectionPassed(nftID);
      },
      getIsListed: async (nftID) => {
        return await contract.getIsListed(nftID);
      },
      getGoalAmount: async (nftID) => {
        return await contract.goalAmount(nftID);
      },
      getDeadLine: async (nftID) => {
        return await contract.deadline(nftID);
        },
      getPurchasePrice: async (nftID) => {
        console.log(`getPurchasePrice called with nftID: ${nftID}`);
        return await contract.purchasePrice(nftID);
        },
      getContributions: async (nftID) => {
          return await contract.currentDeposit(nftID);
        },
      };
  }

  get franchiseContract() {
    const contract = this.getContract({
      abi: franchiseAbi.abi,
      address: franchiseAbi.address
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
      abi: escrowAbi.abi,
      address: escrowAbi.address
    });
    contract.on("LogSuccess", callback);
  }
}

export default EthersProvider;