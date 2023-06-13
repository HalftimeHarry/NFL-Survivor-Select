// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Entry.sol"; // The Entry contract

contract PoolMaster is ERC721 {
    address public owner;
    uint256 public totalPools;
    uint256 public totalSupply;

    Entry public entryContract; // instance of the Entry contract

    // Add these debugging events
    event EnteredPool(uint256 poolId, address entrant, uint256 remainingSpots);
    event ListedPool(
        uint256 poolId,
        uint256 weekId,
        string name,
        uint256 cost,
        uint256 spots
    );

    struct Pool {
        uint256 id;
        uint256 weekId; // Add this
        string name;
        uint256 cost;
        uint256 players;
        uint256 spots;
        string date;
        string time;
        uint256 entryDeadline;
        uint256 pickDeadline;
    }

    struct Week {
        uint256 id;
        string name;
        uint256 entryDeadline;
        uint256 pickDeadline;
        uint256 selectionDeadline;
    }

    mapping(uint256 => Week) public poolWeeks;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => bool)) public hasEntered;
    mapping(uint256 => uint256) public entriesCount;
    mapping(uint256 => mapping(address => uint256)) selectedTeams;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _entryContractAddress
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
        entryContract = Entry(_entryContractAddress); // initialize Entry contract instance

        // initialize weeks
        initializeWeeks();
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length - 1;
        while (_i != 0) {
            bstr[k--] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }

    function initializeWeeks() private {
        uint256 seasonStartTime = 1670064000; // Timestamp for 9/7/2023 00:00:00 UTC
        uint256 weekDuration = 7 days;
        uint256 pickOffset = 10 minutes;

        for (uint i = 1; i <= 18; i++) {
            uint256 weekStartTime = seasonStartTime + ((i - 1) * weekDuration);
            uint256 entryDeadline = weekStartTime; // No entry offset
            uint256 pickDeadline = entryDeadline + pickOffset;

            poolWeeks[i] = Week(
                i,
                string(abi.encodePacked("Week ", Strings.toString(i))),
                entryDeadline,
                pickDeadline,
                i
            );
        }
    }

    function list(
        uint256 _weekId,
        string memory _name,
        uint256 _cost,
        uint256 _maxSpots,
        string memory _date,
        string memory _time,
        uint256 _entryDeadline,
        uint256 _pickDeadline
    ) public onlyOwner {
        require(poolWeeks[_weekId].id == _weekId, "Week does not exist");

        totalPools++;
        pools[totalPools] = Pool(
            totalPools,
            _weekId,
            _name,
            _cost,
            _maxSpots,
            _maxSpots,
            _date,
            _time,
            _entryDeadline,
            _pickDeadline
        );

        // Emit ListedPool event when a new pool is listed
        emit ListedPool(totalPools, _weekId, _name, _cost, _maxSpots);
    }

    function enter(uint256 _id) public payable {
        require(_id != 0);
        require(_id <= totalPools);
        require(msg.value >= pools[_id].cost);
        require(!hasEntered[_id][msg.sender]);
        require(pools[_id].players > 0, "Pool is already full");

        entryContract.mint("tokenURI"); // replace "tokenURI" with the actual token URI

        pools[_id].players -= 1;
        hasEntered[_id][msg.sender] = true;
        entriesCount[_id] += 1; // Increment the entry count

        totalSupply++;

        _safeMint(msg.sender, totalSupply);

        // Emit EnteredPool event when a player enters a pool
        emit EnteredPool(_id, msg.sender, pools[_id].players);
    }

    function getPool(uint256 _id) public view returns (Pool memory) {
        return pools[_id];
    }

    function getEntriesCount(uint256 _id) public view returns (uint256) {
        return entriesCount[_id];
    }

    function getSelectedTeam(uint256 entryId) public view returns (uint256) {
        return selectedTeams[entryId][msg.sender];
    }

    function pickTeam(uint256 entryId, uint256 teamId) public {
        // Check if the sender is the owner of the entry
        require(
            msg.sender == entryContract.ownerOf(entryId),
            "Only the entry owner can pick a team"
        );

        // Store the selected team in the PoolMaster contract
        selectedTeams[entryId][msg.sender] = teamId;

        // ... rest of the function ...
    }

    function canSelectTeam(uint256 _poolId) external view returns (bool) {
        require(_poolId != 0, "Invalid pool ID");
        require(_poolId <= totalPools, "Invalid pool ID");

        Pool storage pool = pools[_poolId];
        uint256 currentTime = block.timestamp;

        // Check if the current time is before the team selection deadline
        if (currentTime < pool.pickDeadline) {
            return true;
        } else {
            return false;
        }
    }

    function getPickDeadline(uint256 _poolId) public view returns (uint256) {
        require(_poolId > 0 && _poolId <= totalPools, "Invalid pool ID");
        return pools[_poolId].pickDeadline;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
