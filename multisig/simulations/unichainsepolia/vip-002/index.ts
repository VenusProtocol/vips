import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip002, {
  ARBITRUM_SEPOLIA_TRUSTED_REMOTE,
  BNB_TESTNET_TRUSTED_REMOTE,
  OPBNB_TESTNET_TRUSTED_REMOTE,
  OP_SEPOLIA_TRUSTED_REMOTE,
  SEPOLIA_TRUSTED_REMOTE,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_BRIDGE_DEST,
  XVS_MINT_LIMIT,
  ZKSYNC_SEPOLIA_TRUSTED_REMOTE,
  BASE_SEPOLIA_TRUSTED_REMOTE,
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  MIN_DEST_GAS,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT
} from "../../../proposals/unichainsepolia/vip-002";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const { unichainsepolia } = NETWORK_ADDRESSES;
const REGULAR_USER = "0xd7b572EeE55B6C4725469ef6Df5ceaa77374E641";

type NetworkTrustedRemoteMap = {
  [key in "bsctestnet" | "opbnbtestnet" | "sepolia" | "arbitrumsepolia" | "zksyncsepolia" | "opsepolia" | "basesepolia"]: string;
};

type ChainIds = {
  [key in "bsctestnet" | "opbnbtestnet" | "sepolia" | "arbitrumsepolia" | "zksyncsepolia" | "opsepolia" | "basesepolia"]: number;
};

const chainIds: ChainIds = {
  bsctestnet: LzChainId.bsctestnet,
  opbnbtestnet: LzChainId.opbnbtestnet,
  sepolia: LzChainId.sepolia,
  arbitrumsepolia: LzChainId.arbitrumsepolia,
  zksyncsepolia: LzChainId.zksyncsepolia,
  opsepolia: LzChainId.opsepolia,
  basesepolia: LzChainId.basesepolia
};

const networksTrustedRemote: NetworkTrustedRemoteMap = {
  bsctestnet: BNB_TESTNET_TRUSTED_REMOTE,
  opbnbtestnet: OPBNB_TESTNET_TRUSTED_REMOTE,
  sepolia: SEPOLIA_TRUSTED_REMOTE,
  arbitrumsepolia: ARBITRUM_SEPOLIA_TRUSTED_REMOTE,
  zksyncsepolia: ZKSYNC_SEPOLIA_TRUSTED_REMOTE,
  opsepolia: OP_SEPOLIA_TRUSTED_REMOTE,
  basesepolia: BASE_SEPOLIA_TRUSTED_REMOTE
};

forking(4547246, async () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN_PROXY);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE_DEST);
  });

  describe("Pre-Execution state", () => {
    it("Bridge Owner != unichain sepolia multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).not.equal(unichainsepolia.GUARDIAN);
    });

    it("Trusted remote should not exist for any network(bsctestnet, opbnbtestnet, sepolia, arbitumsepolia, zksyncsepolia, opsepolia)", async () => {
      for (const network in chainIds) {
        await expect(xvsBridge.getTrustedRemoteAddress(chainIds[network as keyof ChainIds])).to.be.revertedWith(
          "LzApp: no trusted path record",
        );
      }
    });

    it("Mint limit = 0", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(0);
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(await vip002());
    });

    it("Should set bridge owner to multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).equals(unichainsepolia.GUARDIAN);
    });

    it("Should whitelist MULTISIG and TREASURY", async () => {
      let res = await xvsBridge.whitelist(unichainsepolia.GUARDIAN);
      expect(res).equals(true);

      res = await xvsBridge.whitelist(unichainsepolia.VTREASURY);
      expect(res).equals(true);
    });

    it("Should set trusted remote address in bridge for all six networks", async () => {
      for (const network in networksTrustedRemote) {
        const trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId[network as keyof typeof LzChainId]);
        expect(trustedRemote).equals(networksTrustedRemote[network as keyof NetworkTrustedRemoteMap]);
      }
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(XVS_MINT_LIMIT);
    });

    it("Should set correct token address in bridge", async () => {
      const token = await xvsBridge.token();
      expect(token).equals(XVS);
    });
    for (const network in chainIds) {
      it(`Should set correct max daily limit for ${network}`, async () => {
        const limit = await xvsBridge.chainIdToMaxDailyLimit(chainIds[network as keyof ChainIds]);
        expect(limit).equals(MAX_DAILY_SEND_LIMIT);
      });

      it(`Should set correct max single limit for ${network}`, async () => {
        const limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(chainIds[network as keyof ChainIds]);
        expect(limit).equals(SINGLE_SEND_LIMIT);
      });

      it(`Should set correct max daily receive limit for ${network}`, async () => {
        const limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(chainIds[network as keyof ChainIds]);
        expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);
      });

      it(`Should set correct max single receive limit for ${network}`, async () => {
        const limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(chainIds[network as keyof ChainIds]);
        expect(limit).equals(SINGLE_RECEIVE_LIMIT);
      });

      it(`Should set correct min destination gas for ${network}`, async () => {
        const limit = await xvsBridge.minDstGasLookup(chainIds[network as keyof ChainIds], 0);
        expect(limit).equals(MIN_DEST_GAS);
      });
    }
  });

  describe("Post-Execution extra checks", () => {
    it(`should fail if someone else tries to mint XVS`, async () => {
      const regularUser = await initMainnetUser(REGULAR_USER, parseEther("1"));

      await expect(xvs.connect(regularUser).mint(REGULAR_USER, 1)).to.be.revertedWithCustomError(xvs, "Unauthorized");
    });

    it(`should fail if someone else tries to burn XVS`, async () => {
      const regularUser = await initMainnetUser(REGULAR_USER, parseEther("1"));

      await expect(xvs.connect(regularUser).burn(REGULAR_USER, 1)).to.be.revertedWithCustomError(xvs, "Unauthorized");
    });
  });
});
