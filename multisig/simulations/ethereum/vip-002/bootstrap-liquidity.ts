import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip002 from "../../../proposals/ethereum/vip-002/bootstrap-liquidity";
import ERC20_ABI from "./abi/erc20.json";

const VTREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
const NORMAL_TIMELOCK = NETWORK_ADDRESSES.ethereum.NORMAL_TIMELOCK;
const UNI_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const BBTC = "0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541";
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

const BBTC_AMOUNT = parseUnits("0.3", 8);
const WBTC_AMOUNT = parseUnits("0.29818818", 8);

forking(19032429, async () => {
  let wbtc: Contract;
  let bbtc: Contract;
  let oldWBTCBalance: BigNumber;
  let oldBBTCBalance: BigNumber;

  before(async () => {
    wbtc = new ethers.Contract(WBTC, ERC20_ABI, ethers.provider);
    bbtc = new ethers.Contract(BBTC, ERC20_ABI, ethers.provider);
    oldWBTCBalance = await wbtc.balanceOf(VTREASURY);
    oldBBTCBalance = await bbtc.balanceOf(VTREASURY);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip002());
    });

    it("should transfer BBTC out of treasury", async () => {
      const currentBBTCBalance = await bbtc.balanceOf(VTREASURY);
      expect(oldBBTCBalance.sub(currentBBTCBalance)).equals(BBTC_AMOUNT);
    });

    it("should transfer WBTC to treasury", async () => {
      const currentWBTCBalance = await wbtc.balanceOf(VTREASURY);
      expect(currentWBTCBalance.sub(oldWBTCBalance)).equals(WBTC_AMOUNT);
    });

    it("should not keep BBTC in the multisig", async () => {
      expect(await bbtc.balanceOf(NORMAL_TIMELOCK)).equals(0);
    });

    it("should not keep WBTC in the multisig", async () => {
      expect(await wbtc.balanceOf(NORMAL_TIMELOCK)).equals(0);
    });

    it("should not have any remaining approvals", async () => {
      expect(await bbtc.allowance(NORMAL_TIMELOCK, UNI_V3_ROUTER)).equals(0);
    });
  });
});
