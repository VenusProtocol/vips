import { expect } from "chai";
import * as fs from "fs";
import { ethers } from "hardhat";
import * as path from "path";
import { initMainnetUser } from "src/utils";
import { forking } from "src/vip-framework";

/**
 * Fork test that reads gnosisTXBuilder.json, executes each transaction
 * by impersonating the Guardian (Safe) address, then verifies the
 * intended state changes using safePauseMetadata.json.
 *
 * Usage:
 *   npx hardhat test scripts/simulateSafeJson.ts --fork <networkName>
 */

const jsonPath = path.resolve(__dirname, "..", "gnosisTXBuilder.json");
if (!fs.existsSync(jsonPath)) {
  throw new Error(`${jsonPath} not found. Run generateSafePauseJson.ts first.`);
}
const batchFile = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
const transactions: { to: string; data: string; value: string }[] = batchFile.transactions;
const safeAddress = batchFile.meta.createdFromSafeAddress;

const metadataPath = path.resolve(__dirname, "..", "safePauseMetadata.json");
const hasMetadata = fs.existsSync(metadataPath);
const metadata = hasMetadata ? JSON.parse(fs.readFileSync(metadataPath, "utf-8")) : null;
const symbolOf = (vToken: string): string =>
  metadata?.symbols?.[vToken] || vToken.slice(0, 10);

// ─── ABI fragments for verification ────────────────────────────────────────

const BSC_COMPTROLLER_ABI = [
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isVenus, uint256 liquidationThresholdMantissa, uint256 liquidationIncentiveMantissa, uint96 marketPoolId, bool isBorrowAllowed)",
  "function poolMarkets(uint96,address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isVenus, uint256 liquidationThresholdMantissa, uint256 liquidationIncentiveMantissa, uint96 marketPoolId, bool isBorrowAllowed)",
  "function actionPaused(address,uint8) view returns (bool)",
];

const REMOTE_COMPTROLLER_ABI = [
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, uint256 liquidationThresholdMantissa)",
  "function actionPaused(address,uint8) view returns (bool)",
];

// ─── Verification helpers ──────────────────────────────────────────────────

const verifyCfZero = (comptroller: string, markets: string[], isBsc: boolean) => {
  const abi = isBsc ? BSC_COMPTROLLER_ABI : REMOTE_COMPTROLLER_ABI;

  for (const vToken of markets) {
    it(`${symbolOf(vToken)} (${vToken}) should have CF = 0`, async () => {
      const contract = new ethers.Contract(comptroller, abi, ethers.provider);
      const data = await contract.markets(vToken);
      expect(data.collateralFactorMantissa).to.equal(0);
    });
  }
};

const verifyEmodeCfZero = (comptroller: string, entries: { vToken: string; poolId: number }[]) => {
  for (const { vToken, poolId } of entries) {
    it(`${symbolOf(vToken)} (${vToken}) e-mode pool ${poolId} should have CF = 0`, async () => {
      const contract = new ethers.Contract(comptroller, BSC_COMPTROLLER_ABI, ethers.provider);
      const data = await contract.poolMarkets(poolId, vToken);
      expect(data.collateralFactorMantissa).to.equal(0);
    });
  }
};

const ActionNames: Record<number, string> = {
  0: "MINT",
  1: "REDEEM",
  2: "BORROW",
  3: "REPAY",
  4: "SEIZE",
  5: "LIQUIDATE",
  6: "TRANSFER",
  7: "ENTER_MARKET",
  8: "EXIT_MARKET",
};

const verifyActionsPaused = (comptroller: string, markets: string[], actions: number[], isBsc: boolean) => {
  const abi = isBsc ? BSC_COMPTROLLER_ABI : REMOTE_COMPTROLLER_ABI;

  for (const vToken of markets) {
    for (const action of actions) {
      const actionName = ActionNames[action] || String(action);

      it(`${symbolOf(vToken)} (${vToken}) action ${actionName} should be paused`, async () => {
        const contract = new ethers.Contract(comptroller, abi, ethers.provider);
        const paused = await contract.actionPaused(vToken, action);
        expect(paused).to.equal(true);
      });
    }
  }
};

// ─── Test suite ────────────────────────────────────────────────────────────

(async () => {
  console.log("Fetching latest block number...");
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log(`Latest block: ${blockNumber}`);

  forking(blockNumber, async () => {
    describe(`Simulate gnosisTXBuilder.json (${transactions.length} txs)`, () => {
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];

        it(`Tx ${i + 1}/${transactions.length}: call to ${tx.to}`, async () => {
          const signer = await initMainnetUser(safeAddress, ethers.utils.parseEther("10"));
          const txResponse = await signer.sendTransaction({
            to: tx.to,
            data: tx.data,
            value: tx.value || "0",
          });
          const receipt = await txResponse.wait();
          expect(receipt.status).to.equal(1);
        });
      }
    });

    if (metadata) {
      const isBsc = metadata.network === "bscmainnet";

      describe("Verify post-execution state", () => {
        if (metadata.cfZeroMarkets.length > 0) {
          describe("Collateral factor = 0", () => {
            verifyCfZero(metadata.comptroller, metadata.cfZeroMarkets, isBsc);
          });
        }

        if (metadata.emodeCfZero.length > 0) {
          describe("E-mode collateral factor = 0", () => {
            verifyEmodeCfZero(metadata.comptroller, metadata.emodeCfZero);
          });
        }

        if (metadata.pausedActions.markets.length > 0 && metadata.pausedActions.actions.length > 0) {
          describe("Actions paused", () => {
            verifyActionsPaused(
              metadata.comptroller,
              metadata.pausedActions.markets,
              metadata.pausedActions.actions,
              isBsc,
            );
          });
        }
      });
    } else {
      console.log("No safePauseMetadata.json found — skipping post-execution verification.");
    }
  });
})();
