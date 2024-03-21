import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip016 } from "../../../proposals/vip-016/vip-016-sepolia";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";

const PRIME_LIQUIDITY_PROVIDER = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
const PRIME = "0x27A8ca2aFa10B9Bc1E57FC4Ca610d9020Aab3739";
const USER = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

const ETH = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";
const BTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";

forking(5530357, () => {
  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;

    before(async () => {
      impersonateAccount(USER);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });


    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(ETH);
      expect(speed).to.deep.equal("24438657407407");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(BTC);
      expect(speed).to.deep.equal("126");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDC);
      expect(speed).to.deep.equal("36881");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      expect(speed).to.deep.equal("87191");
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(false);

      const primePaused = await prime.paused();
      expect(primePaused).to.be.equal(false);
    });
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;

    before(async () => {
      await pretendExecutingVip(vip016());

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
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
      expect(paused).to.be.equal(true);

      const primePaused = await prime.paused();
      expect(primePaused).to.be.equal(true);
    });
  });
});
