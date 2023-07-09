// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PoolToken is ERC721 {
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {}

    function mint(address _to, uint256 _tokenId) external {
        _safeMint(_to, _tokenId);
    }
}

contract PoolMaster {
    address public owner;
    uint256 public totalPools;
    uint256 public totalSupply;

    struct Pool {
        uint256 id;
        uint256 weekId;
        string name;
        uint256 cost;
        uint256 players;
        uint256 spots;
        string date;
        string time;
        uint256 entryDeadline;
        uint256 pickDeadline;
        bool acceptingBids;
        uint256 minimumPrice;
        uint256 biddingDeadline;
    }

    struct Week {
        uint256 id;
        string name;
        uint256 entryDeadline;
        uint256 pickDeadline;
        uint256 selectionDeadline;
        bool hasPassed;
    }

    mapping(uint256 => Week) public poolWeeks;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => bool)) public hasEntered;
    mapping(uint256 => uint256) public entriesCount;
    mapping(uint256 => PoolToken) public poolTokens;

    event EnteredPool(uint256 poolId, address entrant, uint256 remainingSpots);
    event ListedPool(
        uint256 poolId,
        uint256 weekId,
        string name,
        uint256 cost,
        uint256 spots
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        initializeWeeks();
    }

    function initializeWeeks() private {
        uint256 seasonStartTime = 1670064000; // Timestamp for 9/7/2023 00:00:00 UTC
        uint256 weekDuration = 7 days;
        uint256 pickOffset = 10 minutes;

        for (uint256 i = 1; i <= 18; i++) {
            uint256 weekStartTime = seasonStartTime + ((i - 1) * weekDuration);
            uint256 entryDeadline = weekStartTime; // No entry offset
            uint256 pickDeadline = entryDeadline + pickOffset;

            poolWeeks[i] = Week(
                i,
                string(abi.encodePacked("Week ", Strings.toString(i))),
                entryDeadline,
                pickDeadline,
                i,
                false
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
        uint256 _pickDeadline,
        bool _acceptingBids,
        uint256 _minimumPrice,
        uint256 _biddingDeadline
    ) public onlyOwner {
        require(poolWeeks[_weekId].id == _weekId, "Week does not exist");

        totalPools++;
        Pool memory newPool = Pool(
            totalPools,
            _weekId,
            _name,
            _cost,
            _maxSpots,
            _maxSpots,
            _date,
            _time,
            _entryDeadline,
            _pickDeadline,
            _acceptingBids,
            _minimumPrice,
            _biddingDeadline
        );
        pools[totalPools] = newPool;
        poolTokens[totalPools] = new PoolToken(_name, "POOL");

        // Emit ListedPool event when a new pool is listed
        emit ListedPool(totalPools, _weekId, _name, _cost, _maxSpots);
    }

    function enter(uint256 _id) public payable {
        require(_id != 0, "Invalid pool ID");
        require(_id <= totalPools, "Pool does not exist");
        require(msg.value >= pools[_id].cost, "Insufficient payment");
        require(!hasEntered[_id][msg.sender], "Already entered this pool");
        require(pools[_id].players > 0, "Pool is already full");

        pools[_id].players -= 1;
        hasEntered[_id][msg.sender] = true;
        entriesCount[_id] += 1;

        // Mint a new token for the participant
        PoolToken poolToken = poolTokens[_id];
        totalSupply++;
        poolToken.mint(msg.sender, totalSupply);

        // Emit EnteredPool event when a player enters a pool
        emit EnteredPool(_id, msg.sender, pools[_id].players);
    }

    // Rest of the contract functions...
}
