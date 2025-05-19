import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { RESILIENT_ORACLE_ARBITRUM_SEPOLIA } from "../../vips/vip-499/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(151083977, async () => {
  const provider = ethers.provider;

  await impersonateAccount(arbitrumsepolia.NORMAL_TIMELOCK);
  await setBalance(arbitrumsepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_ARBITRUM_SEPOLIA, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check ARB price", async () => {
      expect(await resilientOracle.getPrice("0x4371bb358aB5cC192E481543417D2F67b8781731")).to.equal(
        parseUnits("0.382117", 18),
      );
    });

    it("check gmBTC price", async () => {
      expect(await resilientOracle.getPrice("0xbd3AAd064295dcA0f45fab4C6A5adFb0D23a19D2")).to.equal(
        parseUnits("2.32639502", 18),
      );
    });

    it("check gmETH price", async () => {
      expect(await resilientOracle.getPrice("0x0012875a7395a293Adfc9b5cDC2Cfa352C4cDcD3")).to.equal(
        parseUnits("1.75254694", 18),
      );
    });

    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0x86f096B1D970990091319835faF3Ee011708eAe8")).to.equal(
        parseUnits("1.00003147", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0xf3118a17863996B9F2A073c9A66Faaa664355cf8")).to.equal(
        parseUnits("0.99995", 30),
      );
    });

    it("check WBTC price", async () => {
      // set to 180 seconds but not yet updated from 1 hour
      const token = new ethers.Contract("0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("103594.52", 28));
    });

    it("check WETH price", async () => {
      // set to 180 seconds but not yet updated from 1 hour
      const token = new ethers.Contract("0x980B62Da83eFf3D4576C647993b0c1D7faf17c73", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("2382.70878478", 18));
    });

    it("check weETH price", async () => {
      expect(await resilientOracle.getPrice("0x243141DBff86BbB0a082d790fdC21A6ff615Fa34")).to.equal(
        parseUnits("2620.979663258", 18),
      );
    });

    it("check wstETH price", async () => {
      expect(await resilientOracle.getPrice("0x4A9dc15aA6094eF2c7eb9d9390Ac1d71f9406fAE")).to.equal(
        parseUnits("2620.979663258", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491());

  describe("Post-VIP behaviour", async () => {
    it("check ARB price", async () => {
      expect(await resilientOracle.getPrice("0x4371bb358aB5cC192E481543417D2F67b8781731")).to.equal(
        parseUnits("0.382117", 18),
      );
    });

    it("check gmBTC price", async () => {
      expect(await resilientOracle.getPrice("0xbd3AAd064295dcA0f45fab4C6A5adFb0D23a19D2")).to.equal(
        parseUnits("2.32639502", 18),
      );
    });

    it("check gmETH price", async () => {
      expect(await resilientOracle.getPrice("0x0012875a7395a293Adfc9b5cDC2Cfa352C4cDcD3")).to.equal(
        parseUnits("1.75254694", 18),
      );
    });

    it("check USDC price", async () => {
      expect(await resilientOracle.getPrice("0x86f096B1D970990091319835faF3Ee011708eAe8")).to.equal(
        parseUnits("1.00003147", 30),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0xf3118a17863996B9F2A073c9A66Faaa664355cf8")).to.equal(
        parseUnits("0.99995", 30),
      );
    });

    it("check WBTC price", async () => {
      // set to 180 seconds but not yet updated from 1 hour
      const token = new ethers.Contract("0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("103594.52", 28));
    });

    it("check WETH price", async () => {
      // set to 180 seconds but not yet updated from 1 hour
      const token = new ethers.Contract("0x980B62Da83eFf3D4576C647993b0c1D7faf17c73", ERC20_ABI, provider);
      await setMaxStalePeriod(resilientOracle, token);
      expect(await resilientOracle.getPrice(token.address)).to.equal(parseUnits("2382.70878478", 18));
    });

    it("check weETH price", async () => {
      expect(await resilientOracle.getPrice("0x243141DBff86BbB0a082d790fdC21A6ff615Fa34")).to.equal(
        parseUnits("2620.979663258", 18),
      );
    });

    it("check wstETH price", async () => {
      expect(await resilientOracle.getPrice("0x4A9dc15aA6094eF2c7eb9d9390Ac1d71f9406fAE")).to.equal(
        parseUnits("2620.979663258", 18),
      );
    });
  });
});
