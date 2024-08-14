import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumberish, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { vip174Testnet } from "../../../vips/vip-174/vip-174-testnet";
import Comptroller from "../abi/Comptroller.json";
import IERC20Upgradeable from "../abi/IERC20UpgradableAbi.json";
import VBEP20_DELEGATE_ABI from "../abi/VBep20DelegateAbi.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const DIAMOND = "0x7e0298880224B8116F3462c50917249E94b3DC53";

const Owner = "0xce10739590001705F7FF231611ba4A48B2820327";
const zeroAddr = ethers.constants.AddressZero;
const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
const VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

forking(33497000, async () => {
  let owner: Signer,
    unitroller: Contract,
    // layout variables
    oracle: Contract,
    maxAssets: BigNumberish,
    closeFactorMantissa: BigNumberish,
    liquidationIncentiveMantissa: BigNumberish,
    allMarkets: Array<object>,
    venusSupplyState: any,
    venusBorrowState: any,
    venusAccrued: BigNumberish,
    vaiMintRate: BigNumberish,
    vaiController: Contract,
    mintedVAIs: BigNumberish,
    mintVAIGuardianPaused: boolean,
    repayVAIGuardianPaused: boolean,
    protocolPaused: boolean,
    venusVAIVaultRate: BigNumberish,
    vaiVaultAddress: string,
    releaseStartBlock: BigNumberish,
    minReleaseAmount: BigNumberish,
    treasuryGuardian: boolean,
    treasuryAddress: string,
    treasuryPercent: BigNumberish,
    liquidatorContract: Contract,
    comptrollerLens: Contract;

  const borrowSpeeds: any = {};
  const supplySpeeds: any = {};
  const userBorrowIndexes: any = {};
  const userSupplyIndexes: any = {};
  const markets: any = {};

  let BUSD: Contract;
  let busdHolder: Signer;
  let vBUSD: Contract;
  let vUSDT: Contract;
  let diamondUnitroller: Contract;

  before(async () => {
    unitroller = new ethers.Contract(UNITROLLER, Comptroller, ethers.provider);

    diamondUnitroller = new ethers.Contract(unitroller.address, Comptroller, ethers.provider);

    await impersonateAccount(Owner);
    owner = await ethers.getSigner(Owner);
    const [signer] = await ethers.getSigners();
    await signer.sendTransaction({
      to: await owner.getAddress(),
      value: ethers.BigNumber.from("10000000000000000000"),
      data: undefined,
    });

    busdHolder = await initMainnetUser("0xC825AD791A6046991e3706b6342970f6d87e4888", parseUnits("1000", 18));

    [vBUSD, vUSDT] = await Promise.all(
      [VBUSD, VUSDT].map((address: string) => {
        return new ethers.Contract(address, VBEP20_DELEGATE_ABI, ethers.provider);
      }),
    );

    [BUSD] = await Promise.all(
      [vBUSD].map(async (vToken: Contract) => {
        const underlying = await vToken.underlying();
        return new ethers.Contract(underlying, IERC20Upgradeable, ethers.provider);
      }),
    );
  });

  describe("Verify Storage slots before vip execution", async () => {
    // These tests checks the storage collision of comptroller while updating it via diamond.
    describe("Diamond deployed successfully before vip execution", async () => {
      it("Owner of Diamond unitroller contract should match", async () => {
        const UnitrollerAdmin = await unitroller.admin();
        const pendingAdmin = await unitroller.pendingAdmin();
        expect(UnitrollerAdmin.toLowerCase()).to.equal(Owner.toLowerCase());
        expect(pendingAdmin.toLowerCase()).to.equal(zeroAddr);
      });

      it("Diamond Unitroller Implementation (comptroller) should match the old comptroller address", async () => {
        const comptrollerImplementation = await unitroller.comptrollerImplementation();
        const pendingComptrollerImplementation = await unitroller.pendingComptrollerImplementation();
        expect(comptrollerImplementation.toLowerCase()).to.equal(
          "0xa8a476ad16727ce641f27d7738d2d341ebad81cc".toLowerCase(),
        );
        expect(pendingComptrollerImplementation.toLowerCase()).to.equal(zeroAddr);
      });
    });

    describe("Verify storage layout before vip execution", async () => {
      it("verify all the state before and after upgrade", async () => {
        oracle = await unitroller.oracle();

        maxAssets = await unitroller.maxAssets();

        closeFactorMantissa = await unitroller.closeFactorMantissa();

        liquidationIncentiveMantissa = await unitroller.liquidationIncentiveMantissa();

        venusSupplyState = await unitroller.venusSupplyState(BUSD.address);

        venusBorrowState = await unitroller.venusBorrowState(BUSD.address);

        venusAccrued = await unitroller.venusAccrued(BUSD.address);

        vaiMintRate = await unitroller.vaiMintRate();

        vaiController = await unitroller.vaiController();

        mintedVAIs = await unitroller.mintedVAIs(await busdHolder.getAddress());

        mintVAIGuardianPaused = await unitroller.mintVAIGuardianPaused();

        repayVAIGuardianPaused = await unitroller.repayVAIGuardianPaused();

        protocolPaused = await unitroller.protocolPaused();

        venusVAIVaultRate = await unitroller.venusVAIVaultRate();

        vaiVaultAddress = await unitroller.vaiVaultAddress();

        releaseStartBlock = await unitroller.releaseStartBlock();

        minReleaseAmount = await unitroller.minReleaseAmount();

        treasuryGuardian = await unitroller.treasuryGuardian();

        treasuryAddress = await unitroller.treasuryAddress();

        treasuryPercent = await unitroller.treasuryPercent();

        liquidatorContract = await unitroller.liquidatorContract();

        comptrollerLens = await unitroller.comptrollerLens();

        // checking all public mappings
        allMarkets = await unitroller.getAllMarkets();

        for (const marketIndex in allMarkets) {
          const marketAddress = allMarkets[marketIndex].toString();

          borrowSpeeds[marketAddress] = await unitroller.venusBorrowSpeeds(marketAddress);
          supplySpeeds[marketAddress] = await unitroller.venusSupplySpeeds(marketAddress);
          markets[marketAddress] = await unitroller.markets(marketAddress);

          userBorrowIndexes[marketAddress] = await unitroller.venusBorrowerIndex(
            marketAddress,
            await busdHolder.getAddress(),
          );
          userSupplyIndexes[marketAddress] = await unitroller.venusSupplierIndex(
            marketAddress,
            await busdHolder.getAddress(),
          );
        }
      });
    });
  });

  testVip("VIP-Diamond Contract Migration", await vip174Testnet());

  describe("Verify Storage slots after VIP execution", async () => {
    // These tests checks the storage collision of comptroller while updating it via diamond.
    describe("Diamond deployed successfully after VIP execution", async () => {
      it("Owner of Diamond unitroller contract should match", async () => {
        const diamondUnitrollerAdmin = await diamondUnitroller.admin();
        const pendingAdmin = await diamondUnitroller.pendingAdmin();
        expect(diamondUnitrollerAdmin.toLowerCase()).to.equal(Owner.toLowerCase());
        expect(pendingAdmin.toLowerCase()).to.equal(zeroAddr);
      });

      it("Diamond Unitroller Implementation (comptroller) should match the comptroller implementation Address", async () => {
        const comptrollerImplementation = await diamondUnitroller.comptrollerImplementation();
        const pendingComptrollerImplementation = await diamondUnitroller.pendingComptrollerImplementation();
        expect(comptrollerImplementation.toLowerCase()).to.equal(DIAMOND.toLowerCase());
        expect(pendingComptrollerImplementation.toLowerCase()).to.equal(zeroAddr);
      });
    });

    describe("Verify storage layout after VIP execution", async () => {
      it("verify all the state before and after upgrade", async () => {
        const oracelUpgrade = await diamondUnitroller.oracle();
        expect(oracle).to.equal(oracelUpgrade);

        const maxAssetsAfterUpgrade = await diamondUnitroller.maxAssets();
        expect(maxAssets).to.equal(maxAssetsAfterUpgrade);

        const closeFactorMantissaAfterUpgrade = await diamondUnitroller.closeFactorMantissa();
        expect(closeFactorMantissa).to.equal(closeFactorMantissaAfterUpgrade);

        const liquidationIncentiveMantissaAfterUpgrade = await diamondUnitroller.liquidationIncentiveMantissa();
        expect(liquidationIncentiveMantissa).to.equal(liquidationIncentiveMantissaAfterUpgrade);

        const venusSupplyStateAfterUpgrade = await diamondUnitroller.venusSupplyState(BUSD.address);
        expect(venusSupplyState.index.toString()).to.equal(venusSupplyStateAfterUpgrade.index.toString());

        const venusBorrowStateAfterUpgrade = await diamondUnitroller.venusBorrowState(BUSD.address);
        expect(venusBorrowState.index.toString()).to.equal(venusBorrowStateAfterUpgrade.index.toString());

        const venusAccruedAfterUpgrade = await diamondUnitroller.venusAccrued(BUSD.address);
        expect(venusAccrued).to.equal(venusAccruedAfterUpgrade);

        const vaiMintRateAfterUpgrade = await diamondUnitroller.vaiMintRate();
        expect(vaiMintRate).to.equal(vaiMintRateAfterUpgrade);

        const vaiControllerUpgrade = await diamondUnitroller.vaiController();
        expect(vaiControllerUpgrade).to.equal(vaiController);

        const mintedVAIsUpgrade = await diamondUnitroller.mintedVAIs(await busdHolder.getAddress());
        expect(mintedVAIsUpgrade).to.equal(mintedVAIs);

        const mintVAIGuardianPausedUpgrade = await diamondUnitroller.mintVAIGuardianPaused();
        expect(mintVAIGuardianPausedUpgrade).to.equal(mintVAIGuardianPaused);

        const repayVAIGuardianPausedUpgrade = await diamondUnitroller.repayVAIGuardianPaused();
        expect(repayVAIGuardianPausedUpgrade).to.equal(repayVAIGuardianPaused);

        const protocolPausedUpgrade = await diamondUnitroller.protocolPaused();
        expect(protocolPausedUpgrade).to.equal(protocolPaused);

        const venusVAIVaultRateUpgrade = await diamondUnitroller.venusVAIVaultRate();
        expect(venusVAIVaultRateUpgrade).to.equal(venusVAIVaultRate);

        const vaiVaultAddressUpgrade = await diamondUnitroller.vaiVaultAddress();
        expect(vaiVaultAddressUpgrade).to.equal(vaiVaultAddress);

        const releaseStartBlockUpgrade = await diamondUnitroller.releaseStartBlock();
        expect(releaseStartBlockUpgrade).to.equal(releaseStartBlock);

        const minReleaseAmountUpgrade = await diamondUnitroller.minReleaseAmount();
        expect(minReleaseAmountUpgrade).to.equal(minReleaseAmount);

        const treasuryGuardianUpgrade = await diamondUnitroller.treasuryGuardian();
        expect(treasuryGuardian).to.equal(treasuryGuardianUpgrade);

        const treasuryAddressUpgrade = await diamondUnitroller.treasuryAddress();
        expect(treasuryAddress).to.equal(treasuryAddressUpgrade);

        const treasuryPercentUpgrade = await diamondUnitroller.treasuryPercent();
        expect(treasuryPercent).to.equal(treasuryPercentUpgrade);

        const liquidatorContractUpgrade = await diamondUnitroller.liquidatorContract();
        expect(liquidatorContract).to.equal(liquidatorContractUpgrade);

        const comptrollerLensUpgrade = await diamondUnitroller.comptrollerLens();
        expect(comptrollerLens).to.equal(comptrollerLensUpgrade);

        // checking all public mappings
        for (const marketIndex in allMarkets) {
          const marketAddress = allMarkets[marketIndex].toString();

          const marketUpgrade = await diamondUnitroller.markets(marketAddress);
          expect(markets[marketAddress].collateralFactorMantissa).to.equal(marketUpgrade.collateralFactorMantissa);
          expect(markets[marketAddress].isListed).to.equal(marketUpgrade.isListed);
          expect(markets[marketAddress].isVenus).to.equal(marketUpgrade.isVenus);

          const venusBorrowSpeed = await diamondUnitroller.venusBorrowSpeeds(marketAddress);
          const venusSupplySpeed = await diamondUnitroller.venusSupplySpeeds(marketAddress);
          expect(borrowSpeeds[marketAddress]).to.equal(venusBorrowSpeed);
          expect(supplySpeeds[marketAddress]).to.equal(venusSupplySpeed);

          const userBorrowIndex = await diamondUnitroller.venusBorrowerIndex(
            marketAddress,
            await busdHolder.getAddress(),
          );
          const userSupplyIndex = await diamondUnitroller.venusSupplierIndex(
            marketAddress,
            await busdHolder.getAddress(),
          );
          expect(userBorrowIndexes[marketAddress]).to.equal(userBorrowIndex);
          expect(userSupplyIndexes[marketAddress]).to.equal(userSupplyIndex);
        }
      });
    });
  });

  describe("Verify states of diamond Contract", () => {
    describe("Diamond setters", () => {
      it("setting market supply cap", async () => {
        const currentSupplyCap = (await diamondUnitroller.supplyCaps(vBUSD.address)).toString();
        await diamondUnitroller.connect(owner)._setMarketSupplyCaps([vBUSD.address], [parseUnits("100000", 18)]);
        expect(await diamondUnitroller.supplyCaps(vBUSD.address)).to.equals(parseUnits("100000", 18));
        await diamondUnitroller.connect(owner)._setMarketSupplyCaps([vBUSD.address], [parseUnits(currentSupplyCap, 0)]);
        expect(await diamondUnitroller.supplyCaps(vBUSD.address)).to.equals(parseUnits(currentSupplyCap, 0));
      });

      it("setting close factor", async () => {
        const currentCloseFactor = (await diamondUnitroller.closeFactorMantissa()).toString();
        await diamondUnitroller.connect(owner)._setCloseFactor(parseUnits("1", 17));
        expect(await diamondUnitroller.closeFactorMantissa()).to.equals(parseUnits("1", 17));
        await diamondUnitroller.connect(owner)._setCloseFactor(parseUnits(currentCloseFactor, 0));
        expect(await diamondUnitroller.closeFactorMantissa()).to.equals(parseUnits(currentCloseFactor, 0));
      });

      it("setting Liquidation Incentive", async () => {
        await diamondUnitroller.connect(owner)._setLiquidationIncentive(parseUnits("13", 17));
        expect(await diamondUnitroller.liquidationIncentiveMantissa()).to.equal(parseUnits("13", 17));

        await diamondUnitroller.connect(owner)._setLiquidationIncentive(parseUnits("11", 17));
        expect(await diamondUnitroller.liquidationIncentiveMantissa()).to.equal(parseUnits("11", 17));
      });

      it("setting Pause Guardian", async () => {
        const currentPauseGuardia = (await diamondUnitroller.pauseGuardian()).toString();

        await diamondUnitroller.connect(owner)._setPauseGuardian(await owner.getAddress());
        expect(await diamondUnitroller.pauseGuardian()).to.equal(await owner.getAddress());

        await diamondUnitroller.connect(owner)._setPauseGuardian(currentPauseGuardia);
        expect(await diamondUnitroller.pauseGuardian()).to.equal(currentPauseGuardia);
      });

      it("setting market borrow cap", async () => {
        const currentBorrowCap = (await diamondUnitroller.borrowCaps(vUSDT.address)).toString();
        await diamondUnitroller.connect(owner)._setMarketBorrowCaps([vUSDT.address], [parseUnits("10000", 18)]);
        expect(await diamondUnitroller.borrowCaps(vUSDT.address)).to.equal(parseUnits("10000", 18));

        await diamondUnitroller.connect(owner)._setMarketBorrowCaps([vUSDT.address], [currentBorrowCap]);
        expect(await diamondUnitroller.borrowCaps(vUSDT.address)).to.equal(currentBorrowCap);
      });

      it("pausing mint action in vBUSD", async () => {
        const isActionPaused = await diamondUnitroller.actionPaused(VBUSD, 0);

        await diamondUnitroller.connect(owner)._setActionsPaused([VBUSD], [0], !isActionPaused);

        await expect(await diamondUnitroller.actionPaused(VBUSD, 0)).to.be.equal(!isActionPaused);

        if (!isActionPaused) {
          await diamondUnitroller.connect(owner)._setActionsPaused([VBUSD], [0], false);
        }
      });
    });
  });
});

