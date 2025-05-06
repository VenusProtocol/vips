import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { CHAINLINK_ORACLE_ORACLE_BASE, REDSTONE_ORACLE_ORACLE_BASE, RESILIENT_ORACLE_BASE, wSuperOETHb_ORACLE, wstETHOracle } from "../../vips/vip-492/bscmainnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import { setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";

const { basemainnet } = NETWORK_ADDRESSES;

forking(29870085, async () => {
  const provider = ethers.provider;

  await impersonateAccount(basemainnet.NORMAL_TIMELOCK);
  await setBalance(basemainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const signer = await ethers.getSigner(basemainnet.NORMAL_TIMELOCK);

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_BASE, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")).to.equal(
        parseUnits("1.00002", 30),
      );
    });

    it("check cbBTC price", async () => {
      expect(await resilientOracle.getPrice("0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf")).to.equal(
        parseUnits("93989.71529793", 28),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("1786.86721796", 18),
      );
    });

    it("check wsuperOETHb price", async () => {
      expect(await resilientOracle.getPrice("0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6")).to.equal(
        parseUnits("1891.922198331724989323", 18),
      );
    });

    it("check wstETH price", async () => {
      expect(await resilientOracle.getPrice("0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452")).to.equal(
        parseUnits("2147.343457226248364033", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491());

  describe("Post-VIP behaviour", async () => {
    it("check USDC price", async () => {
      const token = new ethers.Contract("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token)
      expect(await resilientOracle.getPrice(token.address)).to.equal(
        parseUnits("1.00002", 30),
      );
    });

    it("check cbBTC price", async () => {
      const token = new ethers.Contract("0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token)
      expect(await resilientOracle.getPrice(token.address)).to.equal(
        parseUnits("93989.71529793", 28),
      );
    });

    it("check WETH price", async () => {
      const token = new ethers.Contract("0x4200000000000000000000000000000000000006", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token)
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("1786.86721796", 18),
      );
    });

    it("check wsuperOETHb price", async () => {
      await resilientOracle.getPrice("0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6");
    });

    it("check wstETH price", async () => {
      const token = new ethers.Contract("0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452", ERC20_ABI, provider);
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE_ORACLE_BASE, token.address, "0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061", basemainnet.NORMAL_TIMELOCK)
      expect(await resilientOracle.getPrice(token.address)).to.equal(
        parseUnits("2147.343457226248364033", 18),
      );
    });
  });
});
