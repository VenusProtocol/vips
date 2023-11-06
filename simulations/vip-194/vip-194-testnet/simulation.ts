import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip194Testnet } from "../../../vips/vip-194/vip-194-testnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import { mine } from "@nomicfoundation/hardhat-network-helpers";

const PRIME_LIQUIDITY_PROVIDER = "0xce20cACeF98DC03b2e30cD63b7B56B018d171E9c";
const PRIME = "0xb13Ea8C39594449B2AB5555769580BDB23f5E2Cf";
const STAKED_USER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const BTC = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const vETH = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";

const vTokens: vTokenConfig[] = [
  {
    name: "vUSDC",
    assetAddress: "0x16227D60f7a0e586C66B005219dfc887D13C9531",
    feed: "0x90c069C4538adAc136E051052E14c1cD799C41B7",
    marketAddress: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
  },
  {
    name: "vUSDT",
    assetAddress: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
    feed: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
    marketAddress: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
  },
  {
    name: "vETH",
    assetAddress: "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7",
    feed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
    marketAddress: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
  },
  {
    name: "vBTC",
    assetAddress: "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4",
    feed: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C",
    marketAddress: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
  },
];

forking(34696892, () => {
  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(ETH);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(BTC);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDC);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      expect(speed).to.deep.equal(0);
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(false);
    });
  });

  testVip("VIP-194 Prime Program", vip194Testnet(), {});

  describe("Post-VIP behavior", async () => {
    let primeLiquidityProvider: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(ETH);
      expect(speed).to.deep.equal("24438657407407");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(BTC);
      expect(speed).to.deep.equal("1261574074074");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDC);
      expect(speed).to.deep.equal("36881637731481481");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      expect(speed).to.deep.equal("87191261574074074");
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(true);
    });

    it("rewards", async () => {
      await mine(1000)
      let rewards = await prime.callStatic.getInterestAccrued(vETH, STAKED_USER);
      expect(rewards).to.be.not.equal("0");
    });
  });
});
