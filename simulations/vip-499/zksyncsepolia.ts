import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { RESILIENT_ORACLE_ZKSYNC_SEPOLIA } from "../../vips/vip-499/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

forking(151083977, async () => {
  const provider = ethers.provider;

  await impersonateAccount(zksyncsepolia.NORMAL_TIMELOCK);
  await setBalance(zksyncsepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_ZKSYNC_SEPOLIA, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0x512F8b4a3c466a30e8c9BAC9c64638dd710968c2")).to.equal(
        parseUnits("1.00007109", 30),
      );
    });

    it("check USDC.e price", async () => {
      expect(await resilientOracle.getPrice("0xF98780C8a0843829f98e624d83C3FfDDf43BE984")).to.equal(
        parseUnits("1.00007109", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0x9Bf62C9C6AaB7AB8e01271f0d7A401306579709B")).to.equal(
        parseUnits("1.00011", 30),
      );
    });

    it("check WBTC price", async () => {
      expect(await resilientOracle.getPrice("0xeF891B3FA37FfD83Ce8cC7b682E4CADBD8fFc6F0")).to.equal(
        parseUnits("102900.2031", 28),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x53F7e72C7ac55b44c7cd73cC13D4EF4b121678e6")).to.equal(
        parseUnits("2340.22575314", 18),
      );
    });

    it("check wstETH price", async () => {
      expect(await resilientOracle.getPrice("0x8507bb4F4f0915D05432011E384850B65a7FCcD1")).to.equal(
        parseUnits("2574.248328454", 18),
      );
    });

    it("check wUSDM price", async () => {
      expect(await resilientOracle.getPrice("0x0b3C8fB109f144f6296bF4Ac52F191181bEa003a")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check ZK price", async () => {
      expect(await resilientOracle.getPrice("0x8A2E9048F5d658E88D6eD89DdD1F3B5cA0250B9F")).to.equal(
        parseUnits("0.2", 18),
      );
    });

    it("check ZKETH price", async () => {
      expect(await resilientOracle.getPrice("0x13231E8B60BE0900fB3a3E9dc52C2b39FA4794df")).to.equal(
        parseUnits("2351.9268819057", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491());

  describe("Post-VIP behaviour", async () => {
    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0x512F8b4a3c466a30e8c9BAC9c64638dd710968c2")).to.equal(
        parseUnits("1.00007109", 30),
      );
    });

    it("check USDC.e price", async () => {
      expect(await resilientOracle.getPrice("0xF98780C8a0843829f98e624d83C3FfDDf43BE984")).to.equal(
        parseUnits("1.00007109", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0x9Bf62C9C6AaB7AB8e01271f0d7A401306579709B")).to.equal(
        parseUnits("1.00011", 30),
      );
    });

    it("check WBTC price", async () => {
      expect(await resilientOracle.getPrice("0xeF891B3FA37FfD83Ce8cC7b682E4CADBD8fFc6F0")).to.equal(
        parseUnits("102900.2031", 28),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x53F7e72C7ac55b44c7cd73cC13D4EF4b121678e6")).to.equal(
        parseUnits("2340.22575314", 18),
      );
    });

    it("check wstETH price", async () => {
      expect(await resilientOracle.getPrice("0x8507bb4F4f0915D05432011E384850B65a7FCcD1")).to.equal(
        parseUnits("2574.248328454", 18),
      );
    });

    it("check wUSDM price", async () => {
      expect(await resilientOracle.getPrice("0x0b3C8fB109f144f6296bF4Ac52F191181bEa003a")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check ZK price", async () => {
      expect(await resilientOracle.getPrice("0x8A2E9048F5d658E88D6eD89DdD1F3B5cA0250B9F")).to.equal(
        parseUnits("0.2", 18),
      );
    });

    it("check ZKETH price", async () => {
      expect(await resilientOracle.getPrice("0x13231E8B60BE0900fB3a3E9dc52C2b39FA4794df")).to.equal(
        parseUnits("2351.9268819057", 18),
      );
    });
  });
});
