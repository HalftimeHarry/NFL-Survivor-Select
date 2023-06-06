// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Entry.sol"; // Import Entry contract

contract Pool {
    Entry private entryContract; // Declare state variable for Entry contract

    struct Week {
        uint256 id;
        uint256 selectionDeadline;
        string name;
        mapping(address => uint256) selectedTeams; // Mapping to track selected teams
    }

    struct Pool {
        string name;
        uint256[] weekIds; // Array of week IDs
    }

    mapping(uint256 => Pool) public pools; // Mapping from poolId to Pool
    mapping(uint256 => Week) private weekMap; // Separate mapping to store all weeks

    struct PoolEntry {
        // Rename struct to avoid name conflict
        uint256 weekId;
        address owner;
        bool active; // Flag to indicate if the entry is still active in the pool
    }

    mapping(uint256 => PoolEntry[]) public entries; // Update struct name here too

    constructor(address _entryContractAddress) {
        // Add Entry contract address parameter
        entryContract = Entry(_entryContractAddress); // Instantiate Entry contract
    }

    function createPool(string memory name, uint maxWeeks) public {
        Pool memory newPool;
        newPool.name = name;
        pools[pools.length] = newPool; // Add new pool to pools mapping

        // then create the weeks associated with this pool
        for (uint i = 1; i <= maxWeeks; i++) {
            // Replace the placeholders with the desired values
            uint256 selectionDeadline = 1659525600; // Replace with the desired selectionDeadline value
            string memory weekName = "Preseason Wk 1"; // Replace with the desired week name
            addWeekToPool(pools.length, i, selectionDeadline, weekName);
        }
    }

    function addWeekToPool(
        uint256 poolId,
        uint256 weekId,
        uint256 selectionDeadline,
        string memory name
    ) public {
        Week memory newWeek = Week({
            id: weekId,
            selectionDeadline: selectionDeadline,
            name: name
        });
        weekMap[weekId] = newWeek;
        pools[poolId].weekIds.push(weekId);
    }

    function enterPool(uint256 weekId, uint256 tokenId) public {
        require(weekMap[weekId].id != 0, "Week does not exist");
        require(
            entryContract.ownerOf(tokenId) == msg.sender,
            "Sender does not own the token"
        );

        entries[weekId].push(PoolEntry(weekId, msg.sender, true)); // Update struct name here too
    }

    // Custom getter for Week
    function getWeek(
        uint256 weekId
    )
        public
        view
        returns (uint256 id, uint256 selectionDeadline, string memory name)
    {
        Week memory week = weekMap[weekId];
        return (week.id, week.selectionDeadline, week.name);
    }
}
