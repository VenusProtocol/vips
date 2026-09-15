import { mine, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip668, {
  ANKR_BINANCE_POOL,
  ANKR_BNB,
  ANKR_BNB_AMOUNT,
  ATLAS_ORACLE,
  ATLAS_PIVOT_ENABLE_FLAGS,
  ATLAS_PIVOT_MARKETS,
  ATLAS_PIVOT_ORACLES,
  BINANCE_ORACLE,
  BNBX,
  BNBX_AMOUNT,
  CHAINLINK_ORACLE,
  COMPTROLLER,
  LONG_TAIL_TOKENS,
  NEW_VAI_VAULT_RATE,
  NORMAL_TIMELOCK,
  PSTAKE_STAKE_POOL,
  REDSTONE_ORACLE,
  RESILIENT_ORACLE,
  RISK_FUND,
  RISK_FUND_BUYBACK,
  STADER_STAKE_MANAGER,
  STKBNB,
  STKBNB_AMOUNT,
  TREASURY_TOKEN_BUYBACK_DISTRIBUTOR,
  USDT,
  VAI,
  VAI_ATLAS_FEED,
  VAI_ATLAS_MAX_STALE_PERIOD,
  VAI_ENABLE_FLAGS,
  VAI_ORACLES,
  VAI_PSM,
  VTREASURY,
  WBNB,
  WBNB_AMOUNT,
} from "../../vips/vip-668/bscmainnet";
import coreMarketOracles from "../../vips/vip-668/data/coreMarketOracles.json";
import ANKR_BINANCE_POOL_ABI from "./abi/AnkrBinancePool.json";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import PSTAKE_STAKE_POOL_ABI from "./abi/PStakeStakePool.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import RISK_FUND_ABI from "./abi/RiskFundV2.json";
import STAKE_MANAGER_V2_ABI from "./abi/StakeManagerV2.json";
import DISTRIBUTOR_ABI from "./abi/TreasuryTokenBuybackDistributor.json";
import VTREASURY_ABI from "./abi/VTreasury.json";
import WBNB_ABI from "./abi/WBNB.json";

const FORK_BLOCK = coreMarketOracles.block;

const NATIVE_BNB = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const OLD_VAI_VAULT_RATE = BigNumber.from("341157958083832");
const OLD_ATLAS_FALLBACK_ORACLES = [CHAINLINK_ORACLE, REDSTONE_ORACLE, ATLAS_ORACLE];
const OLD_VAI_ORACLES = [CHAINLINK_ORACLE, BINANCE_ORACLE, ethers.constants.AddressZero];
const OLD_VAI_ENABLE_FLAGS = [true, true, false];

// Enough blocks for the pre-VIP rate to accrue more than the Comptroller's 4 XVS minReleaseAmount
const BLOCKS_TO_MINE = 20_000;
const DUMMY_USER = "0x0000000000000000000000000000000000000001";

const SLISBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
// stkBNB left in the RiskFund after rounding the swept amount down to a multiple of 1e12
const STKBNB_DUST = BigNumber.from("201756396971");

type OracleConfig = { oracles: string[]; flags: boolean[]; caching: boolean };

forking(FORK_BLOCK, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const atlasOracle = new ethers.Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
  const token = (address: string) => new ethers.Contract(address, ERC20_ABI, ethers.provider);
  const vai = token(VAI);
  const usdt = token(USDT);
  const wbnb = token(WBNB);
  const slisBnb = token(SLISBNB);
  const psm = new ethers.Contract(VAI_PSM, ["function feeOut() view returns (uint256)"], ethers.provider);
  const ankrBinancePool = new ethers.Contract(ANKR_BINANCE_POOL, ANKR_BINANCE_POOL_ABI, ethers.provider);
  const stakeManagerV2 = new ethers.Contract(STADER_STAKE_MANAGER, STAKE_MANAGER_V2_ABI, ethers.provider);
  const pStakeStakePool = new ethers.Contract(PSTAKE_STAKE_POOL, PSTAKE_STAKE_POOL_ABI, ethers.provider);

  let coreAssets: string[];
  let vaiVault: string;
  const configsBefore: Record<string, OracleConfig> = {};

  let treasuryVaiBefore: BigNumber;
  let treasuryUsdtBefore: BigNumber;
  let riskFundWbnbBefore: BigNumber;
  let riskFundSlisBnbBefore: BigNumber;
  let bnbPaidToTimelock: BigNumber;
  const buybackBalancesBefore: Record<string, BigNumber> = {};

  const readConfig = async (asset: string): Promise<OracleConfig> => {
    const config = await resilientOracle.getTokenConfig(asset);
    return {
      oracles: config.oracles.map((oracle: string) => ethers.utils.getAddress(oracle)),
      flags: [...config.enableFlagsForOracles],
      caching: config.cachingEnabled,
    };
  };

  const expectConfig = (config: OracleConfig, oracles: string[], flags: boolean[]) => {
    expect(config.oracles).to.deep.equal(oracles.map(oracle => ethers.utils.getAddress(oracle)));
    expect(config.flags).to.deep.equal(flags);
    expect(config.caching).to.equal(false);
  };

  // Releases the XVS accrued for the VAI Vault by settling rewards for an arbitrary account in one
  // listed market (the all-markets overload reverts on delisted markets still in getAllMarkets)
  const vaultXvsReceivedAfterMining = async (): Promise<BigNumber> => {
    const balanceBefore = await xvs.balanceOf(vaiVault);
    await mine(BLOCKS_TO_MINE);
    const signer = (await ethers.getSigners())[0];
    await comptroller.connect(signer)["claimVenus(address,address[])"](DUMMY_USER, [VUSDT]);
    return (await xvs.balanceOf(vaiVault)).sub(balanceBefore);
  };

  before(async () => {
    vaiVault = await comptroller.vaiVaultAddress();
    const markets: string[] = await comptroller.getAllMarkets();
    coreAssets = await Promise.all(
      markets.map(async market => {
        if (ethers.utils.getAddress(market) === VBNB) return NATIVE_BNB;
        const vToken = new ethers.Contract(market, ["function underlying() view returns (address)"], ethers.provider);
        return ethers.utils.getAddress(await vToken.underlying());
      }),
    );
    for (const asset of coreAssets) {
      configsBefore[asset] = await readConfig(asset);
    }

    // testVip moves the fork past the USDT feeds' stale period. The PSM prices USDT through the
    // ResilientOracle, so without this convertVaiViaPsm fails inside its try/catch and the VAI stays in
    // the distributor.
    await setMaxStalePeriod(resilientOracle, usdt as Contract);

    treasuryVaiBefore = await vai.balanceOf(VTREASURY);
    treasuryUsdtBefore = await usdt.balanceOf(VTREASURY);
    riskFundWbnbBefore = await wbnb.balanceOf(RISK_FUND);
    riskFundSlisBnbBefore = await slisBnb.balanceOf(RISK_FUND);
    for (const { address } of LONG_TAIL_TOKENS) {
      buybackBalancesBefore[address] = await token(address).balanceOf(RISK_FUND_BUYBACK);
    }
  });

  describe("Pre-VIP behavior", () => {
    it("coreMarketOracles matches every Core Pool market's current oracle config", async () => {
      const oracleAddresses: Record<string, string> = coreMarketOracles.oracleAddresses;
      const toAddress = (oracle: string | null) =>
        ethers.utils.getAddress(oracle === null ? ethers.constants.AddressZero : oracleAddresses[oracle] ?? oracle);

      expect(coreMarketOracles.coreMarketOracles.map(({ asset }) => asset)).to.deep.equal(coreAssets);
      for (const {
        symbol,
        asset,
        main,
        pivot,
        fallback,
        enableFlags,
        cachingEnabled,
      } of coreMarketOracles.coreMarketOracles) {
        expect(configsBefore[asset], symbol).to.deep.equal({
          oracles: [main, pivot, fallback].map(toAddress),
          flags: enableFlags,
          caching: cachingEnabled,
        });
      }
    });

    it("Atlas is the fallback oracle for exactly the markets the VIP updates", async () => {
      const atlasFallbackAssets = coreAssets.filter(
        asset => configsBefore[asset].oracles[2] === ethers.utils.getAddress(ATLAS_ORACLE),
      );
      expect(atlasFallbackAssets).to.have.members(ATLAS_PIVOT_MARKETS.map(({ asset }) => asset));
      expect(atlasFallbackAssets).to.have.lengthOf(ATLAS_PIVOT_MARKETS.length);
    });

    for (const { symbol, asset } of ATLAS_PIVOT_MARKETS) {
      it(`${symbol} uses [Chainlink, RedStone, Atlas], all enabled, caching disabled`, async () => {
        expectConfig(await readConfig(asset), OLD_ATLAS_FALLBACK_ORACLES, [true, true, true]);
      });
    }

    it("VAI uses [Chainlink, Binance, none]", async () => {
      expectConfig(await readConfig(VAI), OLD_VAI_ORACLES, OLD_VAI_ENABLE_FLAGS);
    });

    it("Atlas oracle has no VAI config", async () => {
      const config = await atlasOracle.tokenConfigs(VAI);
      expect(config.feed).to.equal(ethers.constants.AddressZero);
    });

    it("VAI Vault XVS rate is 341157958083832 wei per block", async () => {
      expect(await comptroller.venusVAIVaultRate()).to.equal(OLD_VAI_VAULT_RATE);
    });

    it("VAI Vault receives XVS as blocks pass", async () => {
      const snapshot = await takeSnapshot();
      expect(await vaultXvsReceivedAfterMining()).to.be.gt(0);
      await snapshot.restore();
    });

    it("VTreasury holds VAI and the distributor holds none", async () => {
      expect(treasuryVaiBefore).to.be.gt(0);
      expect(await vai.balanceOf(TREASURY_TOKEN_BUYBACK_DISTRIBUTOR)).to.equal(0);
    });

    for (const { symbol, address, amount } of LONG_TAIL_TOKENS) {
      it(`RiskFund holds exactly ${amount} ${symbol}`, async () => {
        expect(await token(address).balanceOf(RISK_FUND)).to.equal(amount);
      });
    }

    it("RiskFund holds exactly the ankrBNB and BNBx amounts, and the stkBNB amount plus dust", async () => {
      expect(await token(ANKR_BNB).balanceOf(RISK_FUND)).to.equal(ANKR_BNB_AMOUNT);
      expect(await token(BNBX).balanceOf(RISK_FUND)).to.equal(BNBX_AMOUNT);
      expect(await token(STKBNB).balanceOf(RISK_FUND)).to.equal(STKBNB_DUST.add(STKBNB_AMOUNT));
    });

    it("Normal Timelock holds no ankrBNB, BNBx or stkBNB", async () => {
      for (const receipt of [ANKR_BNB, BNBX, STKBNB]) {
        expect(await token(receipt).balanceOf(NORMAL_TIMELOCK), receipt).to.equal(0);
      }
    });
  });

  testVip("VIP-668 Oracle adjustments and VAI Vault rewards stop", await vip668(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [ATLAS_PIVOT_MARKETS.length + 1]);
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewVenusVAIVaultRate"], [1]);
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [1]);
      await expectEvents(txResponse, [DISTRIBUTOR_ABI], ["VaiConvertedViaPsm"], [1]);
      await expectEvents(txResponse, [RISK_FUND_ABI], ["SweepToken"], [LONG_TAIL_TOKENS.length + 3]);
      await expectEvents(txResponse, [ANKR_BINANCE_POOL_ABI], ["Unstaked"], [1]);
      await expectEvents(txResponse, [STAKE_MANAGER_V2_ABI], ["RedeemedBnbxForBnb"], [1]);
      await expectEvents(txResponse, [PSTAKE_STAKE_POOL_ABI], ["Withdraw", "Claim"], [1, 1]);
      await expectEvents(txResponse, [WBNB_ABI], ["Deposit"], [1]);

      // BNB paid to the Normal Timelock by the three exits, read from their events
      const receipt = await txResponse.wait();
      const exits: [Contract, string, string][] = [
        [ankrBinancePool, "Unstaked", "amount"],
        [stakeManagerV2, "RedeemedBnbxForBnb", "_amountInBnb"],
        [pStakeStakePool, "Withdraw", "bnbAmount"],
      ];
      bnbPaidToTimelock = BigNumber.from(0);
      for (const [contract, event, field] of exits) {
        const address = ethers.utils.getAddress(contract.address);
        for (const log of receipt.logs.filter(log => ethers.utils.getAddress(log.address) === address)) {
          const parsed = contract.interface.parseLog(log);
          if (parsed.name === event) bnbPaidToTimelock = bnbPaidToTimelock.add(parsed.args[field]);
        }
      }
    },
  });

  describe("Post-VIP behavior", () => {
    for (const { symbol, asset } of ATLAS_PIVOT_MARKETS) {
      it(`${symbol} uses [Chainlink, Atlas, RedStone], all enabled, caching disabled`, async () => {
        expectConfig(await readConfig(asset), ATLAS_PIVOT_ORACLES, ATLAS_PIVOT_ENABLE_FLAGS);
      });
    }

    it("every other Core Pool market keeps its oracle config", async () => {
      const updated = new Set(ATLAS_PIVOT_MARKETS.map(({ asset }) => asset));
      for (const asset of coreAssets.filter(asset => !updated.has(asset))) {
        expect(await readConfig(asset), asset).to.deep.equal(configsBefore[asset]);
      }
    });

    it("no Core Pool market has Atlas as fallback oracle", async () => {
      for (const asset of coreAssets) {
        const config = await readConfig(asset);
        expect(config.oracles[2], asset).to.not.equal(ethers.utils.getAddress(ATLAS_ORACLE));
      }
    });

    it("Atlas oracle has the VAI feed and stale period", async () => {
      const config = await atlasOracle.tokenConfigs(VAI);
      expect(config.asset).to.equal(ethers.utils.getAddress(VAI));
      expect(config.feed).to.equal(ethers.utils.getAddress(VAI_ATLAS_FEED));
      expect(config.maxStalePeriod).to.equal(VAI_ATLAS_MAX_STALE_PERIOD);
    });

    it("VAI uses [Atlas, none, none] with only the main oracle enabled", async () => {
      expectConfig(await readConfig(VAI), VAI_ORACLES, VAI_ENABLE_FLAGS);
    });

    it("VAI Vault XVS rate is 0", async () => {
      expect(await comptroller.venusVAIVaultRate()).to.equal(NEW_VAI_VAULT_RATE);
    });

    it("VAI Vault receives no more XVS as blocks pass", async () => {
      expect(await vaultXvsReceivedAfterMining()).to.equal(0);
    });

    it("VTreasury VAI is swapped for USDT at the PSM", async () => {
      // USDT is below $1 at the fork block, so the PSM prices it at $1: USDT out = VAI * 10000 / (10000 + feeOut)
      const feeOut = await psm.feeOut();
      const usdtOut = treasuryVaiBefore.mul(10000).div(feeOut.add(10000));
      expect((await usdt.balanceOf(VTREASURY)).sub(treasuryUsdtBefore)).to.equal(usdtOut);

      // The PSM burns VAI equal to the USDT out and sends its fee back to VTreasury, so only the fee and
      // at most 1 wei of rounding remain outside the burn
      const distributorVai = await vai.balanceOf(TREASURY_TOKEN_BUYBACK_DISTRIBUTOR);
      expect(distributorVai).to.be.lte(1);
      expect((await vai.balanceOf(VTREASURY)).add(distributorVai)).to.equal(treasuryVaiBefore.sub(usdtOut));
    });

    for (const { symbol, address, amount } of LONG_TAIL_TOKENS) {
      it(`${symbol} is moved from the RiskFund to the RiskFund buyback`, async () => {
        expect(await token(address).balanceOf(RISK_FUND)).to.equal(0);
        expect((await token(address).balanceOf(RISK_FUND_BUYBACK)).sub(buybackBalancesBefore[address])).to.equal(
          amount,
        );
      });
    }

    it("ankrBNB and BNBx are fully exited, and only the stkBNB dust stays in the RiskFund", async () => {
      expect(await token(ANKR_BNB).balanceOf(RISK_FUND)).to.equal(0);
      expect(await token(BNBX).balanceOf(RISK_FUND)).to.equal(0);
      expect(await token(STKBNB).balanceOf(RISK_FUND)).to.equal(STKBNB_DUST);
      for (const receipt of [ANKR_BNB, BNBX, STKBNB]) {
        expect(await token(receipt).balanceOf(NORMAL_TIMELOCK), receipt).to.equal(0);
      }
    });

    it("RiskFund receives the unstaked BNB as WBNB", async () => {
      expect((await wbnb.balanceOf(RISK_FUND)).sub(riskFundWbnbBefore)).to.equal(WBNB_AMOUNT);
    });

    // testVip sets the Normal Timelock's BNB balance itself, so the wrap is checked against the exit events
    // instead of the Timelock's balance
    it("the three exits pay exactly the wrapped BNB amount", async () => {
      expect(bnbPaidToTimelock).to.equal(WBNB_AMOUNT);
    });

    it("RiskFund slisBNB is not touched", async () => {
      expect(await slisBnb.balanceOf(RISK_FUND)).to.equal(riskFundSlisBnbBefore);
    });

    describe("Prices", () => {
      // testVip moves the fork past every feed's stale period, so extend them. This rewrites the
      // stale periods asserted above, which is why the config checks run first.
      before(async () => {
        const assets = [...ATLAS_PIVOT_MARKETS.map(({ asset }) => asset), VAI];
        for (const asset of assets) {
          await setMaxStalePeriod(resilientOracle, new ethers.Contract(asset, ERC20_ABI, ethers.provider) as Contract);
        }
      });

      for (const { symbol, asset } of ATLAS_PIVOT_MARKETS) {
        it(`${symbol} returns the Chainlink price validated against the Atlas pivot`, async () => {
          expect(await resilientOracle.getPrice(asset)).to.equal(await chainlinkOracle.getPrice(asset));
        });
      }

      it("VAI returns the Atlas price", async () => {
        const atlasPrice = await atlasOracle.getPrice(VAI);
        expect(await resilientOracle.getPrice(VAI)).to.equal(atlasPrice);
        expect(await resilientOracle.getUnderlyingPrice(VAI)).to.equal(atlasPrice);
      });
    });
  });
});
