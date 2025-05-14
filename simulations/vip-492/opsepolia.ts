import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { RESILIENT_ORACLE_OP_SEPOLIA } from "../../vips/vip-492/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import PROXY_ABI from "./abi/Proxy.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { opsepolia } = NETWORK_ADDRESSES;

forking(27320568, async () => {
  const provider = ethers.provider;

  await impersonateAccount(opsepolia.NORMAL_TIMELOCK);
  await setBalance(opsepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_OP_SEPOLIA, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check OP price", async () => {
      expect(await resilientOracle.getPrice("0xEC5f6eB84677F562FC568B89121C5E5C19639776")).to.equal(
        parseUnits("0.66232726", 18),
      );
    });

    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0x71B49d40B10Aa76cc44954e821eB6eA038Cf196F")).to.equal(
        parseUnits("0.99994769", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0x9AD0542c71c09B764cf58d38918892F3Ae7ecc63")).to.equal(
        parseUnits("1.00008574", 30),
      );
    });

    it("check WBTC price", async () => {
      expect(await resilientOracle.getPrice("0x9f5039a86AF12AB10Ff16659eA0885bb4C04d013")).to.equal(
        parseUnits("94257.58248531", 28),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("1807.22525643", 18),
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
    it("check OP price", async () => {
      expect(await resilientOracle.getPrice("0xEC5f6eB84677F562FC568B89121C5E5C19639776")).to.equal(
        parseUnits("0.66232726", 18),
      );
    });

    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0x71B49d40B10Aa76cc44954e821eB6eA038Cf196F")).to.equal(
        parseUnits("0.99994769", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0x9AD0542c71c09B764cf58d38918892F3Ae7ecc63")).to.equal(
        parseUnits("1.00008574", 30),
      );
    });

    it("check WBTC price", async () => {
      expect(await resilientOracle.getPrice("0x9f5039a86AF12AB10Ff16659eA0885bb4C04d013")).to.equal(
        parseUnits("94257.58248531", 28),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("1807.22525643", 18),
      );
    });
  });
});
