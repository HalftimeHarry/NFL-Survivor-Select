// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Base64 {
    bytes internal constant TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";

        uint256 encodedLen = 4 * ((len + 2) / 3);

        bytes memory result = new bytes(encodedLen);

        uint256 j = 0;
        uint256 i;
        for (i = 0; i < len - 2; i += 3) {
            encode3bytes(
                uint256(uint8(data[i])),
                uint256(uint8(data[i + 1])),
                uint256(uint8(data[i + 2])),
                result,
                j
            );
            j += 4;
        }

        if (len - i == 2) {
            encode2bytes(
                uint256(uint8(data[i])),
                uint256(uint8(data[i + 1])),
                result,
                j
            );
        } else if (len - i == 1) {
            encode1bytes(uint256(uint8(data[i])), result, j);
        }

        return string(result);
    }

    function encode1bytes(
        uint256 a,
        bytes memory result,
        uint256 idx
    ) private pure {
        uint256 value = a >> 2;
        result[idx] = getChar(value);

        value = (a & 0x03) << 4;
        result[idx + 1] = getChar(value);

        result[idx + 2] = "=";
        result[idx + 3] = "=";
    }

    function encode2bytes(
        uint256 a,
        uint256 b,
        bytes memory result,
        uint256 idx
    ) private pure {
        uint256 value = (a >> 2) & 0x3F;
        result[idx] = getChar(value);

        value = ((a & 0x03) << 4) | ((b >> 4) & 0x0F);
        result[idx + 1] = getChar(value);

        value = (b & 0x0F) << 2;
        result[idx + 2] = getChar(value);

        result[idx + 3] = "=";
    }

    function encode3bytes(
        uint256 a,
        uint256 b,
        uint256 c,
        bytes memory result,
        uint256 idx
    ) private pure {
        uint256 value = (a >> 2) & 0x3F;
        result[idx] = getChar(value);

        value = ((a & 0x03) << 4) | ((b >> 4) & 0x0F);
        result[idx + 1] = getChar(value);

        value = ((b & 0x0F) << 2) | ((c >> 6) & 0x03);
        result[idx + 2] = getChar(value);

        value = c & 0x3F;
        result[idx + 3] = getChar(value);
    }

    function getChar(uint256 value) private pure returns (bytes1) {
        return TABLE[value & 0x3F];
    }
}
