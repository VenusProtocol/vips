import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStaleCoreAssets } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import vip301 from "../../vips/vip-301/bscmainnet";
import { TOKEN_REDEEMER, TREASURY, VAI, VAI_UNITROLLER, shortfallAccounts } from "../../vips/vip-301/bscmainnet";
import COMPROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import VAI_CONTROLLER_ABI from "./abi/VAIController.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const CHAINLINK = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

const EXPECTED_WITHDRAWAL = parseUnits("113492.004770858319552357", 18);

forking(38402400, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(COMPTROLLER, COMPROLLER_ABI, provider);
  const vaiController = new ethers.Contract(VAI_UNITROLLER, VAI_CONTROLLER_ABI, provider);
  const vai = new ethers.Contract(VAI, ERC20_ABI, provider);

  let someone: SignerWithAddress;
  let treasuryBalanceBefore: BigNumber;

  before(async () => {
    [someone] = await ethers.getSigners();
    await setMaxStaleCoreAssets(CHAINLINK, NORMAL_TIMELOCK);
    treasuryBalanceBefore = await vai.balanceOf(TREASURY);
  });

  testVip("VAI repayment", await vip301(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VAI_CONTROLLER_ABI], ["RepayVAI"], [shortfallAccounts.length]);
    },
  });

  describe("Post-VIP state", () => {
    before(async () => {
      await vaiController.connect(someone).accrueVAIInterest();
    });

    it(`decreases treasury balance by ${formatUnits(EXPECTED_WITHDRAWAL, 18)} VAI`, async () => {
      const treasuryBalanceAfter = await vai.balanceOf(TREASURY);
      expect(treasuryBalanceBefore.sub(treasuryBalanceAfter)).to.equal(EXPECTED_WITHDRAWAL);
    });

    for (const borrower of shortfallAccounts) {
      it(`repays VAI debt of ${borrower} in full`, async () => {
        expect(await comptroller.mintedVAIs(borrower)).to.equal(0);
        expect(await vaiController.pastVAIInterest(borrower)).to.equal(0);
        expect(await vaiController.getVAIRepayAmount(borrower)).to.equal(0);
      });
    }

    it("does not leave any VAI in the utility contract", async () => {
      expect(await vai.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });
  });
});
