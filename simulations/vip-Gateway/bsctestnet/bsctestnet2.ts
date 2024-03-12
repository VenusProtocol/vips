import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import { checkCorePoolComptroller } from "../../../src/vip-framework/checks/checkCorePoolComptroller";
import { checkIsolatedPoolsComptrollers } from "../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { performVTokenBasicAndBehalfActions } from "../../../src/vtokenUpgradesHelper";
import {
  COMPTROLLER_BEACON,
  CORE_MARKETS,
  DIAMOND,
  NATIVE_TOKEN_GATEWAY,
  NEW_COMPTROLLER_IMPLEMENTATION,
  NEW_VBEP20_DELEGATE_IMPL,
  NEW_VTOKEN_IMPLEMENTATION,
  NORMAL_TIMELOCK,
  UNITROLLER,
  VTOKEN_BEACON,
  XVS,
  XVSVTOKEN,
  vipGateway,
} from "../../../vips/vip-Gateway/bsctestnet2";
import ACM_ABI from "../abi/AccessControlManager.json";
import BEACON_ABI from "../abi/Beacon.json";
import COMPTROLLER_ABI from "../abi/Comptroller.json";
import CORE_POOL_ABI from "../abi/CorePoolComptroller.json";
import DIAMOND_ABI from "../abi/Diamond.json";
import ERC20_ABI from "../abi/Erc20.json";
import MOCK_TOKEN_ABI from "../abi/MockToken.json";
import NATIVE_TOKEN_GATEWAY_ABI from "../abi/NativeTokenGateway.json";
import UNITROLLER_ABI from "../abi/Unitroller.json";
import VBEP_20_DELEGATE_ABI from "../abi/VBep20Delegate.json";
import VEBEP_20_DELEGATOR_ABI from "../abi/VBep20Delegator.json";
import VTOKEN_ABI from "../abi/VToken.json";

const OLD_COMPTROLLER_IMPLEMENTATION = "0xE1Ac99E486EBEcD40Ab4C9FF29Fe4d28be244D33";
const OLD_VTOKEN_IMPLEMENTATION = "0xF83362aF1722b1762e21369225901B90D9b980d9";

const VBNBX_LIQUID_STAKED_BNB = "0x644A149853E5507AdF3e682218b8AC86cdD62951";
const POOL_LIQUID_STAKED_BNB = "0x596B11acAACF03217287939f88d63b51d3771704";

const USER_1 = "0x03862dFa5D0be8F64509C001cb8C6188194469DF";
const USER_2 = "0xb07A7f0A252bc7a3a26aa3c3C9D9c38aD8a6f02F";

const TOKEN_HOLDER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

const OLD_DIAMOND_ADDRESS = "0x795F7238514DE51d04a3550089a62F59ef6992Ad";
const OLD_SETTER_FACET = "0xD346A70320C7Bca8A68b1aaF9eea1b1055BAB74B";
const OLD_REWARD_FACET = "0x19fB43e4b46DCB803208253E42F5D1800D2ACEca";
const OLD_MARKET_FACET = "0xbcA3d5E7a66D97E0415662c2394Ed2605944b614";
const OLD_POLICY_FACET = "0xb16399Cb0f54D73D045F476b03A6Cb468F6BE7D2";

const NEW_SETTER_FACET = "0xaBdE9599a4aEcE4fEC59fBF2b8445149bc8B2c70";
const NEW_REWARD_FACET = "0x905006DCD5DbAa9B67359bcB341a0C49AfC8d0A6";
const NEW_MARKET_FACET = "0xF2F2aE5480c4527787Fb7Cde1Ed9A3EdfD40A60d";
const NEW_POLICY_FACET = "0x7b17b28687B817158c20e3d1bf100106fBE794cf";

const provider = ethers.provider;
let user1: SignerWithAddress;
let impersonatedTimelock: SignerWithAddress;
let comptroller: ethers.Contract;
let unitroller: ethers.Contract;
let comptrollerBeacon: ethers.Contract;
let vtokenBeacon: ethers.Contract;
let nativeTokenGateway: ethers.Contract;

