import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { RESILIENT_ORACLE_OP } from "../../vips/vip-492/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import ERC20_ABI from "./abi/ERC20.json";
import PROXY_ABI from "./abi/Proxy.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { opmainnet } = NETWORK_ADDRESSES;

forking(135467436, async () => {
  const provider = ethers.provider;

  await impersonateAccount(opmainnet.NORMAL_TIMELOCK);
  await setBalance(opmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_OP, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check OP price", async () => {
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000042")).to.equal(
        parseUnits("0.6154", 18),
      );
    });

    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85")).to.equal(
        parseUnits("1.0000557", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0x94b008aA00579c1307B0EF2c499aD98a8ce58e58")).to.equal(
        parseUnits("0.999816", 30),
      );
    });

    it("check WBTC price", async () => {
      expect(await resilientOracle.getPrice("0x68f180fcCe6836688e9084f035309E29Bf0A2095")).to.equal(
        parseUnits("93782.188", 28),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("1771.37077164", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [4]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check OP price", async () => {
      const token = new ethers.Contract("0x4200000000000000000000000000000000000042", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("0.6154", 18));
    });

    it("check USDC price", async () => {
      const token = new ethers.Contract("0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("1.0000557", 30));
    });

    it("check USDT price", async () => {
      const token = new ethers.Contract("0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("0.999816", 30));
    });

    it("check WBTC price", async () => {
      const token = new ethers.Contract("0x68f180fcCe6836688e9084f035309E29Bf0A2095", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("93782.188", 28));
    });

    it("check WETH price", async () => {
      const token = new ethers.Contract("0x4200000000000000000000000000000000000006", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("1771.37077164", 18));
    });
  });
});
