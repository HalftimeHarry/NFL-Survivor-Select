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

    function handleRandomPickOmitByeTeams(uint256 weekId) public {
        // Check if the sender is the pool master contract
        require(
            msg.sender == address(poolMaster),
            "Only the PoolMaster can handle random team picks"
        );

        // Get the list of participants who did not pick a team for the given week
        uint256[] memory participants = getParticipantsWithoutPickedTeam(
            weekId
        );

        // Iterate through the participants and randomly assign a team
        for (uint256 i = 0; i < participants.length; i++) {
            uint256 entryId = participants[i];
            uint256 randomTeamId = getRandomTeamId(weekId);
            pickTeam(entryId, weekId, randomTeamId);
        }
    }

    // Retrieves the picks made by participants for a given week
    function getPicksForWeek(uint256 weekId) internal view returns (uint256[] memory) {
        // Implement the logic to retrieve the picks for the specified week
        // and return an array of entry IDs representing the picks
        // ...
    }

    // Checks if a participant has made a pick for a given week
    function hasPickedTeam(uint256 entryId, uint256 weekId) internal view returns (bool) {
        // Implement the logic to check if the participant with the specified
        // entry ID has made a pick for the specified week
        // Return true if the participant has made a pick, false otherwise
        // ...
    }

    function getParticipantsWithoutPickedTeam(uint256 weekId) internal view returns (uint256[] memory) {
        uint256[] memory participants;
        uint256[] memory picks = getPicksForWeek(weekId);

        // Iterate through the picks and check if each entry has picked a team
        for (uint256 i = 0; i < picks.length; i++) {
            uint256 entryId = picks[i];
            bool picked = hasPickedTeam(entryId, weekId);
            if (!picked) {
                // Add the participant to the array
                participants = appendToArray(participants, entryId);
            }
        }

        return participants;
    }

    // Retrieves the available teams that have not been picked for a given week
    function getAvailableTeams(uint256 weekId) internal view returns (uint256[] memory) {
        // Retrieve the total number of teams
        uint256 totalTeams = getTotalTeams();

        // Create a dynamic array to store the available teams
        uint256[] memory availableTeams = new uint256[](totalTeams);

        // Initialize the index for the availableTeams array
        uint256 index = 0;

        // Iterate through each team and check if it has been picked for the specified week
        for (uint256 i = 0; i < totalTeams; i++) {
            uint256 teamId = i + 1; // Assuming team IDs start from 1
            bool picked = isTeamPickedForWeek(teamId, weekId);
            if (!picked) {
                // Add the team to the availableTeams array
                availableTeams[index] = teamId;
                index++;
            }
    }

    // Resize the availableTeams array to remove any unused elements
    assembly {
        mstore(availableTeams, index)
    }

    return availableTeams;
    }

    // Retrieves the total number of teams
    function getTotalTeams() internal view returns (uint256) {
        // Implement the logic to retrieve the total number of teams
        // Return the total number of teams
        // ...
    }

    // Checks if a team has been picked for a given week
    function isTeamPickedForWeek(uint256 teamId, uint256 weekId) internal view returns (bool) {
        // Implement the logic to check if the specified team has been picked
        // for the specified week
        // Return true if the team has been picked, false otherwise
        // ...
    }


    function getRandomTeamId(uint256 weekId) internal view returns (uint256) {
        // Get the list of available teams for the given week
        uint256[] memory availableTeams = getAvailableTeams(weekId);

        // Generate a random index within the range of available teams
        uint256 randomIndex = generateRandomNumber() % availableTeams.length;

        // Return the randomly selected team
        return availableTeams[randomIndex];
    }

    function generateRandomNumber() internal view returns (uint256) {
        // TODO: Implement a secure random number generation algorithm
        // For demonstration purposes, you can use a simple method like hashing block.timestamp

        return uint256(keccak256(abi.encodePacked(block.timestamp)));
    }

    // Helper function to append an element to an array
    function appendToArray(
        uint256[] memory array,
        uint256 element
    ) internal pure returns (uint256[] memory) {
        uint256[] memory newArray = new uint256[](array.length + 1);

        for (uint256 i = 0; i < array.length; i++) {
            newArray[i] = array[i];
        }

        newArray[array.length] = element;

        return newArray;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
