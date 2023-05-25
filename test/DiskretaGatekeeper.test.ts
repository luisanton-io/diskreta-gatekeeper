import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { DiskretaGatekeeper } from "../typechain-types";
import { network } from "hardhat";
import dotenv from "dotenv";

dotenv.config()

// describe("Price feed", function () {
//   // const address = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"

// })

describe("Gatekeeper", function () {
  let gatekeeper: DiskretaGatekeeper

  // deploys the contract
  before(async function () {

    const priceFeedAddress = {
      "mainnet": process.env.MAINNET_PRICE_FEED_ADDRESS,
      "mumbai": process.env.MUMBAI_PRICE_FEED_ADDRESS,
      "polygon": process.env.POLYGON_PRICE_FEED_ADDRESS,
      // "hardhat": process.env.MUMBAI_PRICE_FEED_ADDRESS // fork
      "hardhat": process.env.MAINNET_PRICE_FEED_ADDRESS // fork
    }[network.name]

    const DiskretaGatekeeper = await ethers.getContractFactory("DiskretaGatekeeper");
    gatekeeper = await DiskretaGatekeeper.deploy(priceFeedAddress!);
    await gatekeeper.deployed();
  });

  // tests the contract
  describe("access", function () {
    it("should log price feed address", async () => {
      console.log("Price feed address: ", await gatekeeper.priceFeed())
    })


    it("should return the hash for some user id", async () => {
      const userId = "1234567890abcdef";
      const hash = await gatekeeper.hashUserId(userId);

      // console.table({ userId, hash })

      expect(hash).to.equal(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(userId))
      );
    })

    it("should return the latest price", async function () {
      const ethUSD = await gatekeeper.getLatestPrice();
      console.table({ "ETH/USD": ethUSD.toNumber() / 1e8 })
      expect(ethUSD.toNumber()).to.be.above(0);
    })

    it("should grant access to users paying $10 worth of ETH", async function () {
      const userId = "1234567890abcdef";
      const hash = await gatekeeper.hashUserId(userId);
      const ethUSD = (await gatekeeper.getLatestPrice()).toNumber() / 1e8
      const priceUSD = 10
      const priceETH = priceUSD / ethUSD

      // console.table({ userId, hash, priceETH })

      const accessGranted = await gatekeeper.callStatic.grantAccess(hash, { value: priceETH * 1e18 });
      expect(accessGranted).to.equal(true);

      expect(await gatekeeper.grantAccess(hash, { value: priceETH * 1e18 })).not.to.be.reverted;

      const oneYearFromNow = new Date().getTime() / 1000 + 364 * 24 * 60 * 60;

      expect((await gatekeeper.access(hash)).toNumber()).to.be.above(oneYearFromNow);
    })
  })


});