let accessControlManager: string;
let closeFactorMantissa: BigNumber;
let allMarkets: string[];
let rewardsDistributors: string[];
let marketListed: boolean;
let liquidationIncentiveMantissa: BigNumber;
let maxLoopsLimit: BigNumber;
let minLiquidatableCollateral: BigNumber;
let oracle: string;
let owner: string;
let poolRegistry: string;
let prime: string;
let marketFacetFunctionSelectors: string[];
let policyFacetFunctionSelectors: string[];
let rewardFacetFuntionSelectors: string[];
let setterFacetFuntionSelectors: string[];

forking(38508666, () => {
  before(async () => {
    impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, parseUnits("2"));

    nativeTokenGateway = new ethers.Contract(NATIVE_TOKEN_GATEWAY, NATIVE_TOKEN_GATEWAY_ABI, provider);

    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, BEACON_ABI, provider);
    comptroller = new ethers.Contract(POOL_LIQUID_STAKED_BNB, COMPTROLLER_ABI, provider);
    unitroller = new ethers.Contract(UNITROLLER, CORE_POOL_ABI, provider);

    vtokenBeacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);

    rewardFacetFuntionSelectors = await unitroller.facetFunctionSelectors(OLD_REWARD_FACET);
    setterFacetFuntionSelectors = await unitroller.facetFunctionSelectors(OLD_SETTER_FACET);
    marketFacetFunctionSelectors = await unitroller.facetFunctionSelectors(OLD_MARKET_FACET);
    policyFacetFunctionSelectors = await unitroller.facetFunctionSelectors(OLD_POLICY_FACET);

    accessControlManager = await comptroller.accessControlManager();
    closeFactorMantissa = await comptroller.closeFactorMantissa();
    allMarkets = await comptroller.getAllMarkets();
    rewardsDistributors = await comptroller.getRewardDistributors();
    marketListed = await comptroller.isMarketListed(VBNBX_LIQUID_STAKED_BNB);
    liquidationIncentiveMantissa = await comptroller.liquidationIncentiveMantissa();
    maxLoopsLimit = await comptroller.maxLoopsLimit();
    minLiquidatableCollateral = await comptroller.minLiquidatableCollateral();
    oracle = await comptroller.oracle();
    owner = await comptroller.owner();
    poolRegistry = await comptroller.poolRegistry();
    prime = await comptroller.prime();
  });

  describe("Pre-VIP behaviour", async () => {
    it("unitroller should have old implementation", async () => {
      expect((await unitroller.comptrollerImplementation()).toLowerCase()).to.equal(OLD_DIAMOND_ADDRESS.toLowerCase());
    });

    it("comptroller should have old implementations", async () => {
      expect((await comptrollerBeacon.implementation()).toLowerCase()).to.equal(
        OLD_COMPTROLLER_IMPLEMENTATION.toLowerCase(),
      );
    });

    it("vToken should have old implementations", async () => {
      expect((await vtokenBeacon.implementation()).toLowerCase()).to.equal(OLD_VTOKEN_IMPLEMENTATION.toLowerCase());
    });
  });

  testVip("VIP-Gateway", vipGateway(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewPendingImplementation"], [2]);
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [VEBEP_20_DELEGATOR_ABI], ["NewImplementation"], [24]); // +1 for unitroller
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [2]);
      await expectEvents(txResponse, [NATIVE_TOKEN_GATEWAY_ABI], ["OwnershipTransferred"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [3]);
      await expectEvents(txResponse, [CORE_POOL_ABI], ["NewXVSToken", "NewXVSVToken"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("market facet function selectors should be replaced with new facet address", async () => {
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal(marketFacetFunctionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
    });

    it("policy facet function selectors should be replaced with new facet address", async () => {
      expect(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET)).to.deep.equal(policyFacetFunctionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal([]);
    });

    it("reward facet function selectors should be replaced with new facet address", async () => {
      const newRewardFacetFuntionSelectors = [...rewardFacetFuntionSelectors, "0x655f0725"];

      expect(await unitroller.facetFunctionSelectors(NEW_REWARD_FACET)).to.deep.equal(newRewardFacetFuntionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_REWARD_FACET)).to.deep.equal([]);
    });

    it("setter facet function selectors should be replaced with new facet address", async () => {
      const newSetterFacetFuntionSelectors = [...setterFacetFuntionSelectors, "0x919a3736", "0x4ef233fc"];

      expect(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET)).to.deep.equal(newSetterFacetFuntionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal([]);
    });

    it("unitroller should contain the new facet addresses", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_SETTER_FACET, NEW_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET, NEW_POLICY_FACET);

      expect(await unitroller.facetAddresses()).to.not.include(OLD_SETTER_FACET, OLD_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_MARKET_FACET, OLD_POLICY_FACET);
    });

    it("unitroller should have new implementation", async () => {
      expect((await unitroller.comptrollerImplementation()).toLowerCase()).to.equal(DIAMOND.toLowerCase());
    });

    it("comptroller should have new implementations", async () => {
      expect((await comptrollerBeacon.implementation()).toLowerCase()).to.equal(
        NEW_COMPTROLLER_IMPLEMENTATION.toLowerCase(),
      );
    });

    it("vToken should have new implementations", async () => {
      expect((await vtokenBeacon.implementation()).toLowerCase()).to.equal(NEW_VTOKEN_IMPLEMENTATION.toLowerCase());
    });

    it("timelock should be the owner of NativeTokenGateway contract", async () => {
      expect(await nativeTokenGateway.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("storage layout of comptroller should be consistent", async () => {
      expect(await comptroller.accessControlManager()).to.equal(accessControlManager);
      expect(await comptroller.closeFactorMantissa()).to.equal(closeFactorMantissa);
      expect(await comptroller.getAllMarkets()).to.deep.equal(allMarkets);
      expect(await comptroller.getRewardDistributors()).to.deep.equal(rewardsDistributors);
      expect(await comptroller.isMarketListed(VBNBX_LIQUID_STAKED_BNB)).to.equal(marketListed);
      expect(await comptroller.liquidationIncentiveMantissa()).to.equal(liquidationIncentiveMantissa);
      expect(await comptroller.maxLoopsLimit()).to.equal(maxLoopsLimit);
      expect(await comptroller.minLiquidatableCollateral()).to.equal(minLiquidatableCollateral);
      expect(await comptroller.oracle()).to.equal(oracle);
      expect(await comptroller.owner()).to.equal(owner);
      expect(await comptroller.poolRegistry()).to.equal(poolRegistry);
      expect(await comptroller.prime()).to.equal(prime);
      expect(await comptroller.approvedDelegates(USER_1, USER_2)).to.equal(false);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkIsolatedPoolsComptrollers();
    });
  });
});

