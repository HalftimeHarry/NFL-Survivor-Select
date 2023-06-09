// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PoolMaster is ERC721 {
    address public owner;
    uint256 public totalPools;
    uint256 public totalSupply;

    struct Pool {
        uint256 id;
        string name;
        uint256 cost;
        uint256 players;
        uint256 maxSpots;
        string date;
        string time;
    }

    mapping(uint256 => Pool) pools;
    mapping(uint256 => mapping(address => bool)) public hasBought;
    mapping(uint256 => mapping(uint256 => address)) public spotTaken;
    mapping(uint256 => uint256[]) spotsTaken;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxSpots,
        string memory _date,
        string memory _time
    ) public onlyOwner {
        totalPools++;
        pools[totalPools] = Pool(
            totalPools,
            _name,
            _cost,
            _maxSpots,
            _maxSpots,
            _date,
            _time
        );
    }

    function mint(uint256 _id, uint256 _spot) public payable {
        // Require that _id is not 0 or less than total pools...
        require(_id != 0);
        require(_id <= totalPools);

        // Require that ETH sent is greater than cost...
        require(msg.value >= pools[_id].cost);

        // Require that the seat is not taken, and the seat exists...
        require(spotTaken[_id][_spot] == address(0));
        require(_spot <= pools[_id].maxSpots);

        pools[_id].players -= 1; // <-- Update ticket count

        hasBought[_id][msg.sender] = true; // <-- Update buying status
        spotTaken[_id][_spot] = msg.sender; // <-- Assign seat

        spotsTaken[_id].push(_spot); // <-- Update seats currently taken

        totalSupply++;

        _safeMint(msg.sender, totalSupply);
    }

    function getPool(uint256 _id) public view returns (Pool memory) {
        return pools[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns (uint256[] memory) {
        return spotsTaken[_id];
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