forking(33497000, async () => {
  let owner, unitroller;
  let USDT: Contract;
  let usdtHolder: Signer;
  let vUSDT: Contract;
  let diamondUnitroller: Contract;

  before(async () => {
    await pretendExecutingVip(await vip174Testnet(), bscmainnet.NORMAL_TIMELOCK);
    unitroller = new ethers.Contract(UNITROLLER, Comptroller, ethers.provider);

    diamondUnitroller = new ethers.Contract(unitroller.address, Comptroller, ethers.provider);

    await impersonateAccount(Owner);
    owner = await ethers.getSigner(Owner);
    const [signer] = await ethers.getSigners();
    await signer.sendTransaction({
      to: owner.address,
      value: ethers.BigNumber.from("10000000000000000000"),
      data: undefined,
    });

    usdtHolder = await initMainnetUser("0xa0747a72C329377C2CE4F0F3165197B3a5359EfE", parseUnits("1000", 18));

    [vUSDT] = await Promise.all(
      [VUSDT].map((address: string) => {
        return new ethers.Contract(address, VBEP20_DELEGATE_ABI, ethers.provider);
      }),
    );
    [USDT] = await Promise.all(
      [vUSDT].map(async (vToken: Contract) => {
        const underlying = await vToken.underlying();
        return new ethers.Contract(underlying, IERC20Upgradeable, ethers.provider);
      }),
    );
    await diamondUnitroller.connect(owner)._setActionsPaused([VBUSD], [0], false);
  });

  describe("Diamond Hooks", () => {
    it("Diamond Unitroller Implementation (comptroller) should match the diamond Proxy Address", async () => {
      const comptrollerImplementation = await diamondUnitroller.comptrollerImplementation();
      const pendingComptrollerImplementation = await diamondUnitroller.pendingComptrollerImplementation();
      expect(comptrollerImplementation.toLowerCase()).to.equal(DIAMOND.toLowerCase());
      expect(pendingComptrollerImplementation.toLowerCase()).to.equal(zeroAddr);
    });

    it("mint vToken vUSDT", async () => {
      const vUSDTBalance = await USDT.balanceOf(vUSDT.address);
      const usdtHolderBalance = await USDT.balanceOf(await usdtHolder.getAddress());
      await USDT.connect(usdtHolder).approve(vUSDT.address, 2000);
      await vUSDT.connect(usdtHolder).mint(2000);
      const newvUSDTBalance = await USDT.balanceOf(vUSDT.address);
      const newUsdtHolderBalance = await USDT.balanceOf(await usdtHolder.getAddress());

      expect(newvUSDTBalance).greaterThan(vUSDTBalance);
      expect(newUsdtHolderBalance).lessThan(usdtHolderBalance);
    });

    it("redeem vToken", async () => {
      await USDT.connect(usdtHolder).approve(vUSDT.address, 2000);
      await expect(vUSDT.connect(usdtHolder).mint(2000)).to.emit(vUSDT, "Mint");

      const vUSDTUserBal = await vUSDT.connect(usdtHolder).balanceOf(await usdtHolder.getAddress());
      await expect(vUSDT.connect(usdtHolder).redeem(2000)).to.emit(vUSDT, "Redeem");
      const newVUSDTUserBal = await vUSDT.connect(usdtHolder).balanceOf(await usdtHolder.getAddress());

      expect(newVUSDTUserBal).to.equal(vUSDTUserBal.sub(2000));
    });

    it("borrow vToken", async () => {
      const usdtUserBal = await USDT.balanceOf(await usdtHolder.getAddress());

      await expect(vUSDT.connect(usdtHolder).borrow(1000)).to.emit(vUSDT, "Borrow");

      expect((await USDT.balanceOf(await usdtHolder.getAddress())).toString()).to.equal(usdtUserBal.add(1000));
    });

    it("Repay vToken", async () => {
      await USDT.connect(usdtHolder).approve(vUSDT.address, 2000);

      const usdtUserBal = await USDT.balanceOf(await usdtHolder.getAddress());
      await vUSDT.connect(usdtHolder).borrow(1000);

      expect((await USDT.balanceOf(await usdtHolder.getAddress())).toString()).to.greaterThan(usdtUserBal);

      await vUSDT.connect(usdtHolder).repayBorrow(1000);

      const balanceAfterRepay = await USDT.balanceOf(await usdtHolder.getAddress());
      expect(balanceAfterRepay).to.equal(usdtUserBal);
    });
  });
});
