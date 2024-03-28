import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip230 } from "../../vips/vip-230";
import ERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import REWARD_FACET_ABI from "./abi/RewardFacet.json";

const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

forking(34925177, () => {
  let xvs: Contract;
  before(async () => {
    const provider = ethers.provider;
    xvs = new ethers.Contract(XVS, ERC20_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Check XVS balance", async () => {
      const prevBalanceComptroller = await xvs.balanceOf(COMPTROLLER);
      expect(prevBalanceComptroller).to.equal("14303482694193242357204594");

      const prevBalanceXVSStore = await xvs.balanceOf(XVS_STORE);
      expect(prevBalanceXVSStore).to.equal("43993251264814789517747");
    });
  });

  testVip("VIP-230 Venus Recommend Parameters", vip230(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [REWARD_FACET_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check XVS Balance", async () => {
      const _newBalanceComptroller = BigNumber.from("14303482694193242357204594").sub(parseUnits("191100", 18));
      const newBalanceComptroller = await xvs.balanceOf(COMPTROLLER);
      expect(_newBalanceComptroller).to.equal(newBalanceComptroller);

      const _newBalanceXVSStore = BigNumber.from("43993251264814789517747").add(parseUnits("191100", 18));
      const newBalanceXVSStore = await xvs.balanceOf(XVS_STORE);
      expect(_newBalanceXVSStore).to.equal(newBalanceXVSStore);
    });
  });
});
