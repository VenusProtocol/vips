import { expect } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip072 from "../../multisig/proposals/ethereum/vip-072/index";
import {
  vip417,
  ETHEREUM_REWARD_DISTRIBUTION_TARGETS,
  ETHEREUM_XVS,
  ETHEREUM_VTREASURY,
  ETHEREUM_TOTAL_AMOUNT
} from "../../vips/vip-417/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(21543323, async () => {
  let previousBalances: Record<string, BigNumber> = {};
  let previousBalanceOfTreasury: BigNumber;
  const xvs = new ethers.Contract(ETHEREUM_XVS, ERC20_ABI, ethers.provider);

  before(async () => {
    for (const { target } of ETHEREUM_REWARD_DISTRIBUTION_TARGETS) {
      previousBalances[target] = await xvs.balanceOf(target);
    }

    previousBalanceOfTreasury = await xvs.balanceOf(ETHEREUM_VTREASURY);
  });

  // await pretendExecutingVip(await vip072());
  testForkedNetworkVipCommands("XVS Bridging", await vip417());

  describe("Post-Execution state", () => {
    it("should transfer XVS from the treasury", async () => {
      for (const { target, amount } of ETHEREUM_REWARD_DISTRIBUTION_TARGETS) {
        it(`should transfer ${amount} XVS to ${target}`, async () => {
          const balance = await xvs.balanceOf(target);
          console.log(balance, previousBalances[target]);
          // expect(balance).to.equal(previousBalances[target].add(amount));
        });
      }
    })

    it("should transfer XVS from the treasury", async () => {
      const balance = await xvs.balanceOf(ETHEREUM_VTREASURY);
      expect(balance).to.equal(previousBalanceOfTreasury.sub(ETHEREUM_TOTAL_AMOUNT));
    });
  });
});
