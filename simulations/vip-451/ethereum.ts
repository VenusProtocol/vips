import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip451, { RECIPIENT, TRANSFERS } from "../../vips/vip-451/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";

forking(21828630, async () => {
  const provider = ethers.provider;
  const prevBalance: any = {};

  before(async () => {
    for (const transfer of TRANSFERS) {
      const token = new ethers.Contract(transfer.token, ERC20_ABI, provider);
      prevBalance[transfer.token] = await token.balanceOf(RECIPIENT);
    }
  });

  testForkedNetworkVipCommands("vip451", await vip451());

  describe("Post-VIP state", () => {
    for (const transfer of TRANSFERS) {
      it(`should transfer ${transfer.amount} of ${transfer.name} to ${RECIPIENT}`, async () => {
        const token = new ethers.Contract(transfer.token, ERC20_ABI, provider);
        const newBalance = await token.balanceOf(RECIPIENT);
        expect(newBalance.sub(prevBalance[transfer.token])).to.eq(transfer.amount);
      });
    }
  });
});
