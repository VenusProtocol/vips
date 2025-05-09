import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { CHAINLINK_ORACLE_ORACLE_ARBITRUM, RESILIENT_ORACLE_ARBITRUM } from "../../vips/vip-493/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(334865555, async () => {
  const provider = ethers.provider;

  await impersonateAccount(arbitrumone.NORMAL_TIMELOCK);
  await setBalance(arbitrumone.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_ARBITRUM, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check ARB price", async () => {
      expect(await resilientOracle.getPrice("0x912ce59144191c1204e64559fe8253a0e49e6548")).to.equal(
        parseUnits("0.3793", 18),
      );
    });

    it("check gmBTC price", async () => {
      expect(await resilientOracle.getPrice("0x47c031236e19d024b42f8AE6780E44A573170703")).to.equal(
        parseUnits("2.42060495", 18),
      );
    });

    it("check gmETH price", async () => {
      expect(await resilientOracle.getPrice("0x70d95587d40A2caf56bd97485aB3Eec10Bee6336")).to.equal(
        parseUnits("1.52301356", 18),
      );
    });

    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0xaf88d065e77c8cc2239327c5edb3a432268e5831")).to.equal(
        parseUnits("0.99999999", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9")).to.equal(
        parseUnits("0.99985171", 30),
      );
    });

    it("check WBTC price", async () => {
      expect(await resilientOracle.getPrice("0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f")).to.equal(
        parseUnits("102913.05501665", 28),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x82af49447d8a07e3bd95bd0d56f35241523fbab1")).to.equal(
        parseUnits("2347.54792634", 18),
      );
    });

    it("check weETH price", async () => {
      expect(await resilientOracle.getPrice("0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe")).to.equal(
        parseUnits("2504.914757687730060166", 18),
      );
    });

    it("check wstETH price", async () => {
      expect(await resilientOracle.getPrice("0x5979D7b546E38E414F7E9822514be443A4800529")).to.equal(
        parseUnits("2821.760895077259039789", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491());

  describe("Post-VIP behaviour", async () => {
    it("check ARB price", async () => {
      const token = new ethers.Contract("0x912ce59144191c1204e64559fe8253a0e49e6548", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("0.3793", 18));
    });

    it("check gmBTC price", async () => {
      const token = new ethers.Contract("0x47c031236e19d024b42f8AE6780E44A573170703", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("2.42060495", 18));
    });

    it("check gmETH price", async () => {
      const token = new ethers.Contract("0x70d95587d40A2caf56bd97485aB3Eec10Bee6336", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("1.52301356", 18));
    });

    it("check USDC price", async () => {
      const token = new ethers.Contract("0xaf88d065e77c8cc2239327c5edb3a432268e5831", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("0.99999999", 30));
    });

    it("check USDT price", async () => {
      const token = new ethers.Contract("0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("0.99985171", 30));
    });

    it("check WBTC price", async () => {
      const token = new ethers.Contract("0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("102913.05501665", 28));
    });

    it("check WETH price", async () => {
      const token = new ethers.Contract("0x82af49447d8a07e3bd95bd0d56f35241523fbab1", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("2347.54792634", 18));
    });

    it("check weETH price", async () => {
      const token = new ethers.Contract("0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe", ERC20_ABI, provider);
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE_ORACLE_ARBITRUM,
        token.address,
        "0x20bAe7e1De9c596f5F7615aeaa1342Ba99294e12",
        arbitrumone.NORMAL_TIMELOCK,
      );
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("2504.914757687730060166", 18));
    });

    it("check wstETH price", async () => {
      const token = new ethers.Contract("0x5979D7b546E38E414F7E9822514be443A4800529", ERC20_ABI, provider);
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE_ORACLE_ARBITRUM,
        token.address,
        "0xB1552C5e96B312d0Bf8b554186F846C40614a540",
        arbitrumone.NORMAL_TIMELOCK,
      );
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("2821.760895077259039789", 18));
    });
  });
});
