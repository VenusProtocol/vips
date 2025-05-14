import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { RESILIENT_ORACLE_UNICHAIN_SEPOLIA } from "../../vips/vip-492/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import PROXY_ABI from "./abi/Proxy.json";
import { expectEvents } from "src/utils";
import ACM_ABI from "./abi/ACM.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

forking(19591682, async () => {
  const provider = ethers.provider;

  await impersonateAccount(unichainsepolia.NORMAL_TIMELOCK);
  await setBalance(unichainsepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_UNICHAIN_SEPOLIA, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check cbBTC price", async () => {
      expect(await resilientOracle.getPrice("0x2979ef1676bb28192ac304173C717D7322b3b586")).to.equal(
        parseUnits("65000", 28),
      );
    });

    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0xf16d4774893eB578130a645d5c69E9c4d183F3A5")).to.equal(
        parseUnits("0.99995", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0x7bc1b67fde923fd3667Fde59684c6c354C8EbFdA")).to.equal(
        parseUnits("1", 30),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("1807.1", 18),
      );
    });

    it("check UNI price", async () => {
      expect(await resilientOracle.getPrice("0x873A6C4B1e3D883920541a0C61Dc4dcb772140b3")).to.equal(
        parseUnits("10", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [3]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check cbBTC price", async () => {
      expect(await resilientOracle.getPrice("0x2979ef1676bb28192ac304173C717D7322b3b586")).to.equal(
        parseUnits("65000", 28),
      );
    });

    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0xf16d4774893eB578130a645d5c69E9c4d183F3A5")).to.equal(
        parseUnits("0.99995", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0x7bc1b67fde923fd3667Fde59684c6c354C8EbFdA")).to.equal(
        parseUnits("1", 30),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("1807.1", 18),
      );
    });

    it("check UNI price", async () => {
      expect(await resilientOracle.getPrice("0x873A6C4B1e3D883920541a0C61Dc4dcb772140b3")).to.equal(
        parseUnits("10", 18),
      );
    });
  });
});
