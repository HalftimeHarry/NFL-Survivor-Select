// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./PoolMaster.sol";

contract PoolRewardManager {
    PoolMaster public poolMaster;
    address public deployer;
    uint256 public totalEntries;
    uint256 public totalActiveEntries;
    uint256 public rewardPool;

    mapping(uint256 => bool) public isActiveEntry;

    event EntryStatusChanged(uint256 entryId, bool isActive);
    event RewardDistributed(address recipient, uint256 amount);
    event PoolEnded(uint256 poolId, address winner, uint256 rewardAmount);

    constructor(address _poolMasterAddress) {
        poolMaster = PoolMaster(_poolMasterAddress);
        deployer = msg.sender;
        totalEntries = 0;
        totalActiveEntries = 0;
        rewardPool = 0;
    }

    modifier onlyOwner() {
        require(
            msg.sender == deployer,
            "Only the contract owner can call this function"
        );
        _;
    }

    function updateEntryStatus(uint256 _entryId, bool _isActive) external {
        require(
            msg.sender == address(poolMaster),
            "Only the PoolMaster can update entry status"
        );
        require(_entryId <= totalEntries, "Invalid entry ID");

        if (_isActive && !isActiveEntry[_entryId]) {
            isActiveEntry[_entryId] = true;
            totalActiveEntries++;
            emit EntryStatusChanged(_entryId, true);
        } else if (!_isActive && isActiveEntry[_entryId]) {
            isActiveEntry[_entryId] = false;
            totalActiveEntries--;
            emit EntryStatusChanged(_entryId, false);
        }
    }

    function getActiveEntry() internal view returns (address) {
        // Implement the logic to retrieve the active entry address
        // ...
    }

    function endPool(uint256 _poolId) public onlyOwner {
        require(_poolId != 0);
        require(_poolId <= poolMaster.totalPools());

        uint256 totalReward = rewardPool;
        uint256 deployerReward = (totalReward * 10) / 100; // 10% of the total reward

        if (totalActiveEntries == 1) {
            // Only one active entry remaining, award 90% of the reward to the participant
            uint256 entryReward = totalReward - deployerReward;
            address winner = getActiveEntry();

            // Transfer the reward to the winner
            payable(winner).transfer(entryReward);

            emit PoolEnded(_poolId, winner, entryReward);
        } else {
            // Multiple active entries remaining, distribute the reward evenly
            uint256 entryReward = totalReward / totalActiveEntries;

            // Transfer the reward to each active entry
            for (uint256 i = 1; i <= totalEntries; i++) {
                if (isActiveEntry[i]) {
                    address participant = poolMaster.entryContract().ownerOf(i);
                    payable(participant).transfer(entryReward);
                }
            }

            emit PoolEnded(_poolId, address(0), entryReward);
        }

        // Transfer the deployer's reward
        payable(deployer).transfer(deployerReward);

        // Reset the pool and reward variables
        rewardPool = 0;
        totalEntries = 0;
        totalActiveEntries = 0;
    }

    function distributeRewards() external {
        require(
            msg.sender == address(poolMaster),
            "Only the PoolMaster can distribute rewards"
        );
        require(
            totalActiveEntries > 0,
            "No active entries to distribute rewards"
        );

        uint256 rewardAmount = rewardPool / totalActiveEntries;

        for (uint256 i = 1; i <= totalEntries; i++) {
            if (isActiveEntry[i]) {
                address recipient = poolMaster.entryContract().ownerOf(i);
                payable(recipient).transfer(rewardAmount);
                emit RewardDistributed(recipient, rewardAmount);
            }
        }

        rewardPool = 0;
    }
}
