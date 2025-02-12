import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip449, { RECIPIENT, TRANSFERS } from "../../vips/vip-449/bscmainnet";
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

  testForkedNetworkVipCommands("vip449", await vip449());

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
