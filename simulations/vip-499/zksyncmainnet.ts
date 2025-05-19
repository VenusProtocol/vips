import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { CHAINLINK_ORACLE_ORACLE_ZKSYNC, RESILIENT_ORACLE_ZKSYNC } from "../../vips/vip-499/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

forking(151083977, async () => {
  const provider = ethers.provider;

  await impersonateAccount(zksyncmainnet.NORMAL_TIMELOCK);
  await setBalance(zksyncmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_ZKSYNC, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4")).to.equal(
        parseUnits("1.00001", 30),
      );
    });

    it("check USDC.e price", async () => {
      expect(await resilientOracle.getPrice("0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4")).to.equal(
        parseUnits("1.00001", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0x499257fD37EDB34451f62EDf8D2a0C418852bA4C")).to.equal(
        parseUnits("0.99980003", 30),
      );
    });

    it("check WBTC price", async () => {
      expect(await resilientOracle.getPrice("0xBBeB516fb02a01611cBBE0453Fe3c580D7281011")).to.equal(
        parseUnits("102953.39604417", 28),
      );
    });

    it("check WETH price", async () => {
      expect(await resilientOracle.getPrice("0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91")).to.equal(
        parseUnits("2349.721224", 18),
      );
    });

    it("check wstETH price", async () => {
      expect(await resilientOracle.getPrice("0x703b52F2b28fEbcB60E1372858AF5b18849FE867")).to.equal(
        parseUnits("2824.373206537034846170", 18),
      );
    });

    it("check wUSDM price", async () => {
      expect(await resilientOracle.getPrice("0xA900cbE7739c96D2B153a273953620A701d5442b")).to.equal(
        parseUnits("1.077968786387565675", 18),
      );
    });

    it("check ZK price", async () => {
      expect(await resilientOracle.getPrice("0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E")).to.equal(
        parseUnits("0.06927599", 18),
      );
    });

    it("check ZKETH price", async () => {
      expect(await resilientOracle.getPrice("0xb72207E1FB50f341415999732A20B6D25d8127aa")).to.equal(
        parseUnits("2377.483532024740812381", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491());

  describe("Post-VIP behaviour", async () => {
    it("check USDC price", async () => {
      const token = new ethers.Contract("0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("1.00001", 30));
    });

    it("check USDC.e price", async () => {
      const token = new ethers.Contract("0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("1.00001", 30));
    });

    it("check USDT price", async () => {
      const token = new ethers.Contract("0x499257fD37EDB34451f62EDf8D2a0C418852bA4C", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("0.99980003", 30));
    });

    it("check WBTC price", async () => {
      const token = new ethers.Contract("0xBBeB516fb02a01611cBBE0453Fe3c580D7281011", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("102953.39604417", 28));
    });

    it("check WETH price", async () => {
      const token = new ethers.Contract("0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("2349.721224", 18));
    });

    it("check wstETH price", async () => {
      const token = new ethers.Contract("0x703b52F2b28fEbcB60E1372858AF5b18849FE867", ERC20_ABI, provider);
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE_ORACLE_ZKSYNC,
        token.address,
        "0x24a0C9404101A8d7497676BE12F10aEa356bAC28",
        zksyncmainnet.NORMAL_TIMELOCK,
      );
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("2824.373206537034846170", 18));
    });

    it("check wUSDM price", async () => {
      const token = new ethers.Contract("0x7715c206A14Ac93Cb1A6c0316A6E5f8aD7c9Dc31", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice("0xA900cbE7739c96D2B153a273953620A701d5442b")).to.equal(
        parseUnits("1.077968786387565675", 18),
      );
    });

    it("check ZK price", async () => {
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE_ORACLE_ZKSYNC,
        "0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E",
        "0xD1ce60dc8AE060DDD17cA8716C96f193bC88DD13",
        zksyncmainnet.NORMAL_TIMELOCK,
      );
      expect(await resilientOracle.getPrice("0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E")).to.equal(
        parseUnits("0.06935213", 18),
      );
    });

    it("check ZKETH price", async () => {
      expect(await resilientOracle.getPrice("0xb72207E1FB50f341415999732A20B6D25d8127aa")).to.equal(
        parseUnits("2377.483532024740812381", 18),
      );
    });
  });
});
