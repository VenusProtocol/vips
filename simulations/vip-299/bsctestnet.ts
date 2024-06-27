import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser, setMaxStaleCoreAssets } from "src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "src/vip-framework";

import vip299 from "../../vips/vip-299/bsctestnet";
import { NEW_VAI_CONTROLLER_IMPL, VAI_UNITROLLER } from "../../vips/vip-299/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import VAI_CONTROLLER_ABI from "./abi/VAIController.json";

const VAI = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";
const OLD_VAI_CONTROLLER_IMPL = "0xBfBCdA434f940CaEdE18b3634E106C5ED8d1DE5c";
const VAI_HOLDER = "0x7Db4f5cC3bBA3e12FF1F528D2e3417afb0a57118";
const ACCOUNT_TO_REPAY_ON_BEHALF = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

const CHAINLINK = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";

forking(39893340, async () => {
  const provider = ethers.provider;
  const vaiController = new ethers.Contract(VAI_UNITROLLER, VAI_CONTROLLER_ABI, provider);
  const vai = new ethers.Contract(VAI, ERC20_ABI, provider);

  let vaiHolder: SignerWithAddress;

  before(async () => {
    vaiHolder = await initMainnetUser(VAI_HOLDER, parseEther("1"));
    await setMaxStaleCoreAssets(CHAINLINK, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP state", () => {
    it("has the old implementation", async () => {
      expect(await vaiController.vaiControllerImplementation()).to.equal(OLD_VAI_CONTROLLER_IMPL);
    });
  });

  testVip("VAIController upgrade VIP", await vip299(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VAI_CONTROLLER_ABI], ["NewImplementation"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    it("has the new implementation", async () => {
      expect(await vaiController.vaiControllerImplementation()).to.equal(NEW_VAI_CONTROLLER_IMPL);
    });

    it("allows to repay a full borrow on behalf of someone", async () => {
      await vai.connect(vaiHolder).approve(vaiController.address, ethers.constants.MaxUint256);
      const tx = await vaiController
        .connect(vaiHolder)
        .repayVAIBehalf(ACCOUNT_TO_REPAY_ON_BEHALF, ethers.constants.MaxUint256);
      await expect(tx)
        .to.emit(vaiController, "RepayVAI")
        .withArgs(VAI_HOLDER, ACCOUNT_TO_REPAY_ON_BEHALF, parseUnits("100.494915964814254246", 18));
    });
  });
});
