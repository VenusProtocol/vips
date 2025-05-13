import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip494, { RESILIENT_ORACLE_SEPOLIA } from "../../vips/vip-494/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(8320080, async () => {
  const provider = ethers.provider;

  await impersonateAccount(sepolia.NORMAL_TIMELOCK);
  await setBalance(sepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_SEPOLIA, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check vBAL price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xD4B82B7B7CdedB029e0E58AC1B6a04F6616BEd40")).to.equal(
        parseUnits("2.5", 18),
      );
    });

    it("check vCRV price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x121E3be152F283319310D807ed847E8b98319C1e")).to.equal(
        parseUnits("0.5", 18),
      );
    });

    it("check vcrvUSD price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082")).to.equal(
        parseUnits("1", 18),
      );
    });

    it("check vDAI price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xfe050f628bF5278aCfA1e7B13b59fF207e769235")).to.equal(
        parseUnits("0.99989177", 18),
      );
    });

    it("check veBTC price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x8E6241389e823111259413810b81a050bd45e5cE")).to.equal(
        parseUnits("104224.19767974", 28),
      );
    });

    it("check vEIGEN price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x6DB4aDbA8F144a57a397b57183BF619e957040B1")).to.equal(
        parseUnits("3.5", 18),
      );
    });

    it("check vFRAX price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x33942B932159A67E3274f54bC4082cbA4A704340")).to.equal(
        parseUnits("1", 18),
      );
    });

    it("check vLBTC price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x315F064cF5B5968fE1655436e1856F3ca558d395")).to.equal(
        parseUnits("114646.617447714", 28),
      );
    });

    it("check vsFRAX price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x18995825f033F33fa30CF59c117aD21ff6BdB48c")).to.equal(
        parseUnits("1.041208475916013035", 18),
      );
    });

    it("check vsUSDS price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x083a24648614df4b72EFD4e4C81141C044dBB253")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check vTUSD price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xE23A1fC1545F1b072308c846a38447b23d322Ee2")).to.equal(
        parseUnits("1", 18),
      );
    });

    it("check vUSDC price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xF87bceab8DD37489015B426bA931e08A4D787616")).to.equal(
        parseUnits("0.99997749", 30),
      );
    });

    it("check vUSDS price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x459C6a6036e2094d1764a9ca32939b9820b2C8e0")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check vUSDT price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff")).to.equal(
        parseUnits("1", 30),
      );
    });

    it("check vWBTC price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x74E708A7F5486ed73CCCAe54B63e71B1988F1383")).to.equal(
        parseUnits("104224.19767974", 28),
      );
    });

    it("check vWETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9")).to.equal(
        parseUnits("2699.56", 18),
      );
    });

    it("check vweETHs price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x81aab41B868f8b5632E8eE6a98AdA7a7fDBc8823")).to.equal(
        parseUnits("2711.069361134754226902", 18),
      );
    });

    it("check vyvUSDC price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x4bC731477aF00ea83C5eCbAc31E1E9fF85eD8A1e")).to.equal(
        parseUnits("0.99997749", 30),
      );
    });

    it("check vyvUSDT price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x9Ec91759d4EBaDE3109cCAD1B7AE199a02312c10")).to.equal(
        parseUnits("1", 30),
      );
    });

    it("check vyvUSDS price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x5e2fB6a1e1570eB61360E87Da44979cb932090B0")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check vyvWETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x271D914014Ac2CD8EB89a4e106Ac15a4e948eEE2")).to.equal(
        parseUnits("2699.56", 18),
      );
    });

    it("check vPT-sUSDE price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x6c87587b1813eAf5571318E2139048b04eAaFf97")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check vPT-USDe price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xf2C00a9C3314f7997721253c49276c8531a30803")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check vsUSDe price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x643a2BE96e7675Ca34bcceCB33F4f0fECA1ba9fC")).to.equal(
        parseUnits("1", 18),
      );
    });

    it("check vezETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xF4C1B7528f8B266D8ADf1a85c91d93114FeDbA2A")).to.equal(
        parseUnits("2699.56", 18),
      );
    });

    it("check vPT-weETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1")).to.equal(
        parseUnits("2573.357749172767027411", 18),
      );
    });

    it("check vpufETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x1E4d64B7c6f1F71969E5137B5Ee8cBa9Ab9c9356")).to.equal(
        parseUnits("2699.56", 18),
      );
    });

    it("check vrsETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x20a83DE526F2CF2fCec2131E07b11F956d8f3Cdf")).to.equal(
        parseUnits("2699.56", 18),
      );
    });

    it("check vsfrxETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x83F63118dcAAdAACBFF36D78ffB88dd474309e70")).to.equal(
        parseUnits("3992.143011504793762803", 18),
      );
    });

    it("check vweETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b")).to.equal(
        parseUnits("2795.118267568763126583", 18),
      );
    });

    it("check vwstETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x0a95088403229331FeF1EB26a11F9d6C8E73f23D")).to.equal(
        parseUnits("2699.56", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip494", await vip494());

  describe("Post-VIP behaviour", async () => {
    it("check vBAL price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xD4B82B7B7CdedB029e0E58AC1B6a04F6616BEd40")).to.equal(
        parseUnits("2.5", 18),
      );
    });

    it("check vCRV price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x121E3be152F283319310D807ed847E8b98319C1e")).to.equal(
        parseUnits("0.5", 18),
      );
    });

    it("check vcrvUSD price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082")).to.equal(
        parseUnits("1", 18),
      );
    });

    it("check vDAI price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xfe050f628bF5278aCfA1e7B13b59fF207e769235")).to.equal(
        parseUnits("0.99989177", 18),
      );
    });

    it("check veBTC price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x8E6241389e823111259413810b81a050bd45e5cE")).to.equal(
        parseUnits("104224.19767974", 28),
      );
    });

    it("check vEIGEN price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x6DB4aDbA8F144a57a397b57183BF619e957040B1")).to.equal(
        parseUnits("3.5", 18),
      );
    });

    it("check vFRAX price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x33942B932159A67E3274f54bC4082cbA4A704340")).to.equal(
        parseUnits("1", 18),
      );
    });

    it("check vLBTC price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x315F064cF5B5968fE1655436e1856F3ca558d395")).to.equal(
        parseUnits("114646.617447714", 28),
      );
    });

    it("check vsFRAX price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x18995825f033F33fa30CF59c117aD21ff6BdB48c")).to.equal(
        parseUnits("1.041208475916013035", 18),
      );
    });

    it("check vsUSDS price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x083a24648614df4b72EFD4e4C81141C044dBB253")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check vTUSD price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xE23A1fC1545F1b072308c846a38447b23d322Ee2")).to.equal(
        parseUnits("1", 18),
      );
    });

    it("check vUSDC price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xF87bceab8DD37489015B426bA931e08A4D787616")).to.equal(
        parseUnits("0.99997749", 30),
      );
    });

    it("check vUSDS price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x459C6a6036e2094d1764a9ca32939b9820b2C8e0")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check vUSDT price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff")).to.equal(
        parseUnits("1", 30),
      );
    });

    it("check vWBTC price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x74E708A7F5486ed73CCCAe54B63e71B1988F1383")).to.equal(
        parseUnits("104224.19767974", 28),
      );
    });

    it("check vWETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9")).to.equal(
        parseUnits("2699.56", 18),
      );
    });

    it("check vweETHs price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x81aab41B868f8b5632E8eE6a98AdA7a7fDBc8823")).to.equal(
        parseUnits("2711.069361134754226902", 18),
      );
    });

    it("check vyvUSDC price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x4bC731477aF00ea83C5eCbAc31E1E9fF85eD8A1e")).to.equal(
        parseUnits("0.99997749", 30),
      );
    });

    it("check vyvUSDT price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x9Ec91759d4EBaDE3109cCAD1B7AE199a02312c10")).to.equal(
        parseUnits("1", 30),
      );
    });

    it("check vyvUSDS price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x5e2fB6a1e1570eB61360E87Da44979cb932090B0")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check vyvWETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x271D914014Ac2CD8EB89a4e106Ac15a4e948eEE2")).to.equal(
        parseUnits("2699.56", 18),
      );
    });

    it("check vPT-sUSDE price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x6c87587b1813eAf5571318E2139048b04eAaFf97")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check vPT-USDe price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xf2C00a9C3314f7997721253c49276c8531a30803")).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check vsUSDe price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x643a2BE96e7675Ca34bcceCB33F4f0fECA1ba9fC")).to.equal(
        parseUnits("1", 18),
      );
    });

    it("check vezETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0xF4C1B7528f8B266D8ADf1a85c91d93114FeDbA2A")).to.equal(
        parseUnits("2699.56", 18),
      );
    });

    it("check vPT-weETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1")).to.equal(
        parseUnits("2573.357749172767027411", 18),
      );
    });

    it("check vpufETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x1E4d64B7c6f1F71969E5137B5Ee8cBa9Ab9c9356")).to.equal(
        parseUnits("2699.56", 18),
      );
    });

    it("check vrsETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x20a83DE526F2CF2fCec2131E07b11F956d8f3Cdf")).to.equal(
        parseUnits("2699.56", 18),
      );
    });

    it("check vsfrxETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x83F63118dcAAdAACBFF36D78ffB88dd474309e70")).to.equal(
        parseUnits("3992.143011504793762803", 18),
      );
    });

    it("check vweETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b")).to.equal(
        parseUnits("2795.118267568763126583", 18),
      );
    });

    it("check vwstETH price", async () => {
      expect(await resilientOracle.getUnderlyingPrice("0x0a95088403229331FeF1EB26a11F9d6C8E73f23D")).to.equal(
        parseUnits("2699.56", 18),
      );
    });
  });
});
