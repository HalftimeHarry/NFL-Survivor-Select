// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Entry.sol"; // The Entry contract
import "./Base64.sol";

contract PoolToken is ERC721 {
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {}

    function mint(address _to, uint256 _tokenId) external {
        _safeMint(_to, _tokenId);
    }
}

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
        uint256 weekId;
        string name;
        uint256 cost;
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
        bool hasPassed;
    }

    // Mapping to store bye weeks for each team
    mapping(uint256 => uint256) private byeWeeks;
    mapping(uint256 => Week) public poolWeeks;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => bool)) public hasEntered;
    mapping(uint256 => uint256) public entriesCount;
    mapping(uint256 => mapping(address => uint256)) selectedTeams;
    mapping(uint256 => address) public poolContracts;
    mapping(uint256 => PoolToken) public poolTokens;

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
                i,
                false // Setting initial value of hasPassed to false
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
        Pool memory newPool = Pool(
            totalPools,
            _weekId,
            _name,
            _cost,
            _maxSpots,
            _date,
            _time,
            _entryDeadline,
            _pickDeadline
        );
        pools[totalPools] = newPool;

        // Emit ListedPool event when a new pool is listed
        emit ListedPool(totalPools, _weekId, _name, _cost, _maxSpots);
    }

    function enter(uint256 _id) public payable {
        require(_id != 0);
        require(_id <= totalPools);
        require(msg.value >= pools[_id].cost);
        require(!hasEntered[_id][msg.sender]);
        require(pools[_id].spots > 0, "Pool is already full");

        pools[_id].spots -= 1;
        hasEntered[_id][msg.sender] = true;
        entriesCount[_id] += 1; // Increment the entry count



        // Transfer ownership of the NFT to the Pool contract
        _transfer(msg.sender, poolContracts[_id], totalSupply);

        // Emit EnteredPool event when a player enters a pool
        emit EnteredPool(_id, msg.sender, pools[_id].spots);
    }

    function generateTokenURI(
        Pool memory _pool
    ) private pure returns (string memory) {
        // Generate the metadata JSON string
        string memory metadata = string(
            abi.encodePacked(
                '{"name":"',
                _pool.name,
                '",',
                '"description":"NFT used for making a pick",',
                '"attributes":[{"trait_type":"Week","value":"',
                Strings.toString(_pool.weekId),
                '"}]}'
            )
        );

        // Return the full token URI
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    base64Encode(bytes(metadata))
                )
            );
    }

    function base64Encode(
        bytes memory _data
    ) private pure returns (string memory) {
        return Base64.encode(_data);
    }

    function getPool(uint256 _id) public view returns (Pool memory) {
        return pools[_id];
    }

    function getWeek(
        uint weekId
    )
        public
        view
        returns (uint256, string memory, uint256, uint256, uint256, bool)
    {
        Week memory week = poolWeeks[weekId];
        return (
            week.id,
            week.name,
            week.entryDeadline,
            week.pickDeadline,
            week.selectionDeadline,
            week.hasPassed
        );
    }

    function getEntriesCount(uint256 _id) public view returns (uint256) {
        return entriesCount[_id];
    }

    function canSelectTeam(uint256 _poolId) external view returns (bool) {
        require(_poolId != 0, "Invalid pool ID");
        require(_poolId <= totalPools, "Invalid pool ID");

        Pool memory pool = pools[_poolId];
        uint256 currentTime = block.timestamp;

        // Check if the current time is before the team selection deadline
        if (currentTime < pool.pickDeadline) {
            return true;
        } else {
            return false;
        }
    }

    // Set the bye week for a team
    function setByeWeek(uint256 teamId, uint256 weekId) public {
        byeWeeks[teamId] = weekId;
    }

    // Check if a team is on a bye for a given week
    function isByeWeek(
        uint256 teamId,
        uint256 weekId
    ) internal view returns (bool) {
        return byeWeeks[teamId] == weekId;
    }

    function getPickDeadline(uint256 _poolId) public view returns (uint256) {
        require(_poolId > 0 && _poolId <= totalPools, "Invalid pool ID");
        return pools[_poolId].pickDeadline;
    }

    function withdrawLoserNFTs(uint256 _poolId) public {
        require(_poolId != 0);
        require(_poolId <= totalPools);

        // Ensure that the Pool contract exists for the given pool
        require(
            poolContracts[_poolId] != address(0),
            "Pool contract does not exist"
        );

        // Delegate the call to the Pool contract
       // Pool(poolContracts[_poolId]).withdrawLoserNFTs();
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
