import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import RESILIENT_ORACLE_ABI from "../../src/vip-framework/abi/resilientOracle.json";
import vip664, {
  BTCB_BUYBACK,
  ETH_BUYBACK,
  STABLE_TOKEN,
  TOKENS,
  TREASURY_TOKEN_BUYBACK_DISTRIBUTOR,
  USDC_BUYBACK,
  USDT_BUYBACK,
  U_BUYBACK,
  VAI,
  VAI_PSM,
  XVS_BUYBACK,
} from "../../vips/vip-664/bscmainnet";
import DISTRIBUTOR_ARTIFACT from "./abi/TreasuryTokenBuybackDistributorArtifact.json";
import VTREASURY_ABI from "./abi/VTreasury.json";
import ERC20_ABI from "./abi/erc20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 111068000;

const MAX_BPS = BigNumber.from(10_000);

// Buyback destinations in distribution order, paired with their weight (bps). The U buyback
// receives the re-read remainder rather than a computed share, absorbing integer-division dust.
const BUYBACKS: { name: string; address: string; weight: BigNumber }[] = [
  { name: "BTCB", address: BTCB_BUYBACK, weight: BigNumber.from(1_500) },
  { name: "ETH", address: ETH_BUYBACK, weight: BigNumber.from(1_500) },
  { name: "XVS", address: XVS_BUYBACK, weight: BigNumber.from(1_000) },
  { name: "USDT", address: USDT_BUYBACK, weight: BigNumber.from(1_500) },
  { name: "USDC", address: USDC_BUYBACK, weight: BigNumber.from(1_500) },
  { name: "U", address: U_BUYBACK, weight: BigNumber.from(3_000) },
];

