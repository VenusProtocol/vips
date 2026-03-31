import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip606, {
  PENDLE_MARKET_SLISBNB,
  PENDLE_PT_VAULT_ADAPTER,
  vPT_clisBNB_25JUN2026,
} from "../../vips/vip-606/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/PendlePTVaultAdapter.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

// Tokens
const SLISBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const BNB_NATIVE = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const SLISBNB_WHALE = "0x6F28FeC449dbd2056b76ac666350Af8773E03873";

// Core Pool Comptroller (Diamond)
const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

// Lista DAO Oracle (used by DynamicDutyCalculator during SY deposit/redeem)
const LISTA_RESILIENT_ORACLE = "0xf3afD82A4071f272F403dC176916141f44E6c750";
const LISTA_LISUSD = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";

// Pendle market maturity
const MATURITY = 1782345600; // 2026-06-25T00:00:00Z

// Minimal ABIs for test interactions
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function transfer(address, uint256) returns (bool)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

const COMPTROLLER_ABI = [
  "function updateDelegate(address delegate, bool approved) external",
  "function approvedDelegates(address, address) view returns (bool)",
];

const VTOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function exchangeRateStored() view returns (uint256)",
  "function underlying() view returns (address)",
  "function symbol() view returns (string)",
];

// Pendle struct builders
function defaultApproxParams(): {
  guessMin: BigNumber;
  guessMax: BigNumber;
  guessOffchain: BigNumber;
  maxIteration: BigNumber;
  eps: BigNumber;
} {
  return {
    guessMin: BigNumber.from(0),
    guessMax: ethers.constants.MaxUint256,
    guessOffchain: BigNumber.from(0),
    maxIteration: BigNumber.from(256),
    eps: parseUnits("1", 15), // 0.1% precision
  };
}

function emptyLimitOrderData(): {
  limitRouter: string;
  epsSkipMarket: BigNumber;
  normalFills: never[];
  flashFills: never[];
  optData: string;
} {
  return {
    limitRouter: ethers.constants.AddressZero,
    epsSkipMarket: BigNumber.from(0),
    normalFills: [],
    flashFills: [],
    optData: "0x",
  };
}

function emptySwapData(): { swapType: number; extRouter: string; extCalldata: string; needScale: boolean } {
  return {
    swapType: 0,
    extRouter: ethers.constants.AddressZero,
    extCalldata: "0x",
    needScale: false,
  };
}

function tokenInputNative(amount: BigNumber): {
  tokenIn: string;
  netTokenIn: BigNumber;
  tokenMintSy: string;
  pendleSwap: string;
  swapData: ReturnType<typeof emptySwapData>;
} {
  return {
    tokenIn: ethers.constants.AddressZero,
    netTokenIn: amount,
    tokenMintSy: ethers.constants.AddressZero,
    pendleSwap: ethers.constants.AddressZero,
    swapData: emptySwapData(),
  };
}

function tokenInputERC20(
  token: string,
  amount: BigNumber,
): {
  tokenIn: string;
  netTokenIn: BigNumber;
  tokenMintSy: string;
  pendleSwap: string;
  swapData: ReturnType<typeof emptySwapData>;
} {
  return {
    tokenIn: token,
    netTokenIn: amount,
    tokenMintSy: token,
    pendleSwap: ethers.constants.AddressZero,
    swapData: emptySwapData(),
  };
}

function tokenOutputSlisBNB(): {
  tokenOut: string;
  minTokenOut: BigNumber;
  tokenRedeemSy: string;
  pendleSwap: string;
  swapData: ReturnType<typeof emptySwapData>;
} {
  return {
    tokenOut: SLISBNB,
    minTokenOut: BigNumber.from(0),
    tokenRedeemSy: SLISBNB,
    pendleSwap: ethers.constants.AddressZero,
    swapData: emptySwapData(),
  };
}

