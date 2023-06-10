// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Entry.sol"; // The Entry contract

contract PoolMaster is ERC721 {
    address public owner;
    uint256 public totalPools;
    uint256 public totalSupply;

    Entry public entryContract; // instance of the Entry contract

    struct Pool {
        uint256 id;
        uint256 weekId; // Add this
        string name;
        uint256 cost;
        uint256 players;
        uint256 maxSpots;
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

    function uint2str(
        uint _i
    ) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }

    function initializeWeeks() private {
        uint256 seasonStartTime = 1670064000; // Timestamp for 9/7/2023 00:00:00 UTC
        uint256 weekDuration = 7 days;

        for (uint i = 1; i <= 18; i++) {
            uint256 weekStartTime = seasonStartTime + (weekDuration * (i - 1));
            uint256 entryDeadline = weekStartTime + (20 hours * i); // 9 PM EST on the start day of the week
            uint256 pickDeadline = entryDeadline + 10 minutes;

            poolWeeks[i] = Week(
                i,
                string(abi.encodePacked("Week ", uint2str(i))),
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
    }

    function enter(uint256 _id) public payable {
        require(_id != 0);
        require(_id <= totalPools);
        require(msg.value >= pools[_id].cost);
        require(!hasEntered[_id][msg.sender]);

        entryContract.mint("tokenURI"); // replace "tokenURI" with the actual token URI

        pools[_id].players -= 1;
        hasEntered[_id][msg.sender] = true;
        entriesCount[_id] += 1;
        totalSupply++;

        _safeMint(msg.sender, totalSupply);
    }

    function getPool(uint256 _id) public view returns (Pool memory) {
        return pools[_id];
    }

    function getEntriesCount(uint256 _id) public view returns (uint256) {
        return entriesCount[_id];
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
