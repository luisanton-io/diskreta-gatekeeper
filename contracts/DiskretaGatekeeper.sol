// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DiskretaGatekeeper {
    address immutable deployer;
    AggregatorV3Interface public immutable priceFeed;

    mapping(string => uint256) public access;

    constructor(address priceFeedAddress) {
        deployer = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only deployer can call this function");
        _;
    }

    event AccessGranted(string userIdHash);

    function hashUserId(string memory userId) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(userId));
    }

    function getLatestPrice() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

    function grantAccess(
        string memory userIdHash
    ) external payable returns (bool) {
        require(
            access[userIdHash] < block.timestamp,
            "You already have access"
        );
        require(
            uint256(getLatestPrice()) * msg.value >= 10 * 10 ** 10,
            "You must pay at least $10 to access this service"
        );

        emit AccessGranted(userIdHash);

        access[userIdHash] = block.timestamp + 365 days;
        return true;
    }

    function withdraw() external onlyDeployer {
        payable(deployer).transfer(address(this).balance);
    }

    receive() external payable {
        // console.log("Received %s wei", msg.value);
        // forward to owner
        payable(deployer).transfer(msg.value);
    }
}
