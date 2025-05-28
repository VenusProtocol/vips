import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { APXETH, DINERO, DINERO_AMOUNT, vip501 } from "../../vips/vip-501/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasuryEthereumAbi.json";

forking(22579756, async () => {
  const apxETH = new ethers.Contract(APXETH, ERC20_ABI, ethers.provider);

  let prevAPXETHBalanceOfDinero: BigNumber;

  before(async () => {
    prevAPXETHBalanceOfDinero = await apxETH.balanceOf(DINERO);
  });

  testForkedNetworkVipCommands("VIP-501", await vip501(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryToken"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const apxETHBalanceOfDinero = await apxETH.balanceOf(DINERO);

      expect(apxETHBalanceOfDinero.sub(prevAPXETHBalanceOfDinero)).to.equal(DINERO_AMOUNT);
    });
  });
});
