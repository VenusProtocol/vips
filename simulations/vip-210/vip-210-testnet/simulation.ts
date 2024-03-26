import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkCorePoolComptroller } from "../../../src/vip-framework/checks/checkCorePoolComptroller";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { vip296Testnet } from "../../../vips/vip-296/vip-296-testnet";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";

const PRIME = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";
const STAKED_USER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const PRIME_LIQUIDITY_PROVIDER = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";

const BTC = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";

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

forking(34920008, () => {
  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;

    before(async () => {
      await impersonateAccount(STAKED_USER);
      const signer = await ethers.getSigner(STAKED_USER);

      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME, signer);
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(true);

      const primePaused = await prime.paused();
      expect(primePaused).to.be.equal(true);
    });
  });

  testVip("VIP-296 Prime Program", vip296Testnet(), {});

  describe("Post-VIP behavior", async () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;
    let btc: Contract;

    before(async () => {
      await impersonateAccount(STAKED_USER);
      const signer = await ethers.getSigner(STAKED_USER);

      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME, signer);
      btc = await ethers.getContractAt(ERC20_ABI, BTC);

      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, vToken.assetAddress, vToken.feed, NORMAL_TIMELOCK);
      }
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(false);

      const primePaused = await prime.paused();
      expect(primePaused).to.be.equal(false);
    });

    it("rewards", async () => {
      // await prime.claim();
      await mine(1000);

      expect(await btc.balanceOf(STAKED_USER)).to.be.equal("99898393363273664551870");
      await prime["claimInterest(address)"](vBTC);
      expect(await btc.balanceOf(STAKED_USER)).to.be.equal("99898466257023664542220");
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
    });
  });
});