forking(85953737, async () => {
  const provider = ethers.provider;
  let adapter: Contract;
  let acm: Contract;

  before(async () => {
    adapter = new ethers.Contract(PENDLE_PT_VAULT_ADAPTER, ADAPTER_ABI, provider);
    acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("pending owner should be the Normal Timelock", async () => {
      expect(await adapter.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });

    it("should have no markets registered", async () => {
      expect(await adapter.getMarketCount()).to.equal(0);
    });
  });

  testVip("VIP-606 PendlePTVaultAdapter", await vip606(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, ADAPTER_ABI],
        ["RoleGranted", "OwnershipTransferred", "MarketAdded"],
        [9, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("owner should be the Normal Timelock", async () => {
      expect(await adapter.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("pending owner should be zero address", async () => {
      expect(await adapter.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("should have 1 market registered", async () => {
      expect(await adapter.getMarketCount()).to.equal(1);
    });

    it("should have the slisBNB Pendle market in the list", async () => {
      const markets = await adapter.getAllMarkets();
      expect(markets).to.include(PENDLE_MARKET_SLISBNB);
    });

    it("market config should have correct vToken", async () => {
      const config = await adapter.markets(PENDLE_MARKET_SLISBNB);
      expect(config.vToken).to.equal(vPT_clisBNB_25JUN2026);
    });

    it("market config should have valid PT, SY, YT, and future maturity", async () => {
      const config = await adapter.markets(PENDLE_MARKET_SLISBNB);
      expect(config.pt).to.not.equal(ethers.constants.AddressZero);
      expect(config.sy).to.not.equal(ethers.constants.AddressZero);
      expect(config.yt).to.not.equal(ethers.constants.AddressZero);
      expect(config.vToken).to.equal(vPT_clisBNB_25JUN2026);
      expect(config.maturity).to.equal(MATURITY);
    });

    it("Normal Timelock should have permission to call addMarket", async () => {
      const role = ethers.utils.solidityKeccak256(
        ["address", "string"],
        [PENDLE_PT_VAULT_ADAPTER, "addMarket(address,address)"],
      );
      expect(await acm.hasRole(role, NORMAL_TIMELOCK)).to.be.true;
    });

    for (const account of [
      { name: "Normal Timelock", address: bscmainnet.NORMAL_TIMELOCK },
      { name: "Fast Track Timelock", address: bscmainnet.FAST_TRACK_TIMELOCK },
      { name: "Critical Timelock", address: bscmainnet.CRITICAL_TIMELOCK },
      { name: "Guardian", address: bscmainnet.GUARDIAN },
    ]) {
      it(`${account.name} should have permission to call pause`, async () => {
        const role = ethers.utils.solidityKeccak256(["address", "string"], [PENDLE_PT_VAULT_ADAPTER, "pause()"]);
        expect(await acm.hasRole(role, account.address)).to.be.true;
      });

      it(`${account.name} should have permission to call unpause`, async () => {
        const role = ethers.utils.solidityKeccak256(["address", "string"], [PENDLE_PT_VAULT_ADAPTER, "unpause()"]);
        expect(await acm.hasRole(role, account.address)).to.be.true;
      });
    }
  });

  // ── Oracle Staleness Fixups ─────────────────────────────────────────────
  //
  // testVip() advances block time ~72h (voting + timelock delay). This makes
  // Chainlink price feeds stale. Both Lista DAO and Venus oracles enforce
  // staleness checks that must be relaxed after time travel.

  /**
   * Increase Lista DAO ResilientOracle timeDeltaTolerance for tokens queried
   * during SY deposit/redeem (lisUSD, slisBNB, WBNB).
   */
  const increaseListaOracleTimeDeltaTolerance = async () => {
    const listaOracle = new ethers.Contract(
      LISTA_RESILIENT_ORACLE,
      [
        "function owner() view returns (address)",
        "function getTokenConfig(address) view returns (tuple(address asset, address[3] oracles, bool[3] enableFlagsForOracles, uint256 timeDeltaTolerance))",
        "function setTokenConfig(tuple(address asset, address[3] oracles, bool[3] enableFlagsForOracles, uint256 timeDeltaTolerance)) external",
      ],
      provider,
    );

    const oracleOwner = await listaOracle.owner();
    await impersonateAccount(oracleOwner);
    await setBalance(oracleOwner, parseUnits("1", 18));
    const oracleOwnerSigner = await ethers.getSigner(oracleOwner);

    const TWO_YEARS = 2 * 365 * 24 * 3600;

    const tokensToFix = [LISTA_LISUSD, SLISBNB, WBNB];

    for (const token of tokensToFix) {
      try {
        const currentConfig = await listaOracle.getTokenConfig(token);
        await listaOracle.connect(oracleOwnerSigner).setTokenConfig({
          asset: token,
          oracles: currentConfig.oracles,
          enableFlagsForOracles: currentConfig.enableFlagsForOracles,
          timeDeltaTolerance: TWO_YEARS,
        });
      } catch {
        // Token not configured in Lista's oracle -- skip
      }
    }
  };

  /**
   * Increase Venus oracle maxStalePeriod on ChainlinkOracle/BinanceOracle
   * for BNB and slisBNB so stale feeds are accepted after time travel.
   */
  const increaseVenusOracleMaxStalePeriod = async () => {
    const comptrollerContract = new ethers.Contract(UNITROLLER, ["function oracle() view returns (address)"], provider);
    const venusOracleAddr = await comptrollerContract.oracle();
    const venusOracle = new ethers.Contract(
      venusOracleAddr,
      [
        "function getTokenConfig(address) view returns (tuple(address asset, address[3] oracles, bool[3] enableFlagsForOracles, bool cachingEnabled))",
      ],
      provider,
    );

    const TWO_YEARS = 2 * 365 * 24 * 3600;

    const tokensToFix = [
      { address: BNB_NATIVE, symbol: "BNB" },
      { address: SLISBNB, symbol: "slisBNB" },
    ];

    await impersonateAccount(NORMAL_TIMELOCK);
    await setBalance(NORMAL_TIMELOCK, parseUnits("1", 18));
    const timelockSigner = await ethers.getSigner(NORMAL_TIMELOCK);

    for (const token of tokensToFix) {
      try {
        const config = await venusOracle.getTokenConfig(token.address);

        for (let i = 0; i < 3; i++) {
          const oracleAddr = config.oracles[i];
          if (oracleAddr === ethers.constants.AddressZero || !config.enableFlagsForOracles[i]) continue;

          try {
            const oracle = new ethers.Contract(
              oracleAddr,
              ["function accessControlManager() view returns (address)"],
              provider,
            );
            const acmAddr = await oracle.accessControlManager();
            const acmContract = new ethers.Contract(
              acmAddr,
              ["function giveCallPermission(address, string, address) external"],
              provider,
            );

            // Try ChainlinkOracle interface
            try {
              const chainlink = new ethers.Contract(
                oracleAddr,
                [
                  "function tokenConfigs(address) view returns (address asset, address feed, uint256 maxStalePeriod)",
                  "function setTokenConfig(tuple(address asset, address feed, uint256 maxStalePeriod)) external",
                ],
                provider,
              );
              const tokenConfig = await chainlink.tokenConfigs(token.address);
              if (tokenConfig.asset !== ethers.constants.AddressZero) {
                await acmContract
                  .connect(timelockSigner)
                  .giveCallPermission(oracleAddr, "setTokenConfig(TokenConfig)", NORMAL_TIMELOCK);
                await chainlink.connect(timelockSigner).setTokenConfig({
                  asset: token.address,
                  feed: tokenConfig.feed,
                  maxStalePeriod: TWO_YEARS,
                });
                continue;
              }
            } catch {
              // Not a ChainlinkOracle -- fall through to BinanceOracle
            }

            // Try BinanceOracle interface
            try {
              await acmContract
                .connect(timelockSigner)
                .giveCallPermission(oracleAddr, "setMaxStalePeriod(string,uint256)", NORMAL_TIMELOCK);
              const binance = new ethers.Contract(
                oracleAddr,
                ["function setMaxStalePeriod(string, uint256) external"],
                provider,
              );
              await binance.connect(timelockSigner).setMaxStalePeriod(token.symbol, TWO_YEARS);
            } catch {
              // Neither ChainlinkOracle nor BinanceOracle -- skip
            }
          } catch {
            // Oracle doesn't have accessControlManager -- skip
          }
        }
      } catch {
        // Token not configured in Venus ResilientOracle -- skip
      }
    }
  };

  const fixAllOracleStaleFeeds = async () => {
    await increaseVenusOracleMaxStalePeriod();
    await increaseListaOracleTimeDeltaTolerance();
  };

  describe("Functional: depositNative (BNB -> PT-clisBNB -> vToken)", async () => {
    let user: Signer;
    let userAddress: string;
    let vToken: Contract;

    before(async () => {
      await fixAllOracleStaleFeeds();
      const signers = await ethers.getSigners();
      user = signers[0];
      userAddress = await user.getAddress();
      vToken = new ethers.Contract(vPT_clisBNB_25JUN2026, VTOKEN_ABI, provider);
    });

    it("should deposit BNB and receive vTokens", async () => {
      const depositAmount = parseUnits("1", 18);
      const vTokenBefore = await vToken.balanceOf(userAddress);

      const tx = await adapter.connect(user).depositNative(
        PENDLE_MARKET_SLISBNB,
        0, // minPtOut
        defaultApproxParams(),
        tokenInputNative(depositAmount),
        emptyLimitOrderData(),
        { value: depositAmount },
      );
      const receipt = await tx.wait();

      const vTokenAfter = await vToken.balanceOf(userAddress);
      expect(vTokenAfter).to.be.gt(vTokenBefore);

      // Verify Deposited event
      const iface = new ethers.utils.Interface(ADAPTER_ABI);
      const depositedEvents = receipt.logs
        .map((log: { topics: string[]; data: string }) => {
          try {
            return iface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((e: { name: string } | null) => e && e.name === "Deposited");

      expect(depositedEvents.length).to.equal(1);
      expect(depositedEvents[0].args.user).to.equal(userAddress);
      expect(depositedEvents[0].args.vTokenAmount).to.be.gt(0);

      console.log(
        `    depositNative: ${ethers.utils.formatEther(depositAmount)} BNB -> ${vTokenAfter.sub(vTokenBefore)} vTokens`,
      );
    });
  });

  describe("Functional: deposit (slisBNB -> PT-clisBNB -> vToken)", async () => {
    let user: Signer;
    let userAddress: string;
    let vToken: Contract;
    let slisBNB: Contract;

    before(async () => {
      await fixAllOracleStaleFeeds();
      const signers = await ethers.getSigners();
      user = signers[1];
      userAddress = await user.getAddress();
      vToken = new ethers.Contract(vPT_clisBNB_25JUN2026, VTOKEN_ABI, provider);
      slisBNB = new ethers.Contract(SLISBNB, ERC20_ABI, provider);

      // Fund user with slisBNB from whale
      const whale = await initMainnetUser(SLISBNB_WHALE, parseUnits("1", 18));
      await slisBNB.connect(whale).transfer(userAddress, parseUnits("10", 18));
    });

    it("should deposit slisBNB and receive vTokens", async () => {
      const depositAmount = parseUnits("5", 18);
      const vTokenBefore = await vToken.balanceOf(userAddress);

      // Approve adapter to spend slisBNB
      await slisBNB.connect(user).approve(PENDLE_PT_VAULT_ADAPTER, depositAmount);

      const tx = await adapter.connect(user).deposit(
        PENDLE_MARKET_SLISBNB,
        0, // minPtOut
        defaultApproxParams(),
        tokenInputERC20(SLISBNB, depositAmount),
        emptyLimitOrderData(),
      );
      const receipt = await tx.wait();

      const vTokenAfter = await vToken.balanceOf(userAddress);
      expect(vTokenAfter).to.be.gt(vTokenBefore);

      // Verify Deposited event
      const iface = new ethers.utils.Interface(ADAPTER_ABI);
      const depositedEvents = receipt.logs
        .map((log: { topics: string[]; data: string }) => {
          try {
            return iface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((e: { name: string } | null) => e && e.name === "Deposited");

      expect(depositedEvents.length).to.equal(1);
      expect(depositedEvents[0].args.user).to.equal(userAddress);
      expect(depositedEvents[0].args.tokenIn).to.equal(SLISBNB);
      expect(depositedEvents[0].args.amountIn).to.equal(depositAmount);
      expect(depositedEvents[0].args.vTokenAmount).to.be.gt(0);

      console.log(
        `    deposit: ${ethers.utils.formatEther(depositAmount)} slisBNB -> ${vTokenAfter.sub(vTokenBefore)} vTokens`,
      );
    });
  });

  describe("Functional: withdraw before maturity (vToken -> PT -> slisBNB via AMM)", async () => {
    let user: Signer;
    let userAddress: string;
    let vToken: Contract;
    let slisBNB: Contract;
    let comptroller: Contract;

    before(async () => {
      await fixAllOracleStaleFeeds();
      const signers = await ethers.getSigners();
      user = signers[2];
      userAddress = await user.getAddress();
      vToken = new ethers.Contract(vPT_clisBNB_25JUN2026, VTOKEN_ABI, provider);
      slisBNB = new ethers.Contract(SLISBNB, ERC20_ABI, provider);
      comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);

      // Fund user with slisBNB and deposit to get vTokens
      const whale = await initMainnetUser(SLISBNB_WHALE, parseUnits("1", 18));
      await slisBNB.connect(whale).transfer(userAddress, parseUnits("10", 18));
      await slisBNB.connect(user).approve(PENDLE_PT_VAULT_ADAPTER, parseUnits("5", 18));
      await adapter
        .connect(user)
        .deposit(
          PENDLE_MARKET_SLISBNB,
          0,
          defaultApproxParams(),
          tokenInputERC20(SLISBNB, parseUnits("5", 18)),
          emptyLimitOrderData(),
        );

      // Delegate adapter to redeem on behalf of user
      await comptroller.connect(user).updateDelegate(PENDLE_PT_VAULT_ADAPTER, true);
    });

    it("user should have vTokens from deposit", async () => {
      const balance = await vToken.balanceOf(userAddress);
      expect(balance).to.be.gt(0);
    });

    it("adapter should be an approved delegate", async () => {
      expect(await comptroller.approvedDelegates(userAddress, PENDLE_PT_VAULT_ADAPTER)).to.be.true;
      expect(await adapter.isDelegated(userAddress)).to.be.true;
    });

    it("should withdraw vTokens and receive slisBNB before maturity", async () => {
      const vTokenBalance = await vToken.balanceOf(userAddress);
      expect(vTokenBalance).to.be.gt(0);

      // Withdraw half of vToken balance
      const withdrawAmount = vTokenBalance.div(2);
      const slisBNBBefore = await slisBNB.balanceOf(userAddress);

      const tx = await adapter
        .connect(user)
        .withdraw(PENDLE_MARKET_SLISBNB, withdrawAmount, tokenOutputSlisBNB(), emptyLimitOrderData());
      const receipt = await tx.wait();

      const slisBNBAfter = await slisBNB.balanceOf(userAddress);
      expect(slisBNBAfter).to.be.gt(slisBNBBefore);

      const vTokenAfter = await vToken.balanceOf(userAddress);
      expect(vTokenAfter).to.be.lt(vTokenBalance);

      // Verify Withdrawn event
      const iface = new ethers.utils.Interface(ADAPTER_ABI);
      const withdrawnEvents = receipt.logs
        .map((log: { topics: string[]; data: string }) => {
          try {
            return iface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((e: { name: string } | null) => e && e.name === "Withdrawn");

      expect(withdrawnEvents.length).to.equal(1);
      expect(withdrawnEvents[0].args.user).to.equal(userAddress);
      expect(withdrawnEvents[0].args.tokenOut).to.equal(SLISBNB);
      expect(withdrawnEvents[0].args.amountOut).to.be.gt(0);

      console.log(
        `    withdraw: ${withdrawAmount} vTokens -> ${ethers.utils.formatEther(
          slisBNBAfter.sub(slisBNBBefore),
        )} slisBNB`,
      );
    });

    it("redeemAtMaturity should revert before maturity", async () => {
      const vTokenBalance = await vToken.balanceOf(userAddress);
      expect(vTokenBalance).to.be.gt(0);

      await expect(
        adapter.connect(user).redeemAtMaturity(PENDLE_MARKET_SLISBNB, vTokenBalance, tokenOutputSlisBNB()),
      ).to.be.revertedWithCustomError(adapter, "MarketNotMatured");
    });
  });

  describe("Functional: redeemAtMaturity (vToken -> PT -> slisBNB after maturity)", async () => {
    let user: Signer;
    let userAddress: string;
    let vToken: Contract;
    let slisBNB: Contract;
    let comptroller: Contract;

    before(async () => {
      await fixAllOracleStaleFeeds();
      const signers = await ethers.getSigners();
      user = signers[3];
      userAddress = await user.getAddress();
      vToken = new ethers.Contract(vPT_clisBNB_25JUN2026, VTOKEN_ABI, provider);
      slisBNB = new ethers.Contract(SLISBNB, ERC20_ABI, provider);
      comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);

      // Fund user with slisBNB and deposit
      const whale = await initMainnetUser(SLISBNB_WHALE, parseUnits("1", 18));
      await slisBNB.connect(whale).transfer(userAddress, parseUnits("10", 18));
      await slisBNB.connect(user).approve(PENDLE_PT_VAULT_ADAPTER, parseUnits("5", 18));
      await adapter
        .connect(user)
        .deposit(
          PENDLE_MARKET_SLISBNB,
          0,
          defaultApproxParams(),
          tokenInputERC20(SLISBNB, parseUnits("5", 18)),
          emptyLimitOrderData(),
        );

      // Delegate adapter
      await comptroller.connect(user).updateDelegate(PENDLE_PT_VAULT_ADAPTER, true);

      // Warp time past maturity
      await ethers.provider.send("evm_setNextBlockTimestamp", [MATURITY + 1]);
      await ethers.provider.send("evm_mine", []);
    });

    it("market should be matured", async () => {
      expect(await adapter.isMatured(PENDLE_MARKET_SLISBNB)).to.be.true;
    });

    it("withdraw should revert after maturity", async () => {
      const vTokenBalance = await vToken.balanceOf(userAddress);
      expect(vTokenBalance).to.be.gt(0);

      await expect(
        adapter
          .connect(user)
          .withdraw(PENDLE_MARKET_SLISBNB, vTokenBalance, tokenOutputSlisBNB(), emptyLimitOrderData()),
      ).to.be.revertedWithCustomError(adapter, "MarketAlreadyMatured");
    });

    it("should redeem at maturity and receive slisBNB", async () => {
      const vTokenBalance = await vToken.balanceOf(userAddress);
      expect(vTokenBalance).to.be.gt(0);

      const slisBNBBefore = await slisBNB.balanceOf(userAddress);

      const tx = await adapter
        .connect(user)
        .redeemAtMaturity(PENDLE_MARKET_SLISBNB, vTokenBalance, tokenOutputSlisBNB());
      const receipt = await tx.wait();

      const slisBNBAfter = await slisBNB.balanceOf(userAddress);
      expect(slisBNBAfter).to.be.gt(slisBNBBefore);

      const vTokenAfter = await vToken.balanceOf(userAddress);
      expect(vTokenAfter).to.equal(0);

      // Verify RedeemedAtMaturity event
      const iface = new ethers.utils.Interface(ADAPTER_ABI);
      const redeemEvents = receipt.logs
        .map((log: { topics: string[]; data: string }) => {
          try {
            return iface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((e: { name: string } | null) => e && e.name === "RedeemedAtMaturity");

      expect(redeemEvents.length).to.equal(1);
      expect(redeemEvents[0].args.user).to.equal(userAddress);
      expect(redeemEvents[0].args.tokenOut).to.equal(SLISBNB);
      expect(redeemEvents[0].args.amountOut).to.be.gt(0);

      console.log(
        `    redeemAtMaturity: ${vTokenBalance} vTokens -> ${ethers.utils.formatEther(
          slisBNBAfter.sub(slisBNBBefore),
        )} slisBNB`,
      );
    });
  });
});