// core pool vToken tests
forking(38508666, () => {
  let vToken: ethers.Contract;
  let underlying: ethers.Contract;
  let user: SignerWithAddress;
  const mintAmount = parseUnits("200", 18);
  const borrowAmount = parseUnits("50", 18);
  const repayAmount = parseUnits("50", 18);
  const redeemAmount = parseUnits("50", 18);
  const actions = [0, 1, 2, 3, 7]; // Mint, Redeem, Borrow, Repay, EnterMarket

  describe("VToken Tests", () => {
    // these are markets which do not contain `allocateTo` or `faucet` function in their underlying, so treating them as genuine markets i.e. (mock = false)
    const markets = ["vBTC", "vETH", "vLTC", "vXRP", "vXVS"];

    before(async () => {
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, parseUnits("2"));
      await pretendExecutingVip(vipGateway());
    });

    for (const market of CORE_MARKETS) {
      it(`Generic tests for mint, borrow, redeem, repay for ${market.name} should work`, async () => {
        user = await initMainnetUser(TOKEN_HOLDER, ethers.utils.parseEther("5"));
        user1 = await initMainnetUser(USER_1, ethers.utils.parseEther("5"));

        vToken = new ethers.Contract(market.address, VBEP_20_DELEGATE_ABI, provider);

        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);
        await unitroller.connect(impersonatedTimelock)._setMarketBorrowCaps([market.address], [parseUnits("2", 48)]);
        await unitroller.connect(impersonatedTimelock)._setMarketSupplyCaps([market.address], [parseUnits("2", 48)]);
        await unitroller.connect(impersonatedTimelock)._setCollateralFactor(market.address, parseUnits("0.89", 18));
        await unitroller.connect(impersonatedTimelock)._setActionsPaused([market.address], actions, false);

        let isMock = true;
        if (markets.includes(market.name)) isMock = false;
        await performVTokenBasicAndBehalfActions(
          market.address,
          user,
          user1,
          mintAmount,
          borrowAmount,
          repayAmount,
          redeemAmount,
          vToken,
          underlying,
          unitroller,
          isMock,
        );
        expect(await vToken.implementation()).equals(NEW_VBEP20_DELEGATE_IMPL);
      });
    }
  });
});

