import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip408, {
  MAX_DAILY_LIMIT,
  OMNICHAIN_PROPOSAL_SENDER,
  USDT,
  USDT_AMOUNT,
  VENUS_STARS_TREASURY,
} from "../../vips/vip-408/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import ERC20_ABI from "./abi/ERC20.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VTREASURY_ABI from "./abi/VtreasuryAbi.json";

const { basemainnet } = NETWORK_ADDRESSES;
forking(44757538, async () => {
  const provider = ethers.provider;
  const omnichainProposalSender = new ethers.Contract(
    OMNICHAIN_PROPOSAL_SENDER,
    OMNICHAIN_PROPOSAL_SENDER_ABI,
    provider,
  );
  let usdt: Contract;
  let balanceOfVenusStartsTreasury: BigNumber;

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      usdt = new ethers.Contract(USDT, ERC20_ABI, provider);
      balanceOfVenusStartsTreasury = await usdt.balanceOf(VENUS_STARS_TREASURY);
    });

    it("Daily limit should be 0", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.basemainnet)).to.equals(0);
    });
    it("Trusted remote should not be set", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.basemainnet)).to.be.equals("0x");
    });
  });

  testVip("vip408 give permissions to timelock", await vip408(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["SetMaxDailyLimit", "SetTrustedRemoteAddress", "ExecuteRemoteProposal", "StorePayload"],
        [1, 1, 1, 0],
      );
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("Daily limit should be 100 of basemainnet", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.basemainnet)).to.equals(MAX_DAILY_LIMIT);
    });

    it("Trusted remote should be set of basemainnet", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.basemainnet)).to.be.equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [basemainnet.OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_PROPOSAL_SENDER],
        ),
      );
    });

    it("check usdt balance of VenusStartsTreasury", async () => {
      const newBalanceOfVenusStartsTreasury = await usdt.balanceOf(VENUS_STARS_TREASURY);
      expect(newBalanceOfVenusStartsTreasury).to.equals(balanceOfVenusStartsTreasury.add(USDT_AMOUNT));
    });
  });
});
