// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Week {
    struct WeekData {
        uint256 id;
        uint256 selectionDeadline;
        string name;
    }

    mapping(uint256 => WeekData) public weekMap; // Separate mapping to store all weeks

    // Other functions related to Week operations...
    function addWeek(
        uint256 id,
        uint256 selectionDeadline,
        string memory name
    ) public {
        WeekData storage week = weekMap[id];
        week.id = id;
        week.selectionDeadline = selectionDeadline;
        week.name = name;
    }

    function getWeek(
        uint256 id
    ) public view returns (uint256, uint256, string memory) {
        WeekData storage week = weekMap[id];
        return (week.id, week.selectionDeadline, week.name);
    }
}
