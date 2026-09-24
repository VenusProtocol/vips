import { expect } from "chai";
import { BigNumber, Contract, Wallet } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  POSITION_ACCOUNT,
  RELATIVE_POSITION_MANAGER,
  TIMELOCKS_AND_GUARDIAN,
  vUSDC,
  vUSDT,
  vip608,
} from "../../vips/vip-608/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import BINANCE_ORACLE_ABI from "./abi/BinanceOracle.json";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import FLASHLOAN_FACET_ABI from "./abi/FlashLoanFacet.json";
import POSITION_ACCOUNT_ABI from "./abi/PositionAccount.json";
import RELATIVE_POSITION_MANAGER_ABI from "./abi/RelativePositionManager.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SWAP_HELPER_ABI from "./abi/SwapHelperAbi.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const ACM_FUNCTION_SIGNATURES = [
  "partialPause()",
  "partialUnpause()",
  "completePause()",
  "completeUnpause()",
  "setProportionalCloseTolerance(uint256)",
  "addDSAVToken(address)",
  "setDSAVTokenActive(uint8,bool)",
  "executePositionAccountCall(address,address[],bytes[])",
] as const;

forking(89004570, async () => {
  let accessControlManager: Contract;
  let relativePositionManager: Contract;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, bscmainnet.ACCESS_CONTROL_MANAGER);
    relativePositionManager = await ethers.getContractAt(RELATIVE_POSITION_MANAGER_ABI, RELATIVE_POSITION_MANAGER);
  });

  describe("Pre-VIP behavior", () => {
    it("RelativePositionManager should have NORMAL_TIMELOCK as pending owner and not yet as owner", async () => {
      expect(await relativePositionManager.owner()).not.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await relativePositionManager.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("RPM should not have Position Account implementation set", async () => {
      expect(await relativePositionManager.POSITION_ACCOUNT_IMPLEMENTATION()).to.equal(ethers.constants.AddressZero);
    });

    it("vUSDC should not be an active DSA vToken", async () => {
      expect(await relativePositionManager.isDsaVTokenActive(vUSDC)).to.equal(false);
    });

    it("vUSDT should not be an active DSA vToken", async () => {
      expect(await relativePositionManager.isDsaVTokenActive(vUSDT)).to.equal(false);
    });

    it("Timelocks/Guardian should not have ACM permissions on RelativePositionManager", async () => {
      for (const timelockOrGuardian of TIMELOCKS_AND_GUARDIAN) {
        for (const fnSignature of ACM_FUNCTION_SIGNATURES) {
          const role = ethers.utils.solidityPack(["address", "string"], [RELATIVE_POSITION_MANAGER, fnSignature]);
          const roleHash = ethers.utils.keccak256(role);
          expect(await accessControlManager.hasRole(roleHash, timelockOrGuardian)).to.equal(false);
        }
      }
      const setImplRole = ethers.utils.solidityPack(
        ["address", "string"],
        [RELATIVE_POSITION_MANAGER, "setPositionAccountImplementation(address)"],
      );
      expect(
        await accessControlManager.hasRole(ethers.utils.keccak256(setImplRole), bscmainnet.NORMAL_TIMELOCK),
      ).to.equal(false);
    });
  });

  testVip("VIP-608 [BNB Chain] Configure Relative Position Manager", await vip608(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RELATIVE_POSITION_MANAGER_ABI], ["OwnershipTransferred"], [1]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [33]);
      await expectEvents(txResponse, [RELATIVE_POSITION_MANAGER_ABI], ["PositionAccountImplementationSet"], [1]);
      await expectEvents(txResponse, [RELATIVE_POSITION_MANAGER_ABI], ["DSAVTokenAdded"], [2]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("RelativePositionManager should have NORMAL_TIMELOCK as owner and no pending owner", async () => {
      expect(await relativePositionManager.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await relativePositionManager.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("Timelocks/Guardian should have ACM permissions on RelativePositionManager", async () => {
      for (const timelockOrGuardian of TIMELOCKS_AND_GUARDIAN) {
        for (const fnSignature of ACM_FUNCTION_SIGNATURES) {
          const role = ethers.utils.solidityPack(["address", "string"], [RELATIVE_POSITION_MANAGER, fnSignature]);
          const roleHash = ethers.utils.keccak256(role);
          expect(await accessControlManager.hasRole(roleHash, timelockOrGuardian)).to.equal(true);
        }
      }
      const setImplRole = ethers.utils.solidityPack(
        ["address", "string"],
        [RELATIVE_POSITION_MANAGER, "setPositionAccountImplementation(address)"],
      );
      expect(
        await accessControlManager.hasRole(ethers.utils.keccak256(setImplRole), bscmainnet.NORMAL_TIMELOCK),
      ).to.equal(true);
    });

    it("RPM should have Position Account implementation stored in the state", async () => {
      expect(await relativePositionManager.POSITION_ACCOUNT_IMPLEMENTATION()).to.equals(POSITION_ACCOUNT);
    });

    it("vUSDC should be an active DSA vToken at index 0", async () => {
      expect(await relativePositionManager.dsaVTokens(0)).to.equal(vUSDC);
      expect(await relativePositionManager.isDsaVTokenActive(vUSDC)).to.equal(true);
    });

    it("vUSDT should be an active DSA vToken at index 1", async () => {
      expect(await relativePositionManager.dsaVTokens(1)).to.equal(vUSDT);
      expect(await relativePositionManager.isDsaVTokenActive(vUSDT)).to.equal(true);
    });

    it("Setting Position Account implementation again should revert", async () => {
      const signer = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(
        relativePositionManager.connect(signer).setPositionAccountImplementation(POSITION_ACCOUNT),
      ).to.be.revertedWithCustomError(relativePositionManager, "PositionAccountImplementationLocked");
    });

    for (const timelockOrGuardian of TIMELOCKS_AND_GUARDIAN) {
      describe(`ACM-gated functions should be callable by ${timelockOrGuardian}`, () => {
        let rpmAsCaller: Contract;

        before(async () => {
          const signer = await initMainnetUser(timelockOrGuardian, ethers.utils.parseEther("1"));
          rpmAsCaller = relativePositionManager.connect(signer);
        });

        it("partialPause and partialUnpause", async () => {
          await rpmAsCaller.partialPause();
          expect(await relativePositionManager.isPartiallyPaused()).to.equal(true);
          await rpmAsCaller.partialUnpause();
          expect(await relativePositionManager.isPartiallyPaused()).to.equal(false);
        });

        it("completePause and completeUnpause", async () => {
          await rpmAsCaller.completePause();
          expect(await relativePositionManager.isCompletelyPaused()).to.equal(true);
          await rpmAsCaller.completeUnpause();
          expect(await relativePositionManager.isCompletelyPaused()).to.equal(false);
        });

        it("setProportionalCloseTolerance", async () => {
          const current = await relativePositionManager.proportionalCloseTolerance();
          const newValue = current.add(1);
          await rpmAsCaller.setProportionalCloseTolerance(newValue);
          expect(await relativePositionManager.proportionalCloseTolerance()).to.equal(newValue);
        });

        it("executePositionAccountCall", async () => {
          // Reverts with InvalidCallsLength (not Unauthorized) — proves ACM permission passed
          const positionAccountContract = await ethers.getContractAt(POSITION_ACCOUNT_ABI, POSITION_ACCOUNT);
          await expect(rpmAsCaller.executePositionAccountCall(POSITION_ACCOUNT, [], [])).to.be.revertedWithCustomError(
            positionAccountContract,
            "InvalidCallsLength",
          );
        });
      });
    }
  });

  describe("E2E: RelativePositionManager flows", function () {
    this.timeout(720_000); // 12 minutes

    // --- E2E test constants ---
    const SWAP_HELPER_ADDRESS = "0xD79be25aEe798Aa34A9Ba1230003d7499be29A24";
    const LEVERAGE_STRATEGIES_MANAGER_ADDRESS = "0x03F079E809185a669Ca188676D0ADb09cbAd6dC1";

    // Close buffer multipliers (basis: 1000 = 1x)
    // Full close: 2% contract proportional-close tolerance + 0.2% interest accrual buffer
    const FULL_CLOSE_BUFFER_BPS = 1022;
    // Partial close: 0.2% interest accrual buffer only (no contract tolerance applied)
    const PARTIAL_CLOSE_BUFFER_BPS = 1002;

    // Core pool markets (BSC mainnet)
    const DSA_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"; // USDC
    const vDSA_ADDRESS = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8"; // vUSDC
    const LONG_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // WBNB
    const vLONG_ADDRESS = "0x6bCa74586218dB34cdB402295796b79663d816e9"; // vWBNB
    const SHORT_ADDRESS = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"; // ETH
    const vSHORT_ADDRESS = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8"; // vETH

    const DSA_WHALE = "0xf322942f644a996a617bd29c16bd7d231d9f35e9"; // Venus Treasury
    const SHORT_WHALE = "0xf322942f644a996a617bd29c16bd7d231d9f35e9"; // Venus Treasury (for ETH)

    // Oracles
    const REDSTONE_ORACLE = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";
    const CHAINLINK_ORACLE_ADDRESS = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
    const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";

    // Minimal inline ABIs for E2E tests
    const ERC20_ABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function balanceOf(address account) view returns (uint256)",
    ];

    let saltCounter = 0;
    let comptroller: Contract;
    let dsa: Contract;
    let shortVToken: Contract;
    let dsaVToken: Contract;
    let alice: any;
    let bob: any;

    /**
     * Creates manipulated swap data for deterministic testing.
     * Funds SwapHelper with output tokens and encodes a signed multicall
     * that transfers them to the recipient (no real DEX swap).
     */
    async function getManipulatedSwapData(
      tokenIn: string,
      tokenOut: string,
      amountIn: BigNumber,
      amountOut: BigNumber,
      recipient: string,
      tokenOutWhaleOverride?: string,
    ): Promise<string> {
      const swapSignerWallet = new Wallet(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        ethers.provider,
      );
      const swapHelperContract = new ethers.Contract(SWAP_HELPER_ADDRESS, SWAP_HELPER_ABI, ethers.provider);

      const swapHelperOwner = await swapHelperContract.owner();
      const impersonatedOwner = await initMainnetUser(swapHelperOwner, ethers.utils.parseEther("1"));
      await swapHelperContract.connect(impersonatedOwner).setBackendSigner(swapSignerWallet.address);

      const domain = await swapHelperContract.eip712Domain();
      const network = await ethers.provider.getNetwork();
      const eip712Domain = {
        name: domain.name,
        version: domain.version,
        chainId: network.chainId,
        verifyingContract: domain.verifyingContract,
      };

      const TEN_YEARS_SECS = 10 * 365 * 24 * 60 * 60;
      const deadline = Math.floor(Date.now() / 1000) + TEN_YEARS_SECS;

      // Fund SwapHelper with tokenOut
      const tokenOutContract = new ethers.Contract(tokenOut, ERC20_ABI, ethers.provider);
      const tokenOutWhale = tokenOutWhaleOverride ?? tokenOut;
      const whaleSigner = await initMainnetUser(tokenOutWhale, ethers.utils.parseEther("1"));
      await tokenOutContract.connect(whaleSigner).transfer(SWAP_HELPER_ADDRESS, amountOut);

      // Encode transfer: SwapHelper sends tokenOut to recipient
      const tokenOutIface = new ethers.utils.Interface([
        "function transfer(address to, uint256 amount) returns (bool)",
      ]);
      const transferCalldata = tokenOutIface.encodeFunctionData("transfer", [recipient, amountOut]);

      const swapHelperIface = swapHelperContract.interface;
      const calls: string[] = [];
      calls.push(swapHelperIface.encodeFunctionData("genericCall", [tokenOut, transferCalldata]));

      const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256"], [++saltCounter]));

      const types = {
        Multicall: [
          { name: "caller", type: "address" },
          { name: "calls", type: "bytes[]" },
          { name: "deadline", type: "uint256" },
          { name: "salt", type: "bytes32" },
        ],
      };

      const value = { caller: recipient, calls, deadline, salt };
      const signature = await swapSignerWallet._signTypedData(eip712Domain, types, value);

      return swapHelperIface.encodeFunctionData("multicall", [calls, deadline, salt, signature]);
    }

    /**
     * Configures oracle stale periods so price feeds don't revert during fork tests.
     */
    async function setMaxStalePeriod() {
      const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
      const chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE_ADDRESS, CHAINLINK_ORACLE_ABI, timelock);
      const redStoneOracle = new ethers.Contract(REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
      const binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, timelock);

      const ONE_YEAR = "31536000";
      const tokens = [
        {
          asset: DSA_ADDRESS,
          chainlinkFeed: "0x51597f405303C4377E36123cBc172b13269EA163",
          redstoneFeed: "0xeA2511205b959548459A01e358E0A30424dc0B70",
          binanceSymbol: "USDC",
        },
        {
          asset: LONG_ADDRESS,
          chainlinkFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
          redstoneFeed: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
          binanceSymbol: "WBNB",
        },
        {
          asset: SHORT_ADDRESS,
          chainlinkFeed: "0xe48a5Fd74d4A5524D76960ef3B52204C0e11fCD1",
          redstoneFeed: "0x9cF19D284862A66378c304ACAcB0E857EBc3F856",
          binanceSymbol: "ETH",
        },
      ];

      for (const token of tokens) {
        await chainlinkOracle.setTokenConfig({
          asset: token.asset,
          feed: token.chainlinkFeed,
          maxStalePeriod: ONE_YEAR,
        });
        await redStoneOracle.setTokenConfig({
          asset: token.asset,
          feed: token.redstoneFeed,
          maxStalePeriod: ONE_YEAR,
        });
        await binanceOracle.setMaxStalePeriod(token.binanceSymbol, ONE_YEAR);
      }
      await binanceOracle.setMaxStalePeriod("BNB", ONE_YEAR);
    }

    /**
     * Manipulates the oracle price for an asset by configuring ResilientOracle to use
     * only Chainlink as main oracle and calling setDirectPrice on the Chainlink oracle.
     */
    async function setOraclePrice(asset: string, price: BigNumber): Promise<void> {
      const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      const resilientOracleAddr = await comptroller.oracle();

      const resilientOracle = new ethers.Contract(resilientOracleAddr, RESILIENT_ORACLE_ABI, timelock);

      await resilientOracle.setTokenConfig({
        asset,
        oracles: [CHAINLINK_ORACLE_ADDRESS, ethers.constants.AddressZero, ethers.constants.AddressZero],
        enableFlagsForOracles: [true, false, false],
        cachingEnabled: false,
      });

      const chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE_ADDRESS, CHAINLINK_ORACLE_ABI, timelock);
      await chainlinkOracle.setDirectPrice(asset, price);
    }

    before(async function () {
      [, alice, bob] = await ethers.getSigners();

      // Setup oracle stale periods
      await setMaxStalePeriod();
      comptroller = await ethers.getContractAt(FLASHLOAN_FACET_ABI, bscmainnet.UNITROLLER);

      // Setup token contracts
      dsa = new ethers.Contract(DSA_ADDRESS, ERC20_ABI, ethers.provider);
      shortVToken = new ethers.Contract(vSHORT_ADDRESS, VTOKEN_ABI, ethers.provider);
      dsaVToken = new ethers.Contract(vDSA_ADDRESS, VTOKEN_ABI, ethers.provider);
    });

    it("close with profit", async function () {
      const INITIAL_PRINCIPAL = ethers.utils.parseEther("9000");
      const SHORT_AMOUNT = ethers.utils.parseEther("4"); // 4 ETH
      const LONG_AMOUNT = ethers.utils.parseEther("30"); // 30 WBNB
      const leverage = ethers.utils.parseEther("1.5");
      const closeFractionBps = 10000; // Full close

      // Fund Alice with USDC (DSA)
      const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
      await dsa.connect(whaleSigner).transfer(alice.address, INITIAL_PRINCIPAL);
      await dsa.connect(alice).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

      // Open position with manipulated swap (SHORT -> LONG)
      const minLong = LONG_AMOUNT.mul(98).div(100);
      const openSwapData = await getManipulatedSwapData(
        SHORT_ADDRESS,
        LONG_ADDRESS,
        SHORT_AMOUNT,
        LONG_AMOUNT,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
        vLONG_ADDRESS, // vWBNB holds WBNB
      );

      await relativePositionManager
        .connect(alice)
        .activateAndOpenPosition(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          0,
          INITIAL_PRINCIPAL,
          leverage,
          SHORT_AMOUNT,
          minLong,
          openSwapData,
        );

      // Verify position is active
      const position = await relativePositionManager.getPosition(alice.address, vLONG_ADDRESS, vSHORT_ADDRESS);
      expect(position.isActive).to.eq(true);
      const positionAccount = position.positionAccount;

      // Record state after open
      const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterOpen = await relativePositionManager.callStatic.getLongCollateralBalance(
        alice.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      expect(shortDebtAfterOpen).to.be.gt(0, "Should have short debt");
      expect(longBalanceAfterOpen).to.be.gt(0, "Should have long collateral");

      // Close with profit: favorable price — use 75% of long to repay all debt, 25% is profit
      const longForRepay = longBalanceAfterOpen.mul(75).div(100);
      const longForProfit = longBalanceAfterOpen.sub(longForRepay);

      const shortRepayAmount = shortDebtAfterOpen.mul(FULL_CLOSE_BUFFER_BPS).div(1000);

      const repaySwapData = await getManipulatedSwapData(
        LONG_ADDRESS,
        SHORT_ADDRESS,
        longForRepay,
        shortRepayAmount,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
      );

      // Profit: LONG -> DSA (goes to RPM, then supplied as principal)
      const estimatedProfitDsa = longForProfit.mul(500); // ~7.5 WBNB * 500 USDC/WBNB ≈ 3750 USDC
      const profitSwapData = await getManipulatedSwapData(
        LONG_ADDRESS,
        DSA_ADDRESS,
        longForProfit,
        estimatedProfitDsa,
        RELATIVE_POSITION_MANAGER, // RPM receives profit, supplies as principal
      );

      const dsaUnderlyingBefore = await dsaVToken.callStatic.balanceOfUnderlying(positionAccount);

      await relativePositionManager.connect(alice).closeWithProfit(
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
        closeFractionBps,
        longForRepay, // longAmountToRedeemForRepay
        shortRepayAmount, // minAmountOutRepay
        repaySwapData,
        longForProfit, // longAmountToRedeemForProfit
        estimatedProfitDsa.mul(98).div(100), // minAmountOutProfit
        profitSwapData,
      );

      // Verify full close
      const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterClose = await relativePositionManager.callStatic.getLongCollateralBalance(
        alice.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );
      const dsaUnderlyingAfter = await dsaVToken.callStatic.balanceOfUnderlying(positionAccount);

      expect(shortDebtAfterClose).to.eq(0, "All debt repaid");
      expect(longBalanceAfterClose).to.eq(0, "All long redeemed");

      const dsaUnderlyingIncrease = dsaUnderlyingAfter.sub(dsaUnderlyingBefore);
      expect(dsaUnderlyingIncrease).to.be.closeTo(
        estimatedProfitDsa,
        ethers.utils.parseEther("1"), // small tolerance for interest accrual
        "DSA increase ~= profit from swap",
      );

      const positionAfterClose = await relativePositionManager.getPosition(
        alice.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );
      expect(positionAfterClose.isActive).to.eq(true);
    });

    it("close with loss", async function () {
      const INITIAL_PRINCIPAL = ethers.utils.parseEther("15000");
      const SHORT_AMOUNT = ethers.utils.parseEther("3"); // 3 ETH
      const LONG_AMOUNT = ethers.utils.parseEther("25"); // 25 WBNB
      const leverage = ethers.utils.parseEther("3");
      const closeFractionBps = 10000; // Full close

      // Fund Bob with USDC (DSA)
      const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
      await dsa.connect(whaleSigner).transfer(bob.address, INITIAL_PRINCIPAL);
      await dsa.connect(bob).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

      // Open position
      const minLong = LONG_AMOUNT.mul(98).div(100);
      const openSwapData = await getManipulatedSwapData(
        SHORT_ADDRESS,
        LONG_ADDRESS,
        SHORT_AMOUNT,
        LONG_AMOUNT,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
        vLONG_ADDRESS,
      );

      await relativePositionManager
        .connect(bob)
        .activateAndOpenPosition(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          0,
          INITIAL_PRINCIPAL,
          leverage,
          SHORT_AMOUNT,
          minLong,
          openSwapData,
        );

      const position = await relativePositionManager.getPosition(bob.address, vLONG_ADDRESS, vSHORT_ADDRESS);
      expect(position.isActive).to.eq(true);
      const positionAccount = position.positionAccount;

      const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterOpen = await relativePositionManager.callStatic.getLongCollateralBalance(
        bob.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      // Simulate 20% loss: swapping all LONG (~25 WBNB) only gets 80% of SHORT (ETH) needed
      const shortAmountFromLongSwap = shortDebtAfterOpen.mul(80).div(100); // 80% of ETH debt
      const shortfall = shortDebtAfterOpen.sub(shortAmountFromLongSwap); // 20% ETH shortfall

      // First swap: LONG -> SHORT (all WBNB -> ETH, but 20% short)
      const firstSwapData = await getManipulatedSwapData(
        LONG_ADDRESS,
        SHORT_ADDRESS,
        longBalanceAfterOpen,
        shortAmountFromLongSwap,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
      );

      // Second swap: DSA -> SHORT (25% of USDC principal -> ETH to cover shortfall)
      const dsaAmountToSwap = INITIAL_PRINCIPAL.mul(25).div(100); // 3750 USDC
      const shortFromDsaSwap = shortfall.mul(FULL_CLOSE_BUFFER_BPS).div(1000);

      const secondSwapData = await getManipulatedSwapData(
        DSA_ADDRESS,
        SHORT_ADDRESS,
        dsaAmountToSwap,
        shortFromDsaSwap,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
      );

      const dsaUnderlyingBefore = await dsaVToken.callStatic.balanceOfUnderlying(positionAccount);

      await relativePositionManager.connect(bob).closeWithLoss(
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
        closeFractionBps,
        longBalanceAfterOpen, // longAmountToRedeemForFirstSwap
        shortAmountFromLongSwap, // shortAmountToRepayForFirstSwap
        shortAmountFromLongSwap, // minAmountOutFirstSwap
        firstSwapData,
        dsaAmountToSwap, // dsaAmountToRedeemForSecondSwap
        shortFromDsaSwap, // minAmountOutSecondSwap
        secondSwapData,
      );

      // Verify full close
      const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterClose = await relativePositionManager.callStatic.getLongCollateralBalance(
        bob.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      expect(shortDebtAfterClose).to.eq(0, "All debt repaid");
      expect(longBalanceAfterClose).to.eq(0, "All long redeemed");

      // Verify DSA principal decreased by ~dsaAmountToSwap (~3750 USDC used to cover loss)
      const dsaUnderlyingAfter = await dsaVToken.callStatic.balanceOfUnderlying(positionAccount);
      const dsaUnderlyingDecrease = dsaUnderlyingBefore.sub(dsaUnderlyingAfter);
      expect(dsaUnderlyingDecrease).to.be.closeTo(
        dsaAmountToSwap, // ~3750 USDC redeemed from principal to cover ETH shortfall
        ethers.utils.parseEther("1"), // small tolerance for interest accrual
        "DSA principal decreased ~= USDC used to cover loss",
      );

      // Deactivate and verify principal withdrawal
      await relativePositionManager.connect(bob).deactivatePosition(vLONG_ADDRESS, vSHORT_ADDRESS);
      const positionAfter = await relativePositionManager.getPosition(bob.address, vLONG_ADDRESS, vSHORT_ADDRESS);
      expect(positionAfter.isActive).to.eq(false);
    });

    it("closeWithProfitAndDeactivate", async function () {
      const [, , , , , , , , profitDeactUser] = await ethers.getSigners();
      const INITIAL_PRINCIPAL = ethers.utils.parseEther("9000");
      const SHORT_AMOUNT = ethers.utils.parseEther("4"); // 4 ETH
      const LONG_AMOUNT = ethers.utils.parseEther("30"); // 30 WBNB
      const leverage = ethers.utils.parseEther("1.5");

      // Fund user with USDC (DSA)
      const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
      await dsa.connect(whaleSigner).transfer(profitDeactUser.address, INITIAL_PRINCIPAL);
      await dsa.connect(profitDeactUser).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

      // Open position with manipulated swap (SHORT -> LONG)
      const minLong = LONG_AMOUNT.mul(98).div(100);
      const openSwapData = await getManipulatedSwapData(
        SHORT_ADDRESS,
        LONG_ADDRESS,
        SHORT_AMOUNT,
        LONG_AMOUNT,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
        vLONG_ADDRESS,
      );

      await relativePositionManager
        .connect(profitDeactUser)
        .activateAndOpenPosition(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          0,
          INITIAL_PRINCIPAL,
          leverage,
          SHORT_AMOUNT,
          minLong,
          openSwapData,
        );

      // Verify position is active
      const position = await relativePositionManager.getPosition(
        profitDeactUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );
      expect(position.isActive).to.eq(true);
      const positionAccount = position.positionAccount;

      // Record state after open
      const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterOpen = await relativePositionManager.callStatic.getLongCollateralBalance(
        profitDeactUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      expect(shortDebtAfterOpen).to.be.gt(0, "Should have short debt");
      expect(longBalanceAfterOpen).to.be.gt(0, "Should have long collateral");

      // Close with profit: favorable price — use 75% of long to repay all debt, 25% is profit
      const longForRepay = longBalanceAfterOpen.mul(75).div(100);
      const longForProfit = longBalanceAfterOpen.sub(longForRepay);

      const shortRepayAmount = shortDebtAfterOpen.mul(FULL_CLOSE_BUFFER_BPS).div(1000);

      const repaySwapData = await getManipulatedSwapData(
        LONG_ADDRESS,
        SHORT_ADDRESS,
        longForRepay,
        shortRepayAmount,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
      );

      // Profit: LONG -> DSA (goes to RPM, then supplied as principal)
      const estimatedProfitDsa = longForProfit.mul(500); // ~7.5 WBNB * 500 USDC/WBNB ≈ 3750 USDC
      const profitSwapData = await getManipulatedSwapData(
        LONG_ADDRESS,
        DSA_ADDRESS,
        longForProfit,
        estimatedProfitDsa,
        RELATIVE_POSITION_MANAGER, // RPM receives profit, supplies as principal
      );

      const dsaBalanceBefore = await dsa.balanceOf(profitDeactUser.address);

      // Execute atomic close + deactivate
      await relativePositionManager
        .connect(profitDeactUser)
        .closeWithProfitAndDeactivate(vLONG_ADDRESS, vSHORT_ADDRESS, {
          longAmountToRedeemForRepay: longForRepay,
          minAmountOutRepay: shortRepayAmount,
          swapDataRepay: repaySwapData,
          longAmountToRedeemForProfit: longForProfit,
          minAmountOutProfit: estimatedProfitDsa.mul(98).div(100),
          swapDataProfit: profitSwapData,
        });

      // Verify full close
      const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterClose = await relativePositionManager.callStatic.getLongCollateralBalance(
        profitDeactUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      expect(shortDebtAfterClose).to.eq(0, "All debt repaid");
      expect(longBalanceAfterClose).to.eq(0, "All long redeemed");

      // Position should be deactivated and principal returned to user
      const positionAfterClose = await relativePositionManager.getPosition(
        profitDeactUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );
      expect(positionAfterClose.isActive).to.eq(false, "Position should be deactivated");

      // All position account balances should be zeroed
      expect(await dsaVToken.callStatic.balanceOfUnderlying(positionAccount)).to.eq(0, "DSA balance zeroed");

      // User should have received principal + profit
      const dsaBalanceAfter = await dsa.balanceOf(profitDeactUser.address);
      expect(dsaBalanceAfter).to.be.gt(dsaBalanceBefore, "User received DSA tokens back");
    });

    it("closeWithLossAndDeactivate", async function () {
      const [, , , , , , , , , lossDeactUser] = await ethers.getSigners();
      const INITIAL_PRINCIPAL = ethers.utils.parseEther("15000");
      const SHORT_AMOUNT = ethers.utils.parseEther("3"); // 3 ETH
      const LONG_AMOUNT = ethers.utils.parseEther("25"); // 25 WBNB
      const leverage = ethers.utils.parseEther("3");

      // Fund user with USDC (DSA)
      const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
      await dsa.connect(whaleSigner).transfer(lossDeactUser.address, INITIAL_PRINCIPAL);
      await dsa.connect(lossDeactUser).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

      // Open position
      const minLong = LONG_AMOUNT.mul(98).div(100);
      const openSwapData = await getManipulatedSwapData(
        SHORT_ADDRESS,
        LONG_ADDRESS,
        SHORT_AMOUNT,
        LONG_AMOUNT,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
        vLONG_ADDRESS,
      );

      await relativePositionManager
        .connect(lossDeactUser)
        .activateAndOpenPosition(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          0,
          INITIAL_PRINCIPAL,
          leverage,
          SHORT_AMOUNT,
          minLong,
          openSwapData,
        );

      const position = await relativePositionManager.getPosition(lossDeactUser.address, vLONG_ADDRESS, vSHORT_ADDRESS);
      expect(position.isActive).to.eq(true);
      const positionAccount = position.positionAccount;

      const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterOpen = await relativePositionManager.callStatic.getLongCollateralBalance(
        lossDeactUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      // Simulate 20% loss: swapping all LONG only gets 80% of SHORT needed
      const shortAmountFromLongSwap = shortDebtAfterOpen.mul(80).div(100);
      const shortfall = shortDebtAfterOpen.sub(shortAmountFromLongSwap);

      // First swap: LONG -> SHORT (all WBNB -> ETH, but 20% short)
      const firstSwapData = await getManipulatedSwapData(
        LONG_ADDRESS,
        SHORT_ADDRESS,
        longBalanceAfterOpen,
        shortAmountFromLongSwap,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
      );

      // Second swap: DSA -> SHORT (25% of USDC principal -> ETH to cover shortfall)
      const dsaAmountToSwap = INITIAL_PRINCIPAL.mul(25).div(100); // 3750 USDC
      const shortFromDsaSwap = shortfall.mul(FULL_CLOSE_BUFFER_BPS).div(1000);

      const secondSwapData = await getManipulatedSwapData(
        DSA_ADDRESS,
        SHORT_ADDRESS,
        dsaAmountToSwap,
        shortFromDsaSwap,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
      );

      const dsaBalanceBefore = await dsa.balanceOf(lossDeactUser.address);

      // Execute atomic close + deactivate
      await relativePositionManager.connect(lossDeactUser).closeWithLossAndDeactivate(vLONG_ADDRESS, vSHORT_ADDRESS, {
        longAmountToRedeemForFirstSwap: longBalanceAfterOpen,
        shortAmountToRepayForFirstSwap: shortAmountFromLongSwap,
        minAmountOutFirst: shortAmountFromLongSwap,
        swapDataFirst: firstSwapData,
        dsaAmountToRedeemForSecondSwap: dsaAmountToSwap,
        minAmountOutSecond: shortFromDsaSwap,
        swapDataSecond: secondSwapData,
      });

      // Verify full close
      const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterClose = await relativePositionManager.callStatic.getLongCollateralBalance(
        lossDeactUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      expect(shortDebtAfterClose).to.eq(0, "All debt repaid");
      expect(longBalanceAfterClose).to.eq(0, "All long redeemed");

      // Position should be deactivated and remaining principal returned to user
      const positionAfterClose = await relativePositionManager.getPosition(
        lossDeactUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );
      expect(positionAfterClose.isActive).to.eq(false, "Position should be deactivated");

      // All position account balances should be zeroed
      expect(await dsaVToken.callStatic.balanceOfUnderlying(positionAccount)).to.eq(0, "DSA balance zeroed");

      // User should have received remaining principal (reduced by loss)
      const dsaBalanceAfter = await dsa.balanceOf(lossDeactUser.address);
      expect(dsaBalanceAfter).to.be.gt(dsaBalanceBefore, "User received remaining DSA tokens back");
    });

    it("scale position (increase leverage)", async function () {
      const [, , , , , scaleUser] = await ethers.getSigners();
      const INITIAL_PRINCIPAL = ethers.utils.parseEther("10000");
      const SHORT_AMOUNT = ethers.utils.parseEther("4"); // 4 ETH
      const LONG_AMOUNT = ethers.utils.parseEther("30"); // 30 WBNB
      const leverage = ethers.utils.parseEther("1.5");

      // Fund and open position
      const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
      await dsa
        .connect(whaleSigner)
        .transfer(scaleUser.address, INITIAL_PRINCIPAL.add(ethers.utils.parseEther("5000")));
      await dsa
        .connect(scaleUser)
        .approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL.add(ethers.utils.parseEther("5000")));

      const openSwapData = await getManipulatedSwapData(
        SHORT_ADDRESS,
        LONG_ADDRESS,
        SHORT_AMOUNT,
        LONG_AMOUNT,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
        vLONG_ADDRESS,
      );

      await relativePositionManager
        .connect(scaleUser)
        .activateAndOpenPosition(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          0,
          INITIAL_PRINCIPAL,
          leverage,
          SHORT_AMOUNT,
          LONG_AMOUNT.mul(98).div(100),
          openSwapData,
        );

      const position = await relativePositionManager.getPosition(scaleUser.address, vLONG_ADDRESS, vSHORT_ADDRESS);
      const positionAccount = position.positionAccount;

      const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterOpen = await relativePositionManager.callStatic.getLongCollateralBalance(
        scaleUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      // Scale: borrow more SHORT, swap to more LONG
      const ADDITIONAL_PRINCIPAL = ethers.utils.parseEther("5000");
      const SCALE_SHORT_AMOUNT = ethers.utils.parseEther("2"); // 2 ETH
      const scaleLongAmount = ethers.utils.parseEther("18"); // 18 WBNB

      const scaleSwapData = await getManipulatedSwapData(
        SHORT_ADDRESS,
        LONG_ADDRESS,
        SCALE_SHORT_AMOUNT,
        scaleLongAmount,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
        vLONG_ADDRESS,
      );

      await relativePositionManager
        .connect(scaleUser)
        .scalePosition(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          ADDITIONAL_PRINCIPAL,
          SCALE_SHORT_AMOUNT,
          scaleLongAmount.mul(98).div(100),
          scaleSwapData,
        );

      // Validate increased debt and long balance
      const shortDebtAfterScale = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterScale = await relativePositionManager.callStatic.getLongCollateralBalance(
        scaleUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      // Total debt should be ~6 ETH (4 initial + 2 scaled)
      const expectedTotalDebt = shortDebtAfterOpen.add(SCALE_SHORT_AMOUNT);
      expect(shortDebtAfterScale).to.be.closeTo(
        expectedTotalDebt,
        ethers.utils.parseEther("0.1"), // small tolerance for interest accrual
        "Debt ~= initial + scale ETH borrowed",
      );

      // Total long should be ~48 WBNB (30 initial + 18 scaled)
      const expectedTotalLong = longBalanceAfterOpen.add(scaleLongAmount);
      expect(longBalanceAfterScale).to.be.closeTo(
        expectedTotalLong,
        ethers.utils.parseEther("1"), // small tolerance for interest/rounding
        "Long ~= initial + scale WBNB collateral",
      );

      const positionAfterScale = await relativePositionManager.getPosition(
        scaleUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );
      expect(positionAfterScale.isActive).to.eq(true);
    });

    it("partial close with profit (50%)", async function () {
      const [, , , , , , partialUser] = await ethers.getSigners();
      const INITIAL_PRINCIPAL = ethers.utils.parseEther("9000");
      const SHORT_AMOUNT = ethers.utils.parseEther("4"); // 4 ETH
      const LONG_AMOUNT = ethers.utils.parseEther("30"); // 30 WBNB
      const leverage = ethers.utils.parseEther("1.5");
      const closeFractionBps = 5000; // 50% partial close

      // Fund and open position
      const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
      await dsa.connect(whaleSigner).transfer(partialUser.address, INITIAL_PRINCIPAL);
      await dsa.connect(partialUser).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

      const openSwapData = await getManipulatedSwapData(
        SHORT_ADDRESS,
        LONG_ADDRESS,
        SHORT_AMOUNT,
        LONG_AMOUNT,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
        vLONG_ADDRESS,
      );

      await relativePositionManager
        .connect(partialUser)
        .activateAndOpenPosition(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          0,
          INITIAL_PRINCIPAL,
          leverage,
          SHORT_AMOUNT,
          LONG_AMOUNT.mul(98).div(100),
          openSwapData,
        );

      const position = await relativePositionManager.getPosition(partialUser.address, vLONG_ADDRESS, vSHORT_ADDRESS);
      const positionAccount = position.positionAccount;

      const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterOpen = await relativePositionManager.callStatic.getLongCollateralBalance(
        partialUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      // Proportional amounts based on close fraction
      const expectedLongToRedeem = longBalanceAfterOpen.mul(closeFractionBps).div(10000);
      const expectedShortToRepay = shortDebtAfterOpen.mul(closeFractionBps).div(10000);

      // Favorable price: 80% of redeemed WBNB covers ETH repay, 20% is profit
      const longForRepay = expectedLongToRedeem.mul(80).div(100);
      const longForProfit = expectedLongToRedeem.sub(longForRepay); // ~20% of 50% = ~3 WBNB

      const shortRepayAmount = expectedShortToRepay.mul(PARTIAL_CLOSE_BUFFER_BPS).div(1000);

      const repaySwapData = await getManipulatedSwapData(
        LONG_ADDRESS,
        SHORT_ADDRESS,
        longForRepay,
        shortRepayAmount,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
      );

      // Profit: ~3 WBNB * 500 USDC/WBNB ≈ 1500 USDC
      const estimatedProfitDsa = longForProfit.mul(500);
      const profitSwapData = await getManipulatedSwapData(
        LONG_ADDRESS,
        DSA_ADDRESS,
        longForProfit,
        estimatedProfitDsa,
        RELATIVE_POSITION_MANAGER,
      );

      const dsaUnderlyingBefore = await dsaVToken.callStatic.balanceOfUnderlying(positionAccount);

      await relativePositionManager
        .connect(partialUser)
        .closeWithProfit(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          closeFractionBps,
          longForRepay,
          shortRepayAmount,
          repaySwapData,
          longForProfit,
          estimatedProfitDsa.mul(98).div(100),
          profitSwapData,
        );

      const dsaUnderlyingAfter = await dsaVToken.callStatic.balanceOfUnderlying(positionAccount);
      const dsaUnderlyingIncrease = dsaUnderlyingAfter.sub(dsaUnderlyingBefore);
      expect(dsaUnderlyingIncrease).to.be.closeTo(
        estimatedProfitDsa,
        ethers.utils.parseEther("1"), // small tolerance for interest accrual
        "DSA increase ~= profit from swap",
      );

      // Remaining balances should be ~50% of initial
      const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterClose = await relativePositionManager.callStatic.getLongCollateralBalance(
        partialUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      // ~50% of ~4 ETH debt remaining ≈ 2 ETH
      const expectedRemainingDebt = shortDebtAfterOpen.mul(10000 - closeFractionBps).div(10000);
      expect(shortDebtAfterClose).to.be.closeTo(
        expectedRemainingDebt,
        ethers.utils.parseEther("0.1"), // small tolerance for interest accrual
        "~50% ETH debt remaining",
      );

      // ~50% of ~30 WBNB remaining ≈ 15 WBNB
      const expectedRemainingLong = longBalanceAfterOpen.mul(10000 - closeFractionBps).div(10000);
      expect(longBalanceAfterClose).to.be.closeTo(
        expectedRemainingLong,
        ethers.utils.parseEther("1"), // small tolerance for interest/rounding
        "~50% WBNB collateral remaining",
      );

      // Position should still be active after partial close
      expect(shortDebtAfterClose).to.be.gt(0, "Debt should remain after partial close");
      expect(longBalanceAfterClose).to.be.gt(0, "Long should remain after partial close");

      const positionAfterClose = await relativePositionManager.getPosition(
        partialUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );
      expect(positionAfterClose.isActive).to.eq(true, "Position stays active after partial close");
    });

    it("close with profit when LONG = DSA", async function () {
      const [, , , , carol] = await ethers.getSigners();
      const INITIAL_PRINCIPAL = ethers.utils.parseEther("10000");
      const SHORT_AMOUNT = ethers.utils.parseEther("1"); // 1 ETH
      const LONG_AMOUNT = ethers.utils.parseEther("4000"); // 4000 USDC (LONG = DSA)
      const leverage = ethers.utils.parseEther("2");
      const closeFractionBps = 10000; // Full close

      // Fund Carol with USDC (DSA)
      const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
      await dsa.connect(whaleSigner).transfer(carol.address, INITIAL_PRINCIPAL);
      await dsa.connect(carol).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

      // Open position: LONG = DSA (vDSA_ADDRESS used as long vToken)
      const minLong = LONG_AMOUNT.mul(98).div(100);
      const openSwapData = await getManipulatedSwapData(
        SHORT_ADDRESS,
        DSA_ADDRESS, // LONG = DSA
        SHORT_AMOUNT,
        LONG_AMOUNT,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
      );

      await relativePositionManager.connect(carol).activateAndOpenPosition(
        vDSA_ADDRESS, // vLong = vDSA (LONG == DSA)
        vSHORT_ADDRESS,
        0,
        INITIAL_PRINCIPAL,
        leverage,
        SHORT_AMOUNT,
        minLong,
        openSwapData,
      );

      const position = await relativePositionManager.getPosition(carol.address, vDSA_ADDRESS, vSHORT_ADDRESS);
      expect(position.isActive).to.eq(true);
      const positionAccount = position.positionAccount;

      const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterOpen = await relativePositionManager.callStatic.getLongCollateralBalance(
        carol.address,
        vDSA_ADDRESS,
        vSHORT_ADDRESS,
      );

      expect(shortDebtAfterOpen).to.be.gt(0, "Should have short debt");
      expect(longBalanceAfterOpen).to.be.gt(0, "Should have long collateral");

      // Close with profit: 80% of USDC collateral for ETH repay, 20% (~800 USDC) as profit
      const longForRepay = longBalanceAfterOpen.mul(80).div(100);
      const longForProfit = longBalanceAfterOpen.sub(longForRepay); // ~800 USDC (20% of ~4000)

      const shortRepayAmount = shortDebtAfterOpen.mul(FULL_CLOSE_BUFFER_BPS).div(1000);

      const repaySwapData = await getManipulatedSwapData(
        DSA_ADDRESS, // LONG = DSA, swap USDC -> ETH
        SHORT_ADDRESS,
        longForRepay,
        shortRepayAmount,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
        SHORT_WHALE,
      );

      // Track principal balance before close (handles LONG=DSA internally)
      const principalBefore = await relativePositionManager.callStatic.getSuppliedPrincipalBalance(
        carol.address,
        vDSA_ADDRESS,
        vSHORT_ADDRESS,
      );

      // When LONG = DSA, profit swap is "0x" — no swap needed, redeemed long tokens ARE DSA tokens
      await relativePositionManager.connect(carol).closeWithProfit(
        vDSA_ADDRESS, // vLong = vDSA
        vSHORT_ADDRESS,
        closeFractionBps,
        longForRepay,
        shortRepayAmount,
        repaySwapData,
        longForProfit,
        0, // minAmountOutProfit = 0 (no swap)
        "0x", // No swap needed — LONG is already DSA
      );

      // Verify full close
      const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterClose = await relativePositionManager.callStatic.getLongCollateralBalance(
        carol.address,
        vDSA_ADDRESS,
        vSHORT_ADDRESS,
      );

      expect(shortDebtAfterClose).to.eq(0, "All debt repaid");
      expect(longBalanceAfterClose).to.eq(0, "All long redeemed");

      // Principal should increase by ~longForProfit (~800 USDC, no swap needed — redeemed LONG IS DSA)
      const principalAfter = await relativePositionManager.callStatic.getSuppliedPrincipalBalance(
        carol.address,
        vDSA_ADDRESS,
        vSHORT_ADDRESS,
      );
      const principalIncrease = principalAfter.sub(principalBefore);
      expect(principalIncrease).to.be.closeTo(
        longForProfit, // ~800 USDC (LONG = DSA, profit IS the redeemed USDC)
        ethers.utils.parseEther("1"), // small tolerance for interest accrual
        "Principal increase ~= profit (no swap needed)",
      );
    });

    it("deactivate position after full close withdraws principal", async function () {
      const [, , , , , , , deactivateUser] = await ethers.getSigners();
      const INITIAL_PRINCIPAL = ethers.utils.parseEther("8000");
      const SHORT_AMOUNT = ethers.utils.parseEther("3"); // 3 ETH
      const LONG_AMOUNT = ethers.utils.parseEther("25"); // 25 WBNB
      const leverage = ethers.utils.parseEther("1.5");
      const closeFractionBps = 10000; // Full close

      // Fund and open position
      const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
      await dsa.connect(whaleSigner).transfer(deactivateUser.address, INITIAL_PRINCIPAL);
      await dsa.connect(deactivateUser).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

      const openSwapData = await getManipulatedSwapData(
        SHORT_ADDRESS,
        LONG_ADDRESS,
        SHORT_AMOUNT,
        LONG_AMOUNT,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
        vLONG_ADDRESS,
      );

      await relativePositionManager
        .connect(deactivateUser)
        .activateAndOpenPosition(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          0,
          INITIAL_PRINCIPAL,
          leverage,
          SHORT_AMOUNT,
          LONG_AMOUNT.mul(98).div(100),
          openSwapData,
        );

      const position = await relativePositionManager.getPosition(deactivateUser.address, vLONG_ADDRESS, vSHORT_ADDRESS);
      expect(position.isActive).to.eq(true);
      const positionAccount = position.positionAccount;

      const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterOpen = await relativePositionManager.callStatic.getLongCollateralBalance(
        deactivateUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );

      // Close with profit: 75% WBNB for ETH repay, 25% as profit
      const longForRepay = longBalanceAfterOpen.mul(75).div(100);
      const longForProfit = longBalanceAfterOpen.sub(longForRepay); // ~6.25 WBNB (25% of ~25)
      const shortRepayAmount = shortDebtAfterOpen.mul(FULL_CLOSE_BUFFER_BPS).div(1000);

      const repaySwapData = await getManipulatedSwapData(
        LONG_ADDRESS,
        SHORT_ADDRESS,
        longForRepay,
        shortRepayAmount,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
      );

      // Profit: ~6.25 WBNB * 500 USDC/WBNB ≈ 3125 USDC
      const estimatedProfitDsa = longForProfit.mul(500);
      const profitSwapData = await getManipulatedSwapData(
        LONG_ADDRESS,
        DSA_ADDRESS,
        longForProfit,
        estimatedProfitDsa,
        RELATIVE_POSITION_MANAGER,
      );

      const dsaUnderlyingBeforeClose = await dsaVToken.callStatic.balanceOfUnderlying(positionAccount);

      await relativePositionManager
        .connect(deactivateUser)
        .closeWithProfit(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          closeFractionBps,
          longForRepay,
          shortRepayAmount,
          repaySwapData,
          longForProfit,
          estimatedProfitDsa.mul(98).div(100),
          profitSwapData,
        );

      // Verify full close — position still active
      const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterClose = await relativePositionManager.callStatic.getLongCollateralBalance(
        deactivateUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );
      expect(shortDebtAfterClose).to.eq(0, "All debt repaid");
      expect(longBalanceAfterClose).to.eq(0, "All long redeemed");

      // Verify profit ~= estimated (~3125 USDC)
      const dsaUnderlyingAfterClose = await dsaVToken.callStatic.balanceOfUnderlying(positionAccount);
      const dsaUnderlyingIncrease = dsaUnderlyingAfterClose.sub(dsaUnderlyingBeforeClose);
      expect(dsaUnderlyingIncrease).to.be.closeTo(
        estimatedProfitDsa,
        ethers.utils.parseEther("1"), // small tolerance for interest accrual
        "DSA increase ~= profit from swap",
      );

      const positionBeforeDeactivate = await relativePositionManager.getPosition(
        deactivateUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );
      expect(positionBeforeDeactivate.isActive).to.eq(true, "Position still active after close");

      // Record DSA balance before deactivation
      const dsaBalanceBefore = await dsa.balanceOf(deactivateUser.address);

      // Deactivate: withdraws remaining DSA principal to user
      await relativePositionManager.connect(deactivateUser).deactivatePosition(vLONG_ADDRESS, vSHORT_ADDRESS);

      // Verify position is inactive
      const positionAfterDeactivate = await relativePositionManager.getPosition(
        deactivateUser.address,
        vLONG_ADDRESS,
        vSHORT_ADDRESS,
      );
      expect(positionAfterDeactivate.isActive).to.eq(false, "Position deactivated");

      // Verify DSA principal withdrawn to user
      const dsaBalanceAfter = await dsa.balanceOf(deactivateUser.address);
      expect(dsaBalanceAfter).to.be.gt(dsaBalanceBefore, "User should receive DSA principal back");
    });

    it("liquidate position after price crash", async function () {
      const [, , , liquidator] = await ethers.getSigners();
      const INITIAL_PRINCIPAL = ethers.utils.parseEther("1500");
      const SHORT_AMOUNT = ethers.utils.parseEther("1.5"); // 1.5 ETH
      const LONG_AMOUNT = ethers.utils.parseEther("30"); // 30 WBNB
      const leverage = ethers.utils.parseEther("3");

      // Fund and open a highly leveraged position
      const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
      await dsa.connect(whaleSigner).transfer(liquidator.address, INITIAL_PRINCIPAL);
      // Use liquidator as the position owner for this test (separate from alice/bob)
      await dsa.connect(liquidator).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

      const openSwapData = await getManipulatedSwapData(
        SHORT_ADDRESS,
        LONG_ADDRESS,
        SHORT_AMOUNT,
        LONG_AMOUNT,
        LEVERAGE_STRATEGIES_MANAGER_ADDRESS,
        vLONG_ADDRESS,
      );

      await relativePositionManager
        .connect(liquidator)
        .activateAndOpenPosition(
          vLONG_ADDRESS,
          vSHORT_ADDRESS,
          0,
          INITIAL_PRINCIPAL,
          leverage,
          SHORT_AMOUNT,
          LONG_AMOUNT.mul(98).div(100),
          openSwapData,
        );

      const position = await relativePositionManager.getPosition(liquidator.address, vLONG_ADDRESS, vSHORT_ADDRESS);
      const positionAccount = position.positionAccount;
      const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      expect(shortDebtAfterOpen).to.be.gt(0, "Should have short debt");

      // Set liquidator contract (required by Venus Core Pool)
      const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      const comptrollerAsTimelock = new ethers.Contract(
        bscmainnet.UNITROLLER,
        ["function _setLiquidatorContract(address)"],
        timelock,
      );
      await comptrollerAsTimelock._setLiquidatorContract(alice.address); // alice acts as liquidator

      // Fund alice (liquidator role) with SHORT tokens
      const shortToken = new ethers.Contract(SHORT_ADDRESS, ERC20_ABI, ethers.provider);
      const shortWhaleSigner = await initMainnetUser(SHORT_WHALE, ethers.utils.parseEther("1"));
      await shortToken.connect(shortWhaleSigner).transfer(alice.address, ethers.utils.parseEther("10"));

      // Crash LONG (WBNB) price by 90% to make position liquidatable
      const resilientOracleAddr = await comptroller.oracle();
      const oracle = new ethers.Contract(
        resilientOracleAddr,
        ["function getPrice(address) view returns (uint256)"],
        ethers.provider,
      );
      const wbnbPrice = await oracle.getPrice(LONG_ADDRESS);
      await setOraclePrice(LONG_ADDRESS, wbnbPrice.mul(10).div(100)); // 90% drop

      // Verify position is liquidatable (shortfall > 0)
      const comptrollerForLiquidity = new ethers.Contract(
        bscmainnet.UNITROLLER,
        ["function getAccountLiquidity(address) view returns (uint256, uint256, uint256)"],
        ethers.provider,
      );
      const [, , shortfall] = await comptrollerForLiquidity.getAccountLiquidity(positionAccount);
      expect(shortfall).to.be.gt(0, "Position should be liquidatable");

      // Liquidate: repay 25% of debt, seize DSA collateral
      const repayAmount = shortDebtAfterOpen.div(4);
      await shortToken.connect(alice).approve(vSHORT_ADDRESS, repayAmount);

      const liquidatorVTokenBefore = await dsaVToken.callStatic.balanceOf(alice.address);
      const positionDsaVTokenBefore = await dsaVToken.callStatic.balanceOf(positionAccount);

      const shortVTokenWithLiquidator = new ethers.Contract(vSHORT_ADDRESS, VTOKEN_ABI, alice);
      await shortVTokenWithLiquidator.liquidateBorrow(positionAccount, repayAmount, vDSA_ADDRESS);

      // Verify liquidation: debt reduced by ~repayAmount (25% of original ETH debt)
      const shortDebtAfterLiq = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const liquidatorVTokenAfter = await dsaVToken.callStatic.balanceOf(alice.address);
      const positionDsaVTokenAfter = await dsaVToken.callStatic.balanceOf(positionAccount);

      const expectedRemainingDebt = shortDebtAfterOpen.sub(repayAmount);
      expect(shortDebtAfterLiq).to.be.closeTo(
        expectedRemainingDebt,
        ethers.utils.parseEther("0.01"), // small tolerance for interest accrual
        "Debt should decrease by repayAmount (~25% of original)",
      );

      // Verify seized vDSA collateral transferred from position to liquidator
      const seizedVTokens = liquidatorVTokenAfter.sub(liquidatorVTokenBefore);
      expect(seizedVTokens).to.be.gt(0, "Liquidator received seized vDSA tokens");
      expect(positionDsaVTokenAfter).to.be.lt(
        positionDsaVTokenBefore,
        "Position DSA collateral decreased after seizure",
      );

      // Seized amount from position should match what liquidator received (minus protocol fee)
      const positionVTokenDecrease = positionDsaVTokenBefore.sub(positionDsaVTokenAfter);
      expect(positionVTokenDecrease).to.be.gte(seizedVTokens, "Position lost >= what liquidator received");
    });
  });
});
