import { expect } from "chai";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { networkChainIds } from "../../../src/utils";
import { forking, pretendExecutingVip } from "../../../src/vip-framework";
import { vip260Testnet } from "../../../vips/vip-260/bsctestnet";
import VotesSyncReceiver_ABI from "./abi/votesSyncReceiverAbi.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(37908025, async () => {
  const provider = ethers.provider;
  let votesSyncReceiver: ethers.Contract;

  before(async () => {
    votesSyncReceiver = new ethers.Contract(bsctestnet.VOTE_SYNC_RECEIVER, VotesSyncReceiver_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("Trusted remote is not set", async () => {
      expect(await votesSyncReceiver.trustedRemoteLookup(networkChainIds["sepolia"])).to.equal("0x");
    });
  });

  describe("Post-VIP behaviour", async () => {
    before(async () => {
      await pretendExecutingVip(vip260Testnet());
    });
    it("Trusted remote is set", async () => {
      const destinationAdd = ethers.utils.solidityPack(
        ["address", "address"],
        [bsctestnet.VOTE_SYNC_SENDER, bsctestnet.VOTE_SYNC_RECEIVER],
      );
      expect(await votesSyncReceiver.trustedRemoteLookup(networkChainIds["sepolia"])).to.equal(destinationAdd);
    });
  });
});
