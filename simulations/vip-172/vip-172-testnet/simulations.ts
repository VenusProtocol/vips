import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip172Testnet } from "../../../vips/vip-172/vip-172-testnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import LIQUIDATOR_ABI from "./abi/liquidator.json";
import UNITROLLER_ABI from "./abi/unitroller.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const CHAINLINK_ADDRESS = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

const NEW_COMPTROLLER_IMPLEMENTATION = "0xa8A476AD16727CE641f27d7738D2D341Ebad81CC";
const BUSD = "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47";
const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
const BUSD_FEED = "0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa";

const BUSD_BORROWER = "0x3456f6d0bd2484482675068542bBa4FcD13dBac7";
const BUSD_HOLDER = "0x202963d793C3973aFd14A3B435507Cb4194f3E9A";

forking(33246200, async () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ADDRESS, BUSD, BUSD_FEED, NORMAL_TIMELOCK);
  });

  testVip("VIP-172 Forced liquidations", await vip172Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [UNITROLLER_ABI, COMPTROLLER_ABI],
        ["NewImplementation", "NewPendingImplementation", "Failure"],
        [1, 2, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should have the new implementation", async () => {
      expect(await comptroller.comptrollerImplementation()).to.equal(NEW_COMPTROLLER_IMPLEMENTATION);
    });

    it("allows critical timelock to enable forced liquidations", async () => {
      const timelockSigner = await initMainnetUser(CRITICAL_TIMELOCK, parseEther("1"));
      await comptroller.connect(timelockSigner)._setForcedLiquidation(VBUSD, true);
      expect(await comptroller.isForcedLiquidationEnabled(VBUSD)).to.equal(true);
    });

    it("liquidates a healthy BUSD borrow, repaying more than close factor allows", async () => {
      const timelockSigner = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      const liquidatorSinger = await initMainnetUser(BUSD_HOLDER, parseEther("1"));
      const liquidator = await ethers.getContractAt(LIQUIDATOR_ABI, await comptroller.liquidatorContract());
      const busd = await ethers.getContractAt(ERC20_ABI, BUSD);
      const repayAmount = parseUnits("1001", 18);

      // Silence the "liquidate VAI first" error
      await liquidator.connect(timelockSigner).setMinLiquidatableVAI(parseUnits("1000000", 18));
      await busd.connect(liquidatorSinger).approve(liquidator.address, repayAmount);
      const tx = await liquidator.connect(liquidatorSinger).liquidateBorrow(VBUSD, BUSD_BORROWER, repayAmount, VBUSD);
      const protocolShare = "246216236448";
      const liquidatorShare = "5170540965408";
      await expect(tx)
        .to.emit(liquidator, "LiquidateBorrowedTokens")
        .withArgs(BUSD_HOLDER, BUSD_BORROWER, repayAmount, VBUSD, VBUSD, protocolShare, liquidatorShare);
    });
  });
});
