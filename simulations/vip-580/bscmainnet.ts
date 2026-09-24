import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip580, {
  BSC_SPEED,
  BSC_XVS_AMOUNT,
  BSC_XVS_STORE,
  BSC_XVS_VAULT_TREASURY,
  NEW_PRIME_SPEED_FOR_USDC_USDT,
  PRIME_LIQUIDITY_PROVIDER,
  USDC,
  USDT,
  ZKSYNC_XVS_BRIDGE_AMOUNT,
} from "../../vips/vip-580/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import ERC20_ABI from "./abi/erc20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(74468791, async () => {
  let xvs: Contract;
  let comptrollerPreviousXVSBalance: any;
  let xvsVaultTreasuryPreviousXVSBalance: any;
  let xvsStorePreviousXVSBalance: any;
  let xvsVault: Contract;
  let primeLiquidityProvider: Contract;
  let usdc: Contract;
  let usdt: Contract;
  let usdtPreviousBalance: any;
  let usdcPreviousBalance: any;
  let normalTimelockUsdcPreviousBalance: any;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, bscmainnet.XVS);
    comptrollerPreviousXVSBalance = await xvs.balanceOf(bscmainnet.UNITROLLER);
    xvsVaultTreasuryPreviousXVSBalance = await xvs.balanceOf(BSC_XVS_VAULT_TREASURY);
    xvsStorePreviousXVSBalance = await xvs.balanceOf(BSC_XVS_STORE);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, bscmainnet.XVS_VAULT_PROXY);
    primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    usdtPreviousBalance = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    usdcPreviousBalance = await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    normalTimelockUsdcPreviousBalance = await usdc.balanceOf(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
  });

  testVip("vip-580", await vip580(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should update Prime rewards distribution speed for USDC and USDT", async () => {
      const usdcSpeed = await primeLiquidityProvider.tokenDistributionSpeeds(USDC);
      const usdtSpeed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      expect(usdcSpeed).to.equal(NEW_PRIME_SPEED_FOR_USDC_USDT);
      expect(usdtSpeed).to.equal(NEW_PRIME_SPEED_FOR_USDC_USDT);
    });

    it("check sweep and token conversion status", async () => {
      // PLP USDT decreased by 15000
      const usdtBalance = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      const usdtDecreaseBalance = usdtPreviousBalance.sub(usdtBalance);
      expect(usdtDecreaseBalance).to.eq(parseUnits("15000", 18));

      // PLP USDC increased by 14925
      const usdcBalance = await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      const usdcIncreasedBalance = usdcBalance.sub(usdcPreviousBalance);
      expect(usdcIncreasedBalance).to.eq(parseUnits("14925", 18));

      // Normal timelock USDC balance remains the same
      const normalTimelockUsdcBalance = await usdc.balanceOf(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
      expect(normalTimelockUsdcPreviousBalance).to.be.closeTo(normalTimelockUsdcBalance, parseUnits("100", 18)); // +-10
    });

    it("should transfer XVS from the Comptroller", async () => {
      const comptrollerXVSBalanceAfter = await xvs.balanceOf(bscmainnet.UNITROLLER);
      expect(comptrollerXVSBalanceAfter).to.equal(comptrollerPreviousXVSBalance.sub(ZKSYNC_XVS_BRIDGE_AMOUNT));
    });

    it("should transfer XVS from the XVS Vault Treasury to the XVS Store", async () => {
      const xvsVaultTreasuryXVSBalanceAfter = await xvs.balanceOf(BSC_XVS_VAULT_TREASURY);
      expect(xvsVaultTreasuryXVSBalanceAfter).to.equal(xvsVaultTreasuryPreviousXVSBalance.sub(BSC_XVS_AMOUNT));

      const xvsStoreXVSBalanceAfter = await xvs.balanceOf(BSC_XVS_STORE);
      expect(xvsStoreXVSBalanceAfter).to.equal(xvsStorePreviousXVSBalance.add(BSC_XVS_AMOUNT));
    });

    it("should update the XVS distribution speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS);
      expect(speed).to.equal(BSC_SPEED);
    });
  });
});
