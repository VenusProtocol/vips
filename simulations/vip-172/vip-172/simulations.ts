import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser, setMaxStaleCoreAssets } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip172 } from "../../../vips/vip-172/vip-172";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import LIQUIDATOR_ABI from "./abi/liquidator.json";
import UNITROLLER_ABI from "./abi/unitroller.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const CHAINLINK_ADDRESS = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

const NEW_COMPTROLLER_IMPLEMENTATION = "0xb5Cb55cAbC34544C708289D899Dfe2f190794C8D";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const BUSD_BORROWER = "0x36D023d3Bb82b3ee3BCa30701f2C61329572b688";
const BUSD_HOLDER = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";

forking(31850000, async () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStaleCoreAssets(CHAINLINK_ADDRESS, NORMAL_TIMELOCK);
  });

  testVip("VIP-172 Forced liquidations", await vip172(), {
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
      const liquidatorSinger = await initMainnetUser(BUSD_HOLDER, parseEther("1"));
      const liquidator = await ethers.getContractAt(LIQUIDATOR_ABI, await comptroller.liquidatorContract());
      const busd = await ethers.getContractAt(ERC20_ABI, BUSD);
      const repayAmount = parseUnits("4", 18);

      await busd.connect(liquidatorSinger).approve(liquidator.address, repayAmount);
      const tx = await liquidator.connect(liquidatorSinger).liquidateBorrow(VBUSD, BUSD_BORROWER, repayAmount, VBTC);
      const protocolShare = "35976";
      const liquidatorShare = "755516";
      await expect(tx)
        .to.emit(liquidator, "LiquidateBorrowedTokens")
        .withArgs(BUSD_HOLDER, BUSD_BORROWER, repayAmount, VBUSD, VBTC, protocolShare, liquidatorShare);
    });
  });
});
