import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip459, {
  ETHEREUM_BAL,
  ETHEREUM_BAL_LIQUIDITY,
  ETHEREUM_CORE_COMPTROLLER,
  ETHEREUM_CRITICAL_TIMELOCK,
  ETHEREUM_vBAL_CORE,
  ETHEREUM_vBAL_CORE_SUPPLY_CAP,
  VBAL_RECEIVER,
} from "../../vips/vip-459/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(21946612, async () => {
  const provider = ethers.provider;
  let prevBALBalanceReceiver: BigNumber;

  const comptrollerCore = new ethers.Contract(ETHEREUM_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);
  const bal = new ethers.Contract(ETHEREUM_BAL, ERC20_ABI, provider);
  const vBAL = new ethers.Contract(ETHEREUM_vBAL_CORE, ERC20_ABI, provider);

  before(async () => {
    prevBALBalanceReceiver = await vBAL.balanceOf(VBAL_RECEIVER);
  });

  describe("Pre-VIP behaviour", async () => {
    it("correct supply cap for vBAL", async () => {
      expect(await comptrollerCore.supplyCaps(ETHEREUM_vBAL_CORE)).to.equal(parseUnits("4000000", 18));
    });

    it("Critical timelock has BAL tokens", async () => {
      expect(await bal.balanceOf(ETHEREUM_CRITICAL_TIMELOCK)).to.equal(ETHEREUM_BAL_LIQUIDITY);
    });
  });

  testForkedNetworkVipCommands("vip459", await vip459());

  describe("Post-VIP behaviour", async () => {
    it("correct supply cap for vBAL", async () => {
      expect(await comptrollerCore.supplyCaps(ETHEREUM_vBAL_CORE)).to.equal(ETHEREUM_vBAL_CORE_SUPPLY_CAP);
    });

    it("Critical timelock has no BAL tokens", async () => {
      expect(await bal.balanceOf(ETHEREUM_CRITICAL_TIMELOCK)).to.equal(0);
    });

    it("Critical timelock has no vBAL tokens", async () => {
      expect(await vBAL.balanceOf(ETHEREUM_CRITICAL_TIMELOCK)).to.equal(0);
    });

    it("vBAL tokens have been burned", async () => {
      const newBalance = await vBAL.balanceOf(VBAL_RECEIVER);
      expect(newBalance).gt(prevBALBalanceReceiver);
    });
  });
});
