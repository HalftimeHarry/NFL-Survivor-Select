// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Pool is IERC721Receiver {
    IERC721 private nftContract;
    uint256 private winnerTokenId;
    mapping(uint256 => address) private participants;
    uint256 private totalParticipants;
    bool private poolClosed;

    event WinnerSelected(uint256 tokenId);

    constructor(address _nftContractAddress) {
        nftContract = IERC721(_nftContractAddress);
        poolClosed = false;
    }

    function enter(uint256 tokenId) external {
        require(!poolClosed, "Pool is closed");

        nftContract.safeTransferFrom(msg.sender, address(this), tokenId);
        participants[tokenId] = msg.sender;
        totalParticipants++;
    }

    function closePool() external {
        require(!poolClosed, "Pool is already closed");
        require(totalParticipants > 0, "No participants in the pool");

        poolClosed = true;
        uint256 randomIndex = generateRandomIndex();
        winnerTokenId = getTokenIdAtIndex(randomIndex);

        emit WinnerSelected(winnerTokenId);
    }

    function withdrawLoserNFTs() external {
        require(poolClosed, "Pool is still open");
        require(
            participants[winnerTokenId] != address(0),
            "Winner not selected"
        );

        for (uint256 tokenId = 1; tokenId <= totalParticipants; tokenId++) {
            if (tokenId != winnerTokenId) {
                address loser = participants[tokenId];
                nftContract.safeTransferFrom(address(this), loser, tokenId);
            }
        }
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function generateRandomIndex() private pure returns (uint256) {
        // Generate a random index based on some logic
        // Replace this with your own random index generation algorithm
        return 1;
    }

    function getTokenIdAtIndex(uint256 index) private pure returns (uint256) {
        // Get the token ID at the given index
        // Replace this with your own logic to retrieve token IDs
        return index;
    }
}
