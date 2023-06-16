// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Entry is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from Entry ID to an array of team IDs
    mapping(uint256 => uint[]) private _pickedTeams;

    constructor() ERC721("Entry", "ENT") {}

    function mint(
        address recipient,
        string memory tokenURI
    ) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId); // mint token to recipient instead of msg.sender
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function pickTeam(uint256 entryId, uint teamId) public {
        // Check if the sender is the owner of the entry
        require(
            msg.sender == ownerOf(entryId),
            "Only the entry owner can pick a team"
        );

        // Iterate over the already picked teams to ensure the team hasn't been picked before
        for (uint i = 0; i < _pickedTeams[entryId].length; i++) {
            require(
                _pickedTeams[entryId][i] != teamId,
                "This team has already been picked"
            );
        }

        // Add the team to the picked teams
        _pickedTeams[entryId].push(teamId);
    }

    function changeTeam(
        uint256 entryId,
        uint oldTeamId,
        uint newTeamId
    ) public {
        // Check if the sender is the owner of the entry
        require(
            msg.sender == ownerOf(entryId),
            "Only the entry owner can change a team"
        );

        // Check if the new team has already been picked
        for (uint i = 0; i < _pickedTeams[entryId].length; i++) {
            require(
                _pickedTeams[entryId][i] != newTeamId,
                "This team has already been picked"
            );
        }

        // Replace the old team with the new one
        for (uint i = 0; i < _pickedTeams[entryId].length; i++) {
            if (_pickedTeams[entryId][i] == oldTeamId) {
                _pickedTeams[entryId][i] = newTeamId;
                break;
            }
        }
    }

    function getPickedTeams(
        uint256 entryId
    ) public view returns (uint[] memory) {
        return _pickedTeams[entryId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
