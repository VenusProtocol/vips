import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";

import { forking, pretendExecutingVip } from "../../../src/vip-framework";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { vip011 } from "../../proposals/vip-011/vip-011-opbnbtestnet";
import ACM_ABI from "./abis/ACM.json";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import XVS_ABI from "./abis/XVS.json";
import XVS_VAULT_ABI from "./abis/XVSVault.json";
import { vip012 } from "../../proposals/vip-012/vip-012-opbnbtestnet";

const XVS_VAULT_PROXY = "0xB14A0e72C5C202139F78963C9e89252c1ad16f01";
const PRIME_LIQUIDITY_PROVIDER = "0xF68E8925d45fb6679aE8caF7f859C76BdD964325";
const PRIME = "0x7831156A181288ce76B5952624Df6C842F4Cc0c1";
const XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
const GUARDIAN = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";
const GENERIC_TEST_USER_ACCOUNT = "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc";
const XVS_ADMIN = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";
const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const BTCB = "0x7Af23F9eA698E9b953D2BD70671173AaD0347f19";
const ETH = "0x94680e003861D43C6c0cf18333972312B6956FF1";
const USDT = "0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855";

forking(22879768, () => {
  before(async () => {
    await pretendExecutingVip(vip011());
  });

  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(ETH);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(BTCB);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      expect(speed).to.deep.equal(0);
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(true);
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });

  describe("Post-VIP behavior", async () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;

    before(async () => {
      await pretendExecutingVip(vip012());

      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(ETH);
      expect(speed).to.deep.equal("24438657407407");

      // speed = await primeLiquidityProvider.tokenDistributionSpeeds(BTCB);
      // expect(speed).to.deep.equal("126");


      // speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      // expect(speed).to.deep.equal("87191");
    });

    // it("paused", async () => {
    //   const paused = await primeLiquidityProvider.paused();
    //   expect(paused).to.be.equal(false);

    //   const primePaused = await prime.paused();
    //   expect(primePaused).to.be.equal(false);
    // });

    // describe("generic tests", async () => {
    //   checkXVSVault();
    // });
  });
});
