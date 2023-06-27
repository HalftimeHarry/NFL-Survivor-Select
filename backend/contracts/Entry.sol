// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./PoolMaster.sol"; // Import the PoolMaster contract

contract Entry is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    PoolMaster public poolMaster; // Declare the PoolMaster contract instance

    struct PickedTeam {
        uint256 weekId;
        uint256 teamId;
    }

    // Mapping from Entry ID to an array of PickedTeams
    mapping(uint256 => PickedTeam[]) private _pickedTeams;
    mapping(uint256 => address) private entryOwners;

    constructor(address _poolMaster) ERC721("Entry", "ENT") {
        poolMaster = PoolMaster(_poolMaster); // Assign the PoolMaster contract instance
    }

    event Minted(address indexed to, uint256 indexed tokenId);
    event PickDeadlineEvent(uint256 pickDeadline);

    function _baseURI() internal pure override returns (string memory) {
        return "https://mytokenlocation.com";
    }

    function initialize(PoolMaster _poolMaster) public {
        require(address(poolMaster) == address(0), "Already initialized");
        poolMaster = _poolMaster;
    }

    function mint(address to, string memory tokenURI) public {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);

        entryOwners[newItemId] = to; // add this line

        emit Minted(to, newItemId); // Emit the event after minting a token
    }

    function ownerOf(
        uint256 entryId
    ) public view override(ERC721, IERC721) returns (address) {
        require(entryId > 0, "Invalid entry ID");
        return entryOwners[entryId];
    }

    function pickTeam(uint256 entryId, uint256 weekId, uint256 teamId) public {
        require(
            msg.sender == ownerOf(entryId),
            "Only the entry owner can pick a team"
        );

        (, , , uint256 pickDeadline, ) = poolMaster.getWeek(weekId);
        emit PickDeadlineEvent(pickDeadline);
        require(
            block.timestamp < pickDeadline,
            "Pick deadline for this week has passed"
        );

        // Ensure the participant hasn't already picked this team for any week
        for (uint i = 0; i < _pickedTeams[entryId].length; i++) {
            require(
                _pickedTeams[entryId][i].teamId != teamId,
                "This team has already been picked"
            );
        }

        // Continue with the logic for picking a team
        _pickedTeams[entryId].push(PickedTeam(weekId, teamId));
    }

    function changeTeam(
        uint256 entryId,
        uint256 weekId, // we need the weekId to find the right team
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
            // check if the weekId matches and the teamId matches the newTeamId
            if (
                _pickedTeams[entryId][i].weekId == weekId &&
                _pickedTeams[entryId][i].teamId == newTeamId
            ) {
                revert("This team has already been picked");
            }
        }

        // Replace the old team with the new one
        bool teamFound = false;
        for (uint i = 0; i < _pickedTeams[entryId].length; i++) {
            // check if the weekId matches and the teamId matches the oldTeamId
            if (
                _pickedTeams[entryId][i].weekId == weekId &&
                _pickedTeams[entryId][i].teamId == oldTeamId
            ) {
                _pickedTeams[entryId][i].teamId = newTeamId;
                teamFound = true;
                break;
            }
        }

        // If we didn't find the team, revert the transaction
        require(teamFound, "No team found to replace for this week");
    }

    function getPickedTeams(
        uint256 entryId
    ) public view returns (uint256[] memory, uint256[] memory) {
        PickedTeam[] memory pickedTeams = _pickedTeams[entryId];
        uint256[] memory weekIds = new uint256[](pickedTeams.length);
        uint256[] memory teamIds = new uint256[](pickedTeams.length);

        for (uint256 i = 0; i < pickedTeams.length; i++) {
            weekIds[i] = pickedTeams[i].weekId;
            teamIds[i] = pickedTeams[i].teamId;
        }

        return (weekIds, teamIds);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
