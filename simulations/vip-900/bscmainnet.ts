import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip900, {
  BSC_SPEED,
  BSC_XVS_AMOUNT,
  BSC_XVS_STORE,
  BSC_XVS_VAULT_TREASURY,
  NEW_PRIME_SPEED_FOR_USDT,
  OTC_WALLET,
  PRIME_LIQUIDITY_PROVIDER,
  RISK_FUND_CONVERTER,
  THE,
  THE_AMOUNT_RISK_FUND_CONVERTER,
  THE_AMOUNT_TREASURY,
  THE_AMOUNT_USDT_PRIME_CONVERTER,
  THE_AMOUNT_XVS_VAULT_CONVERTER,
  USDT,
  USDT_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
} from "../../vips/vip-900/bscmainnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import ERC20_ABI from "./abi/erc20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const TOTAL_THE_WITHDRAWN = THE_AMOUNT_TREASURY.add(THE_AMOUNT_RISK_FUND_CONVERTER)
  .add(THE_AMOUNT_XVS_VAULT_CONVERTER)
  .add(THE_AMOUNT_USDT_PRIME_CONVERTER);

forking(90183539, async () => {
  let theToken: Contract;
  let xvs: Contract;
  let xvsVault: Contract;
  let primeLiquidityProvider: Contract;

  // Pre-VIP balances
  let treasuryTheBefore: BigNumber;
  let riskFundConverterTheBefore: BigNumber;
  let xvsVaultConverterTheBefore: BigNumber;
  let usdtPrimeConverterTheBefore: BigNumber;
  let otcWalletTheBefore: BigNumber;
  let xvsVaultTreasuryXvsBefore: BigNumber;
  let xvsStoreXvsBefore: BigNumber;

  before(async () => {
    theToken = await ethers.getContractAt(ERC20_ABI, THE);
    xvs = await ethers.getContractAt(XVS_ABI, bscmainnet.XVS);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, bscmainnet.XVS_VAULT_PROXY);
    primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);

    // Record THE balances
    treasuryTheBefore = await theToken.balanceOf(bscmainnet.VTREASURY);
    riskFundConverterTheBefore = await theToken.balanceOf(RISK_FUND_CONVERTER);
    xvsVaultConverterTheBefore = await theToken.balanceOf(XVS_VAULT_CONVERTER);
    usdtPrimeConverterTheBefore = await theToken.balanceOf(USDT_PRIME_CONVERTER);
    otcWalletTheBefore = await theToken.balanceOf(OTC_WALLET);

    // Record XVS balances
    xvsVaultTreasuryXvsBefore = await xvs.balanceOf(BSC_XVS_VAULT_TREASURY);
    xvsStoreXvsBefore = await xvs.balanceOf(BSC_XVS_STORE);
  });

  testVip("vip-900", await vip900());

  describe("Post-VIP behavior", async () => {
    // ════════════════════════════════════════════════════════
    // Part A: THE Token Withdrawals
    // ════════════════════════════════════════════════════════
    it("should withdraw THE from Treasury", async () => {
      const balance = await theToken.balanceOf(bscmainnet.VTREASURY);
      expect(balance).to.equal(treasuryTheBefore.sub(THE_AMOUNT_TREASURY));
      expect(balance).to.equal(0);
    });

    it("should sweep THE from RiskFundConverter", async () => {
      const balance = await theToken.balanceOf(RISK_FUND_CONVERTER);
      expect(balance).to.equal(riskFundConverterTheBefore.sub(THE_AMOUNT_RISK_FUND_CONVERTER));
      expect(balance).to.equal(0);
    });

    it("should sweep THE from XVSVaultConverter", async () => {
      const balance = await theToken.balanceOf(XVS_VAULT_CONVERTER);
      expect(balance).to.equal(xvsVaultConverterTheBefore.sub(THE_AMOUNT_XVS_VAULT_CONVERTER));
      expect(balance).to.equal(0);
    });

    it("should sweep THE from USDTPrimeConverter", async () => {
      const balance = await theToken.balanceOf(USDT_PRIME_CONVERTER);
      expect(balance).to.equal(usdtPrimeConverterTheBefore.sub(THE_AMOUNT_USDT_PRIME_CONVERTER));
      expect(balance).to.equal(0);
    });

    it("should send all THE to the OTC wallet", async () => {
      const balance = await theToken.balanceOf(OTC_WALLET);
      expect(balance).to.equal(otcWalletTheBefore.add(TOTAL_THE_WITHDRAWN));
    });

    // ════════════════════════════════════════════════════════
    // Part B: XVS Vault Reward Distribution
    // ════════════════════════════════════════════════════════
    it("should transfer XVS from Vault Treasury to XVS Store", async () => {
      const treasuryAfter = await xvs.balanceOf(BSC_XVS_VAULT_TREASURY);
      expect(treasuryAfter).to.equal(xvsVaultTreasuryXvsBefore.sub(BSC_XVS_AMOUNT));

      const storeAfter = await xvs.balanceOf(BSC_XVS_STORE);
      expect(storeAfter).to.equal(xvsStoreXvsBefore.add(BSC_XVS_AMOUNT));
    });

    it("should update XVS Vault reward speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS);
      expect(speed).to.equal(BSC_SPEED);
    });

    // ════════════════════════════════════════════════════════
    // Part C: Prime Reward Adjustment
    // ════════════════════════════════════════════════════════
    it("should update Prime USDT distribution speed", async () => {
      const speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      expect(speed).to.equal(NEW_PRIME_SPEED_FOR_USDT);
    });
  });
});