forking(FORK_BLOCK, async () => {
  let vTreasury: Contract;
  let distributor: Contract;
  const tokenContracts: Contract[] = [];
  let stableContract: Contract;

  const vaiIndex = TOKENS.findIndex(t => t.toLowerCase() === VAI.toLowerCase());

  // Pre-VIP snapshots, indexed by token.
  const treasuryBefore: BigNumber[] = [];
  const buybackBefore: BigNumber[][] = [];
  const stableBuybackBefore: BigNumber[] = [];
  let treasuryStableBefore: BigNumber;

  before(async () => {
    vTreasury = new ethers.Contract(bscmainnet.VTREASURY, VTREASURY_ABI, ethers.provider);
    for (const token of TOKENS) {
      tokenContracts.push(new ethers.Contract(token, ERC20_ABI, ethers.provider));
    }
    stableContract = new ethers.Contract(STABLE_TOKEN, ERC20_ABI, ethers.provider);

    // The real (re)deployed distributor will be a fresh address holding nothing. Our placeholder
    // address happens to hold stray dust on mainnet (e.g. ~6.4k USDT), which would otherwise leak
    // into the distribution. Sweep any stray balance of the tokens we touch so the fork starts from
    // a clean, fresh-deploy state before we inject the contract code.
    const placeholderSigner = await initMainnetUser(TREASURY_TOKEN_BUYBACK_DISTRIBUTOR, ethers.utils.parseEther("10"));
    const DEAD = "0x000000000000000000000000000000000000dEaD";
    for (const token of [...TOKENS, STABLE_TOKEN]) {
      const erc20 = new ethers.Contract(token, ERC20_ABI, placeholderSigner);
      const stray = await erc20.balanceOf(TREASURY_TOKEN_BUYBACK_DISTRIBUTOR);
      if (stray.gt(0)) {
        await erc20.transfer(DEAD, stray);
      }
    }

    // The updated TreasuryTokenBuybackDistributor (VAI-PSM aware) is not yet (re)deployed on
    // bscmainnet. Deploy it on the fork with the six bscmainnet buyback addresses plus the
    // VAI / VAI-PSM / USDT wiring as constructor args, then inject its runtime code (immutables
    // baked in) at the placeholder address the VIP references, so the proof is exact.
    const [deployer] = await ethers.getSigners();
    const factory = new ethers.ContractFactory(DISTRIBUTOR_ARTIFACT.abi, DISTRIBUTOR_ARTIFACT.bytecode, deployer);
    const deployed = await factory.deploy(
      BTCB_BUYBACK,
      ETH_BUYBACK,
      XVS_BUYBACK,
      USDT_BUYBACK,
      USDC_BUYBACK,
      U_BUYBACK,
      VAI,
      VAI_PSM,
      STABLE_TOKEN,
      bscmainnet.VTREASURY,
    );
    await deployed.deployed();
    const runtimeCode = await ethers.provider.getCode(deployed.address);
    await ethers.provider.send("hardhat_setCode", [TREASURY_TOKEN_BUYBACK_DISTRIBUTOR, runtimeCode]);
    distributor = new ethers.Contract(TREASURY_TOKEN_BUYBACK_DISTRIBUTOR, DISTRIBUTOR_ARTIFACT.abi, ethers.provider);

    // The VAI PSM prices USDT through the ResilientOracle inside `swapVAIForStable`. Executing the
    // proposal advances `block.timestamp` by the full governance cycle (voting + timelock, ~4-5 days)
    // while the fork freezes every other chain actor, so the USDT price feeds — which keepers refresh
    // continuously on live mainnet — read as stale and the ResilientOracle reverts with
    // "invalid resilient oracle price", silently skipping the conversion inside the distributor's
    // try/catch. Bump the max stale period of every enabled sub-oracle configured for USDT on the
    // PSM's ResilientOracle so the frozen fork prices stay fresh across the warp, mirroring the live
    // feeds at real execution time. This is fork-only oracle plumbing; it does not change the VIP's
    // on-chain behavior. (Note: USDT's RedStone pivot push-feed still reverts on a frozen fork, so
    // the price resolves through the equally-valid main-vs-fallback path — both bumped here.)
    const psmOracle = new ethers.Contract(VAI_PSM, ["function oracle() view returns (address)"], ethers.provider);
    const resilientOracle = new ethers.Contract(await psmOracle.oracle(), RESILIENT_ORACLE_ABI, ethers.provider);
    const usdtOracleConfig = await resilientOracle.getTokenConfig(STABLE_TOKEN);
    for (let i = 0; i < usdtOracleConfig.oracles.length; i++) {
      const subOracle = usdtOracleConfig.oracles[i];
      if (!usdtOracleConfig.enableFlagsForOracles[i] || subOracle === ethers.constants.AddressZero) continue;
      await setMaxStalePeriodInChainlinkOracle(
        subOracle,
        STABLE_TOKEN,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
      );
    }

    // Snapshot balances before the VIP.
    for (let i = 0; i < TOKENS.length; i++) {
      treasuryBefore.push(await tokenContracts[i].balanceOf(bscmainnet.VTREASURY));
      const perBuyback: BigNumber[] = [];
      for (const b of BUYBACKS) {
        perBuyback.push(await tokenContracts[i].balanceOf(b.address));
      }
      buybackBefore.push(perBuyback);
    }
    // USDT is not one of the withdrawn tokens. The VAI→USDT proceeds go back to VTreasury, so
    // snapshot the treasury's USDT balance to measure the redemption delta; also snapshot each
    // buyback's USDT so we can prove no USDT leaked to them.
    treasuryStableBefore = await stableContract.balanceOf(bscmainnet.VTREASURY);
    for (const b of BUYBACKS) {
      stableBuybackBefore.push(await stableContract.balanceOf(b.address));
    }
  });

  describe("Pre-VIP state", () => {
    it("VTreasury owner should be the Normal Timelock", async () => {
      expect(await vTreasury.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("distributor should be wired to the six bscmainnet buybacks with weights summing to MAX_BPS", async () => {
      expect(await distributor.MAX_BPS()).to.equal(MAX_BPS);
      expect(await distributor.BTCB_BUYBACK()).to.equal(BTCB_BUYBACK);
      expect(await distributor.ETH_BUYBACK()).to.equal(ETH_BUYBACK);
      expect(await distributor.XVS_BUYBACK()).to.equal(XVS_BUYBACK);
      expect(await distributor.USDT_BUYBACK()).to.equal(USDT_BUYBACK);
      expect(await distributor.USDC_BUYBACK()).to.equal(USDC_BUYBACK);
      expect(await distributor.U_BUYBACK()).to.equal(U_BUYBACK);
      const sum = (await distributor.BTCB_WEIGHT())
        .add(await distributor.ETH_WEIGHT())
        .add(await distributor.XVS_WEIGHT())
        .add(await distributor.USDT_WEIGHT())
        .add(await distributor.USDC_WEIGHT())
        .add(await distributor.U_WEIGHT());
      expect(sum).to.equal(MAX_BPS);
    });

    it("distributor should be wired to the VAI token, VAI PSM and USDT", async () => {
      expect(await distributor.VAI()).to.equal(VAI);
      expect(await distributor.VAI_PSM()).to.equal(VAI_PSM);
      expect(await distributor.STABLE_TOKEN()).to.equal(STABLE_TOKEN);
    });

    it("VTreasury should hold a non-zero balance of every listed token", async () => {
      for (let i = 0; i < TOKENS.length; i++) {
        expect(treasuryBefore[i], `token ${TOKENS[i]}`).to.be.gt(0);
      }
    });
  });

  // Name the governance voters explicitly. At this fork block the sole delegate above the 300k XVS
  // proposal threshold is 0x3422… (~1.13M votes), but on its own it falls short of the 1.5M XVS
  // quorum, so add supporters (0x5176… ~0.47M plus the two default supporters) to clear quorum with
  // headroom.
  testVip("VIP-664 Venus Treasury Cleanup", await vip664(), {
    proposer: "0x34221485302f6F2029660a000908B5FCABB9BC6e",
    supporters: [
      "0x5176671de05380379399b669ed276feec99d59cb",
      "0xc444949e0054a23c44fc45789738bdf64aed2391",
      "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
    ],
    callbackAfterExecution: async txResponse => {
      // One withdrawal event per token, and exactly one VAI→USDT PSM conversion. (The number of
      // TokenDistributed events is asserted indirectly via the post-VIP balance checks, since it
      // depends on whether the flooring leaves a sub-wei VAI remainder to sweep.)
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [TOKENS.length]);
      await expectEvents(txResponse, [DISTRIBUTOR_ARTIFACT.abi], ["VaiConvertedViaPsm"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    it("VTreasury owner should be unchanged (Normal Timelock)", async () => {
      expect(await vTreasury.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("every listed token (and the USDT proceeds) should be fully drained from VTreasury and the distributor", async () => {
      for (let i = 0; i < TOKENS.length; i++) {
        // VAI is the one exception on the treasury side: the PSM sends its outgoing fee (≈10 bps of
        // the redeemed VAI) back to its `venusTreasury`, which is VTreasury, so a tiny VAI fee lands
        // back in the treasury. That is expected PSM revenue and is asserted precisely in the VAI
        // test below. Every token — VAI included — is still fully drained from the distributor.
        if (i !== vaiIndex) {
          expect(await tokenContracts[i].balanceOf(bscmainnet.VTREASURY), `treasury ${TOKENS[i]}`).to.equal(0);
        }
        expect(
          await tokenContracts[i].balanceOf(TREASURY_TOKEN_BUYBACK_DISTRIBUTOR),
          `distributor ${TOKENS[i]}`,
        ).to.equal(0);
      }
      // No USDT (VAI redemption proceeds) is left stranded on the distributor.
      expect(await stableContract.balanceOf(TREASURY_TOKEN_BUYBACK_DISTRIBUTOR), "distributor USDT").to.equal(0);
    });

    it("each non-VAI token should be split across the six buybacks by weight (U absorbs the remainder)", async () => {
      for (let i = 0; i < TOKENS.length; i++) {
        if (i === vaiIndex) continue; // VAI value is redeemed for USDT, asserted separately below

        // Per-buyback deltas. The amount actually distributed is their sum (the distributor ends at
        // zero for every token, asserted above), which is the withdrawn balance at execution time.
        const deltas: BigNumber[] = [];
        for (let b = 0; b < BUYBACKS.length; b++) {
          deltas.push((await tokenContracts[i].balanceOf(BUYBACKS[b].address)).sub(buybackBefore[i][b]));
        }
        const distributed = deltas.reduce((acc, d) => acc.add(d), BigNumber.from(0));
        expect(distributed, `distributed ${TOKENS[i]}`).to.be.gt(0);

        // Value conservation sanity bound: essentially everything withdrawn reached the buybacks.
        // A 0.1% tolerance absorbs the negligible balance drift between the pre-VIP snapshot and the
        // (much later) execution block while still catching any gross value loss.
        const drift = treasuryBefore[i].sub(distributed).abs();
        expect(drift, `value conservation ${TOKENS[i]}`).to.be.lte(treasuryBefore[i].div(1_000).add(1));

        // The five weighted legs are exactly floor(distributed * weight / MAX_BPS); U gets the
        // re-read remainder — mirroring the contract precisely.
        let weighted = BigNumber.from(0);
        for (let b = 0; b < 5; b++) {
          const expectedLeg = distributed.mul(BUYBACKS[b].weight).div(MAX_BPS);
          expect(deltas[b], `${BUYBACKS[b].name} buyback for ${TOKENS[i]}`).to.equal(expectedLeg);
          weighted = weighted.add(expectedLeg);
        }
        expect(deltas[5], `U buyback for ${TOKENS[i]}`).to.equal(distributed.sub(weighted));
      }
    });

    it("VAI should be redeemed for USDT at the PSM, and the USDT returned to VTreasury (not the buybacks)", async () => {
      const vaiBefore = treasuryBefore[vaiIndex];
      expect(vaiBefore, "VAI treasury balance snapshot").to.be.gt(0);

      // The redeemed USDT went straight back to VTreasury. USDT is not a withdrawn token and the
      // distributor ends at zero USDT, so the treasury's USDT delta is exactly the redemption
      // proceeds.
      const usdtToTreasury = (await stableContract.balanceOf(bscmainnet.VTREASURY)).sub(treasuryStableBefore);

      // The bulk of the VAI was redeemed at (near) peg minus the 0.10% PSM fee: proceeds should be
      // just under the VAI balance, and certainly not materially less (which would indicate the
      // conversion silently fell back to a thin-liquidity DEX path instead of the PSM).
      expect(usdtToTreasury, "USDT proceeds > 99.5% of VAI").to.be.gt(vaiBefore.mul(995).div(1_000));
      expect(usdtToTreasury, "USDT proceeds <= VAI redeemed").to.be.lte(vaiBefore);

      // USDT is a base asset and is intentionally excluded from `distribute`, so no USDT should have
      // reached any of the six buybacks.
      for (let b = 0; b < BUYBACKS.length; b++) {
        const usdtDelta = (await stableContract.balanceOf(BUYBACKS[b].address)).sub(stableBuybackBefore[b]);
        expect(usdtDelta, `${BUYBACKS[b].name} buyback USDT delta`).to.equal(0);
      }

      // The only VAI left anywhere after the VIP is the PSM's outgoing fee, which the PSM routes to
      // its `venusTreasury` (== VTreasury). It must be a small, positive amount bounded by the live
      // PSM fee rate (10 bps) plus a hair of tolerance — never the whole balance (which would mean
      // the redemption did not actually run). The distributor itself holds no VAI (asserted above).
      const psm = new ethers.Contract(VAI_PSM, ["function feeOut() view returns (uint256)"], ethers.provider);
      const feeOut = await psm.feeOut();
      const vaiFeeInTreasury = await tokenContracts[vaiIndex].balanceOf(bscmainnet.VTREASURY);
      expect(vaiFeeInTreasury, "VAI PSM fee returned to treasury > 0").to.be.gt(0);
      // Upper bound: fee <= vaiBefore * (feeOut + 1bps buffer) / MAX_BPS.
      expect(vaiFeeInTreasury, "VAI PSM fee within the fee rate").to.be.lte(vaiBefore.mul(feeOut.add(1)).div(MAX_BPS));
    });
  });
});
