import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setRedstonePrice } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { REDSTONE_ORACLE_UNICHAIN, RESILIENT_ORACLE_UNICHAIN } from "../../vips/vip-492/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { unichainmainnet } = NETWORK_ADDRESSES;
const ONE_YEAR = 31536000;

forking(15854623, async () => {
  const provider = ethers.provider;

  await impersonateAccount(unichainmainnet.NORMAL_TIMELOCK);
  await setBalance(unichainmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const signer = await ethers.getSigner(unichainmainnet.NORMAL_TIMELOCK);

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_UNICHAIN, RESILIENT_ORACLE_ABI, provider);
  const redstoneOracle = new ethers.Contract(REDSTONE_ORACLE_UNICHAIN, REDSTONE_ORACLE_ABI, signer);

  describe("Pre-VIP behaviour", async () => {
    it("check USDC price", async () => {
      const token = new ethers.Contract("0x078D782b760474a361dDA0AF3839290b0EF57AD6", ERC20_ABI, provider);
      const data = await redstoneOracle.tokenConfigs(token.address);
      await setRedstonePrice(
        REDSTONE_ORACLE_UNICHAIN,
        "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
        data.feed,
        unichainmainnet.NORMAL_TIMELOCK,
        ONE_YEAR,
        {
          tokenDecimals: 6,
        },
      );
      expect(await resilientOracle.getPrice("0x078D782b760474a361dDA0AF3839290b0EF57AD6")).to.equal(
        parseUnits("1.00004999", 30),
      );
    });

    it("check WETH price", async () => {
      const token = new ethers.Contract("0x4200000000000000000000000000000000000006", ERC20_ABI, provider);
      const data = await redstoneOracle.tokenConfigs(token.address);
      await setRedstonePrice(
        REDSTONE_ORACLE_UNICHAIN,
        "0x4200000000000000000000000000000000000006",
        data.feed,
        unichainmainnet.NORMAL_TIMELOCK,
      );
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("1829.21017888", 18),
      );
    });

    it("check UNI price", async () => {
      const token = new ethers.Contract("0x8f187aA05619a017077f5308904739877ce9eA21", ERC20_ABI, provider);
      const data = await redstoneOracle.tokenConfigs(token.address);
      await setRedstonePrice(
        REDSTONE_ORACLE_UNICHAIN,
        "0x8f187aA05619a017077f5308904739877ce9eA21",
        data.feed,
        unichainmainnet.NORMAL_TIMELOCK,
      );
      expect(await resilientOracle.getPrice("0x8f187aA05619a017077f5308904739877ce9eA21")).to.equal(
        parseUnits("4.902", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491());

  describe("Post-VIP behaviour", async () => {
    it("check USDC price", async () => {
      const token = new ethers.Contract("0x078D782b760474a361dDA0AF3839290b0EF57AD6", ERC20_ABI, provider);
      expect(await redstoneOracle.getPrice(token.address)).to.equal(parseUnits("1.00004999", 30));
    });

    it("check WETH price", async () => {
      const token = new ethers.Contract("0x4200000000000000000000000000000000000006", ERC20_ABI, provider);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("1829.21017888", 18));
    });

    it("check UNI price", async () => {
      const token = new ethers.Contract("0x8f187aA05619a017077f5308904739877ce9eA21", ERC20_ABI, provider);
      expect(await redstoneOracle.getPrice(token.address)).to.equal(parseUnits("4.902", 18));
    });
  });
});
