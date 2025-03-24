import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip070, { PUFETH } from "../../../proposals/ethereum/vip-070";
import ERC20_ABI from "./abi/erc20.json";

const { NORMAL_TIMELOCK, VTREASURY } = NETWORK_ADDRESSES.ethereum;

forking(21130180, async () => {
  const pufETH = new ethers.Contract(PUFETH, ERC20_ABI, ethers.provider);

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip070());
    });

    it("transfers initial supply from treasury to normal timelock", async () => {
      expect(await pufETH.balanceOf(NORMAL_TIMELOCK)).to.equal(parseUnits("5", 18));
      expect(await pufETH.balanceOf(VTREASURY)).to.equal(0);
    });
  });
});
