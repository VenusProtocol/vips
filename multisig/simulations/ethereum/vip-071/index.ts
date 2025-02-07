import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip071, { LBTC, WBTC, WBTC_RECEIVER } from "../../../proposals/ethereum/vip-071";
import ERC20_ABI from "./abi/erc20.json";

const { NORMAL_TIMELOCK, VTREASURY } = NETWORK_ADDRESSES.ethereum;

forking(21285800, async () => {
  const lbtc = new ethers.Contract(LBTC, ERC20_ABI, ethers.provider);
  const wbtc = new ethers.Contract(WBTC, ERC20_ABI, ethers.provider);
  let wbtcReceiverBalanceBefore: BigNumber;

  before(async () => {
    wbtcReceiverBalanceBefore = await wbtc.balanceOf(WBTC_RECEIVER);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip071());
    });

    it("transfers initial supply from treasury to normal timelock", async () => {
      expect(await lbtc.balanceOf(NORMAL_TIMELOCK)).to.equal(parseUnits("0.106", 8));
      expect(await lbtc.balanceOf(VTREASURY)).to.equal(0);
    });

    it(`transfers 0.006 WBTC to ${WBTC_RECEIVER}`, async () => {
      const wbtcReceiverBalanceAfter = await wbtc.balanceOf(WBTC_RECEIVER);
      expect(wbtcReceiverBalanceAfter.sub(wbtcReceiverBalanceBefore)).to.equal(parseUnits("0.006", 8));
    });
  });
});