// seizeVenus vip tests
forking(38508666, () => {
  const ACCOUNT_1 = "0xa0747a72C329377C2CE4F0F3165197B3a5359EfE";
  const ACCOUNT_2 = "0x6997901e20D83ED40F7A46213814EeC15af6B09f";
  const ACCOUNT_3 = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

  let xvs: Contract;

  describe("Seize Token Scenario", () => {
    let deployer: SignerWithAddress;
    let user: SignerWithAddress;

    before(async () => {
      await pretendExecutingVip(vipGateway());
      deployer = await initMainnetUser(ACCOUNT_1, parseUnits("10", 18));
      user = await initMainnetUser(ACCOUNT_2, parseUnits("10", 18));

      xvs = new ethers.Contract(XVS, VBEP_20_DELEGATE_ABI, ethers.provider);
      unitroller = new ethers.Contract(UNITROLLER, CORE_POOL_ABI, provider);
    });

    it("Emits events for every holders successfull seize of tokens", async () => {
      const recipient = await deployer.getAddress();
      const xvsHotWallet = await initMainnetUser(ACCOUNT_3, parseUnits("1", 18));
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseUnits("1", 18));

      await xvs.connect(xvsHotWallet).transfer(unitroller.address, parseUnits("1", 18));

      const oldXvsBalance = await xvs.balanceOf(recipient);
      await unitroller.connect(timelock).seizeVenus([user.address], recipient);
      expect(await xvs.balanceOf(recipient)).to.be.gt(oldXvsBalance);
      expect(await unitroller.venusAccrued(user.address)).to.be.eq(0);
    });
  });
});

// xvs setter tests
forking(38508666, () => {
  beforeEach(async () => {
    await pretendExecutingVip(vipGateway());
  });

  it("Should return correct xvs and xvs vtoken addresses", async () => {
    expect(await unitroller.getXVSAddress()).to.equal(XVS);
    expect(await unitroller.getXVSVTokenAddress()).to.equal(XVSVTOKEN);
  });
});

