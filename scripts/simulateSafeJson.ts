import { expect } from "chai";
import * as fs from "fs";
import { ethers } from "hardhat";
import * as path from "path";
import { initMainnetUser } from "src/utils";
import { forking } from "src/vip-framework";

/**
 * Fork test that reads gnosisTXBuilder.json and executes each transaction
 * by impersonating the Guardian (Safe) address.
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
  });
})();
