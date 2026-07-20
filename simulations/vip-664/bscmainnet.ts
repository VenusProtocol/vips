import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, {
  BTCB_BUYBACK,
  ETH_BUYBACK,
  TOKENS,
  TREASURY_TOKEN_BUYBACK_DISTRIBUTOR,
  USDC_BUYBACK,
  USDT_BUYBACK,
  U_BUYBACK,
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

  // Pre-VIP snapshots, indexed by token.
  const treasuryBefore: BigNumber[] = [];
  const buybackBefore: BigNumber[][] = [];

  before(async () => {
    vTreasury = new ethers.Contract(bscmainnet.VTREASURY, VTREASURY_ABI, ethers.provider);
    for (const token of TOKENS) {
      tokenContracts.push(new ethers.Contract(token, ERC20_ABI, ethers.provider));
    }

    // The TreasuryTokenBuybackDistributor is deployed on bscmainnet at the address the VIP
    // references (0xfE7579C90423eEA3D0D4e29fbED6b8766e225f53, block 111066694 < FORK_BLOCK), so the
    // simulation runs against the real deployed contract — no fork deploy / code injection needed.
    distributor = new ethers.Contract(TREASURY_TOKEN_BUYBACK_DISTRIBUTOR, DISTRIBUTOR_ARTIFACT.abi, ethers.provider);

    // Snapshot balances before the VIP.
    for (let i = 0; i < TOKENS.length; i++) {
      treasuryBefore.push(await tokenContracts[i].balanceOf(bscmainnet.VTREASURY));
      const perBuyback: BigNumber[] = [];
      for (const b of BUYBACKS) {
        perBuyback.push(await tokenContracts[i].balanceOf(b.address));
      }
      buybackBefore.push(perBuyback);
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
      // One withdrawal event per token, and one TokenDistributed event per token.
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [TOKENS.length]);
      await expectEvents(txResponse, [DISTRIBUTOR_ARTIFACT.abi], ["TokenDistributed"], [TOKENS.length]);
    },
  });

  describe("Post-VIP state", () => {
    it("VTreasury owner should be unchanged (Normal Timelock)", async () => {
      expect(await vTreasury.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("every listed token should be fully drained from VTreasury and the distributor", async () => {
      for (let i = 0; i < TOKENS.length; i++) {
        expect(await tokenContracts[i].balanceOf(bscmainnet.VTREASURY), `treasury ${TOKENS[i]}`).to.equal(0);
        expect(
          await tokenContracts[i].balanceOf(TREASURY_TOKEN_BUYBACK_DISTRIBUTOR),
          `distributor ${TOKENS[i]}`,
        ).to.equal(0);
      }
    });

    it("each token should be split across the six buybacks by weight (U absorbs the remainder)", async () => {
      for (let i = 0; i < TOKENS.length; i++) {
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
  });
});
