import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { RESILIENT_ORACLE_BASE_SEPOLIA } from "../../vips/vip-492/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import PROXY_ABI from "./abi/Proxy.json";
import { expectEvents } from "src/utils";
import ACM_ABI from "./abi/ACM.json";

const { basesepolia } = NETWORK_ADDRESSES;

forking(25337385, async () => {
  const provider = ethers.provider;

  await impersonateAccount(basesepolia.NORMAL_TIMELOCK);
  await setBalance(basesepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_BASE_SEPOLIA, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0xFa264c13d657180e65245a9C3ac8d08b9F5Fc54D")).to.equal(
        parseUnits("0.9999794", 30),
      );
    });

    it("check cbBTC price", async () => {
      expect(await resilientOracle.getPrice("0x0948001047A07e38F685f9a11ea1ddB16B234af9")).to.equal(
        parseUnits("94238.40963306", 28),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("1806.453953", 18),
      );
    });

    it("check wsuperOETHb price", async () => {
      expect(await resilientOracle.getPrice("0x02B1136d9E223333E0083aeAB76bC441f230a033")).to.equal(
        parseUnits("1806.453953", 18),
      );
    });

    it("check wstETH price", async () => {
      expect(await resilientOracle.getPrice("0xAd69AA3811fE0EE7dBd4e25C4bae40e6422c76C8")).to.equal(
        parseUnits("1987.0993483", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [4]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [2]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0xFa264c13d657180e65245a9C3ac8d08b9F5Fc54D")).to.equal(
        parseUnits("0.9999794", 30),
      );
    });

    it("check cbBTC price", async () => {
      expect(await resilientOracle.getPrice("0x0948001047A07e38F685f9a11ea1ddB16B234af9")).to.equal(
        parseUnits("94238.40963306", 28),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("1806.453953", 18),
      );
    });

    it("check wsuperOETHb price", async () => {
      expect(await resilientOracle.getPrice("0x02B1136d9E223333E0083aeAB76bC441f230a033")).to.equal(
        parseUnits("1806.453953", 18),
      );
    });

    it("check wstETH price", async () => {
      expect(await resilientOracle.getPrice("0xAd69AA3811fE0EE7dBd4e25C4bae40e6422c76C8")).to.equal(
        parseUnits("1987.0993483", 18),
      );
    });
  });
});