// all storage values before and after executing this vip, setter functions and core
// functionalities are working properly
forking(38508666, async () => {
  const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
  const VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
  let owner: SignerWithAddress,
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

  before(async () => {
    unitroller = new ethers.Contract(UNITROLLER, CORE_POOL_ABI, ethers.provider);

    await impersonateAccount(NORMAL_TIMELOCK);
    owner = await ethers.getSigner(NORMAL_TIMELOCK);
    const [signer] = await ethers.getSigners();
    await signer.sendTransaction({
      to: await owner.getAddress(),
      value: ethers.BigNumber.from("10000000000000000000"),
      data: undefined,
    });

    busdHolder = await initMainnetUser("0xC825AD791A6046991e3706b6342970f6d87e4888", parseUnits("1000", 18));

    [vBUSD, vUSDT] = await Promise.all(
      [VBUSD, VUSDT].map((address: string) => {
        return new ethers.Contract(address, VBEP_20_DELEGATE_ABI, ethers.provider);
      }),
    );

    [BUSD] = await Promise.all(
      [vBUSD].map(async (vToken: Contract) => {
        const underlying = await vToken.underlying();
        return new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      }),
    );

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

    await pretendExecutingVip(vipGateway());
  });

  describe("Verify Storage slots after VIP execution", async () => {
    // These tests checks the storage collision of comptroller while updating it via diamond.
    describe("Verify storage layout after VIP execution", async () => {
      it("verify all the state before and after upgrade", async () => {
        const oracelUpgrade = await unitroller.oracle();
        expect(oracle).to.equal(oracelUpgrade);

        const maxAssetsAfterUpgrade = await unitroller.maxAssets();
        expect(maxAssets).to.equal(maxAssetsAfterUpgrade);

        const closeFactorMantissaAfterUpgrade = await unitroller.closeFactorMantissa();
        expect(closeFactorMantissa).to.equal(closeFactorMantissaAfterUpgrade);

        const liquidationIncentiveMantissaAfterUpgrade = await unitroller.liquidationIncentiveMantissa();
        expect(liquidationIncentiveMantissa).to.equal(liquidationIncentiveMantissaAfterUpgrade);

        const venusSupplyStateAfterUpgrade = await unitroller.venusSupplyState(BUSD.address);
        expect(venusSupplyState.index.toString()).to.equal(venusSupplyStateAfterUpgrade.index.toString());

        const venusBorrowStateAfterUpgrade = await unitroller.venusBorrowState(BUSD.address);
        expect(venusBorrowState.index.toString()).to.equal(venusBorrowStateAfterUpgrade.index.toString());

        const venusAccruedAfterUpgrade = await unitroller.venusAccrued(BUSD.address);
        expect(venusAccrued).to.equal(venusAccruedAfterUpgrade);

        const vaiMintRateAfterUpgrade = await unitroller.vaiMintRate();
        expect(vaiMintRate).to.equal(vaiMintRateAfterUpgrade);

        const vaiControllerUpgrade = await unitroller.vaiController();
        expect(vaiControllerUpgrade).to.equal(vaiController);

        const mintedVAIsUpgrade = await unitroller.mintedVAIs(await busdHolder.getAddress());
        expect(mintedVAIsUpgrade).to.equal(mintedVAIs);

        const mintVAIGuardianPausedUpgrade = await unitroller.mintVAIGuardianPaused();
        expect(mintVAIGuardianPausedUpgrade).to.equal(mintVAIGuardianPaused);

        const repayVAIGuardianPausedUpgrade = await unitroller.repayVAIGuardianPaused();
        expect(repayVAIGuardianPausedUpgrade).to.equal(repayVAIGuardianPaused);

        const protocolPausedUpgrade = await unitroller.protocolPaused();
        expect(protocolPausedUpgrade).to.equal(protocolPaused);

        const venusVAIVaultRateUpgrade = await unitroller.venusVAIVaultRate();
        expect(venusVAIVaultRateUpgrade).to.equal(venusVAIVaultRate);

        const vaiVaultAddressUpgrade = await unitroller.vaiVaultAddress();
        expect(vaiVaultAddressUpgrade).to.equal(vaiVaultAddress);

        const releaseStartBlockUpgrade = await unitroller.releaseStartBlock();
        expect(releaseStartBlockUpgrade).to.equal(releaseStartBlock);

        const minReleaseAmountUpgrade = await unitroller.minReleaseAmount();
        expect(minReleaseAmountUpgrade).to.equal(minReleaseAmount);

        const treasuryGuardianUpgrade = await unitroller.treasuryGuardian();
        expect(treasuryGuardian).to.equal(treasuryGuardianUpgrade);

        const treasuryAddressUpgrade = await unitroller.treasuryAddress();
        expect(treasuryAddress).to.equal(treasuryAddressUpgrade);

        const treasuryPercentUpgrade = await unitroller.treasuryPercent();
        expect(treasuryPercent).to.equal(treasuryPercentUpgrade);

        const liquidatorContractUpgrade = await unitroller.liquidatorContract();
        expect(liquidatorContract).to.equal(liquidatorContractUpgrade);

        const comptrollerLensUpgrade = await unitroller.comptrollerLens();
        expect(comptrollerLens).to.equal(comptrollerLensUpgrade);

        // checking all public mappings
        for (const marketIndex in allMarkets) {
          const marketAddress = allMarkets[marketIndex].toString();

          const marketUpgrade = await unitroller.markets(marketAddress);
          expect(markets[marketAddress].collateralFactorMantissa).to.equal(marketUpgrade.collateralFactorMantissa);
          expect(markets[marketAddress].isListed).to.equal(marketUpgrade.isListed);
          expect(markets[marketAddress].isVenus).to.equal(marketUpgrade.isVenus);

          const venusBorrowSpeed = await unitroller.venusBorrowSpeeds(marketAddress);
          const venusSupplySpeed = await unitroller.venusSupplySpeeds(marketAddress);
          expect(borrowSpeeds[marketAddress]).to.equal(venusBorrowSpeed);
          expect(supplySpeeds[marketAddress]).to.equal(venusSupplySpeed);

          const userBorrowIndex = await unitroller.venusBorrowerIndex(marketAddress, await busdHolder.getAddress());
          const userSupplyIndex = await unitroller.venusSupplierIndex(marketAddress, await busdHolder.getAddress());
          expect(userBorrowIndexes[marketAddress]).to.equal(userBorrowIndex);
          expect(userSupplyIndexes[marketAddress]).to.equal(userSupplyIndex);
        }
      });
    });
  });

  describe("Verify states of diamond Contract", () => {
    describe("Diamond setters", () => {
      it("setting market supply cap", async () => {
        const currentSupplyCap = (await unitroller.supplyCaps(vBUSD.address)).toString();
        await unitroller.connect(owner)._setMarketSupplyCaps([vBUSD.address], [parseUnits("100000", 18)]);
        expect(await unitroller.supplyCaps(vBUSD.address)).to.equals(parseUnits("100000", 18));
        await unitroller.connect(owner)._setMarketSupplyCaps([vBUSD.address], [parseUnits(currentSupplyCap, 0)]);
        expect(await unitroller.supplyCaps(vBUSD.address)).to.equals(parseUnits(currentSupplyCap, 0));
      });

      it("setting close factor", async () => {
        const currentCloseFactor = (await unitroller.closeFactorMantissa()).toString();
        await unitroller.connect(owner)._setCloseFactor(parseUnits("1", 17));
        expect(await unitroller.closeFactorMantissa()).to.equals(parseUnits("1", 17));
        await unitroller.connect(owner)._setCloseFactor(parseUnits(currentCloseFactor, 0));
        expect(await unitroller.closeFactorMantissa()).to.equals(parseUnits(currentCloseFactor, 0));
      });

      it("setting Liquidation Incentive", async () => {
        await unitroller.connect(owner)._setLiquidationIncentive(parseUnits("13", 17));
        expect(await unitroller.liquidationIncentiveMantissa()).to.equal(parseUnits("13", 17));

        await unitroller.connect(owner)._setLiquidationIncentive(parseUnits("11", 17));
        expect(await unitroller.liquidationIncentiveMantissa()).to.equal(parseUnits("11", 17));
      });

      it("setting Pause Guardian", async () => {
        const currentPauseGuardia = (await unitroller.pauseGuardian()).toString();

        await unitroller.connect(owner)._setPauseGuardian(await owner.getAddress());
        expect(await unitroller.pauseGuardian()).to.equal(await owner.getAddress());

        await unitroller.connect(owner)._setPauseGuardian(currentPauseGuardia);
        expect(await unitroller.pauseGuardian()).to.equal(currentPauseGuardia);
      });

      it("setting market borrow cap", async () => {
        const currentBorrowCap = (await unitroller.borrowCaps(vUSDT.address)).toString();
        await unitroller.connect(owner)._setMarketBorrowCaps([vUSDT.address], [parseUnits("10000", 18)]);
        expect(await unitroller.borrowCaps(vUSDT.address)).to.equal(parseUnits("10000", 18));

        await unitroller.connect(owner)._setMarketBorrowCaps([vUSDT.address], [currentBorrowCap]);
        expect(await unitroller.borrowCaps(vUSDT.address)).to.equal(currentBorrowCap);
      });

      it("pausing mint action in vBUSD", async () => {
        const isActionPaused = await unitroller.actionPaused(VBUSD, 0);

        await unitroller.connect(owner)._setActionsPaused([VBUSD], [0], !isActionPaused);

        await expect(await unitroller.actionPaused(VBUSD, 0)).to.be.equal(!isActionPaused);

        if (!isActionPaused) {
          await unitroller.connect(owner)._setActionsPaused([VBUSD], [0], false);
        }
      });
    });
  });
});
