import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser, setMaxStaleCoreAssets } from "src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "src/vip-framework";

import vip299 from "../../vips/vip-299/bscmainnet";
import { NEW_VAI_CONTROLLER_IMPL, VAI_UNITROLLER } from "../../vips/vip-299/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import VAI_CONTROLLER_ABI from "./abi/VAIController.json";

const LIQUIDATOR = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const OLD_VAI_CONTROLLER_IMPL = "0x9817823d5C4023EFb6173099928F17bb77CD1d69";
const VAI_HOLDER = "0x0667Eed0a0aAb930af74a3dfeDD263A73994f216";
const ACCOUNT_TO_LIQUIDATE = "0x9db0984C17566eB3f4eE975EF566dC21bbDc278e";
const ACCOUNT_TO_REPAY_ON_BEHALF = "0x33454D23fB15ae91CDe5085e0c43AEC1f2082C8b";

const CHAINLINK = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

forking(38306755, async () => {
  const provider = ethers.provider;
  const vaiController = new ethers.Contract(VAI_UNITROLLER, VAI_CONTROLLER_ABI, provider);
  const vai = new ethers.Contract(VAI, ERC20_ABI, provider);
  const vBUSD = new ethers.Contract(VBUSD, ERC20_ABI, provider);
  const liquidator = new ethers.Contract(LIQUIDATOR, LIQUIDATOR_ABI, provider);

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
        .withArgs(VAI_HOLDER, ACCOUNT_TO_REPAY_ON_BEHALF, parseUnits("3431.309617966502829444", 18));
      expect(await vaiController.getVAIRepayAmount(ACCOUNT_TO_REPAY_ON_BEHALF)).to.equal(0);
    });

    it("distributes a fair amount during liquidations", async () => {
      const repayAmount = parseUnits("500", 18);
      await vai.connect(vaiHolder).approve(LIQUIDATOR, ethers.constants.MaxUint256);
      const tx = await liquidator
        .connect(vaiHolder)
        .liquidateBorrow(vaiController.address, ACCOUNT_TO_LIQUIDATE, repayAmount, VBUSD);
      const seizedVTokens = parseUnits("24657.71673499", 8); // around 550 BUSD
      await expect(tx)
        .to.emit(vaiController, "LiquidateVAI")
        .withArgs(LIQUIDATOR, ACCOUNT_TO_LIQUIDATE, parseUnits("499.999999999999997865", 18), VBUSD, seizedVTokens);
      const liquidatedAccountDelta = BigNumber.from(0).sub(seizedVTokens);
      const liquidatorShare = parseUnits("23536.91142886", 8); // around 525 BUSD
      await expect(tx).to.changeTokenBalances(
        vBUSD,
        [ACCOUNT_TO_LIQUIDATE, VAI_HOLDER],
        [liquidatedAccountDelta, liquidatorShare],
      );
    });
  });
});
