// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./PoolMaster.sol"; // Import the PoolMaster contract

interface IPoolMaster {
    function getWeek(
        uint256 weekId
    )
        external
        view
        returns (uint256, string memory, uint256, uint256, uint256, bool);
}

contract Entry is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    IPoolMaster public poolMaster;

    struct PickedTeam {
        uint256 weekId;
        uint256 teamId;
    }

    // Mapping from Entry ID to an array of PickedTeams
    mapping(uint256 => PickedTeam[]) private _pickedTeams;
    mapping(uint256 => address) private entryOwners;

    constructor(address _poolMasterAddress) ERC721("Entry", "ENT") {
        poolMaster = IPoolMaster(_poolMasterAddress);
    }

    event Minted(address indexed to, uint256 indexed tokenId);
    event PickDeadlineEvent(uint256 pickDeadline);
    event DebugInfo(uint256 weekId, uint256 pickDeadline, uint256 now);
    event WeekData(
        uint256 weekId,
        string weekName,
        uint256 poolDate,
        uint256 poolTime,
        uint256 poolDL,
        bool weekHasPassed
    );

    function _baseURI() internal pure override returns (string memory) {
        return "https://mytokenlocation.com";
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
        // Continue with the logic for picking a team
        _pickedTeams[entryId].push(PickedTeam(weekId, teamId));
    }

    function changeTeam(
        uint256 entryId,
        uint256 weekId,
        uint256 oldTeamId,
        uint256 newTeamId
    ) public {
        // Check if the sender is the owner of the entry
        require(
            msg.sender == ownerOf(entryId),
            "Only the entry owner can change a team"
        );

        // Get the week data
        (
            uint256 returnedWeekId,
            string memory weekName,
            uint256 poolDate,
            uint256 poolTime,
            uint256 poolDL,
            bool weekHasPassed
        ) = poolMaster.getWeek(weekId);

        // Emit the week data event
        emit WeekData(
            returnedWeekId,
            weekName,
            poolDate,
            poolTime,
            poolDL,
            weekHasPassed
        );

        // Check if the week has passed
        require(!weekHasPassed, "Cannot change team after the week has passed");

        // Check if the new team has already been picked
        for (uint256 i = 0; i < _pickedTeams[entryId].length; i++) {
            // Check if the weekId matches and the teamId matches the newTeamId
            if (
                _pickedTeams[entryId][i].weekId == weekId &&
                _pickedTeams[entryId][i].teamId == newTeamId
            ) {
                revert("This team has already been picked");
            }
        }

        // Replace the old team with the new one
        bool teamFound = false;
        for (uint256 i = 0; i < _pickedTeams[entryId].length; i++) {
            // Check if the weekId matches and the teamId matches the oldTeamId
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
