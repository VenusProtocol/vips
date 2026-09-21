import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip672, {
  DEPLOYER,
  GUARDED_IMPLEMENTATION,
  PENDLE_PT_VAULT_ADAPTER,
  PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN,
  UNGUARDED_IMPLEMENTATION,
} from "../../vips/vip-672/bscmainnet";

const { bscmainnet } = NETWORK_ADDRESSES;

// Fork after the frontend was repointed at the VIP-606 adapter and before the deployer starts the
// handover, so the pre-VIP state below is the live state.
const FORK_BLOCK = 123100000;

const ADAPTER_ABI = [
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function paused() view returns (bool)",
  "function accessControlManager() view returns (address)",
  "function transferOwnership(address newOwner)",
  "function pause()",
  "function unpause()",
  "function addMarket(address pendleMarket, address vToken)",
  "function getAllMarkets() view returns (address[])",
];

const PROXY_ADMIN_ABI = [
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
  "function getProxyImplementation(address proxy) view returns (address)",
];

const ACM_ABI = ["function hasRole(bytes32 role, address account) view returns (bool)"];

// The ACM role for a contract-scoped permission is keccak256(abi.encodePacked(contract, functionSig)).
const roleFor = (contractAddress: string, functionSig: string) =>
  ethers.utils.keccak256(
    ethers.utils.solidityPack(["address", "string"], [contractAddress, functionSig]),
  );

forking(FORK_BLOCK, async () => {
  let adapter: Contract;
  let proxyAdmin: Contract;
  let acm: Contract;
  let deployer: SignerWithAddress;
  let rando: SignerWithAddress;

  before(async () => {
    adapter = await ethers.getContractAt(ADAPTER_ABI, PENDLE_PT_VAULT_ADAPTER);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN);
    acm = await ethers.getContractAt(ACM_ABI, bscmainnet.ACCESS_CONTROL_MANAGER);

    deployer = await initMainnetUser(DEPLOYER, ethers.utils.parseEther("1"));
    rando = await initMainnetUser("0x00000000000000000000000000000000DeaDBeef", ethers.utils.parseEther("1"));
  });

  describe("Pre-VIP state", async () => {
    it("adapter and its ProxyAdmin are owned by the deployer EOA, not the Normal Timelock", async () => {
      expect(await adapter.owner()).to.equal(DEPLOYER);
      expect(await proxyAdmin.owner()).to.equal(DEPLOYER);
    });

    it("proxy runs the implementation that is missing the access-control checks", async () => {
      expect(await proxyAdmin.getProxyImplementation(PENDLE_PT_VAULT_ADAPTER)).to.equal(UNGUARDED_IMPLEMENTATION);
    });

    it("pause() and unpause() are callable by any address", async () => {
      expect(await adapter.paused()).to.equal(false);
      // callStatic so the assertion does not leave the fork paused.
      await expect(adapter.connect(rando).callStatic.pause()).to.not.be.reverted;
    });

    it("the Normal Timelock holds no ACM permissions on this adapter yet", async () => {
      for (const sig of ["pause()", "unpause()", "addMarket(address,address)"]) {
        expect(await acm.hasRole(roleFor(PENDLE_PT_VAULT_ADAPTER, sig), bscmainnet.NORMAL_TIMELOCK)).to.equal(false);
      }
    });
  });

  describe("Prerequisite transactions from the deployer", async () => {
    it("deployer starts the adapter handover and hands over the ProxyAdmin outright", async () => {
      await adapter.connect(deployer).transferOwnership(bscmainnet.NORMAL_TIMELOCK);
      await proxyAdmin.connect(deployer).transferOwnership(bscmainnet.NORMAL_TIMELOCK);

      // Ownable2Step: the adapter only records a pending owner until acceptOwnership() runs.
      expect(await adapter.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await adapter.owner()).to.equal(DEPLOYER);
      // Single-step Ownable: the ProxyAdmin is already under governance.
      expect(await proxyAdmin.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-672 Pendle PT Adapter Governance Handover", await vip672(), {});

  describe("Post-VIP state", async () => {
    it("adapter is owned by the Normal Timelock with no pending owner left", async () => {
      expect(await adapter.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await adapter.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("proxy runs the guarded implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(PENDLE_PT_VAULT_ADAPTER)).to.equal(GUARDED_IMPLEMENTATION);
    });

    it("pause(), unpause() and addMarket() are no longer callable by an arbitrary address", async () => {
      await expect(adapter.connect(rando).callStatic.pause()).to.be.reverted;
      await expect(adapter.connect(rando).callStatic.unpause()).to.be.reverted;
      await expect(
        adapter.connect(rando).callStatic.addMarket(ethers.constants.AddressZero, ethers.constants.AddressZero),
      ).to.be.reverted;
    });

    it("grants pause and unpause to all three timelocks and the Guardian", async () => {
      for (const account of [
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ]) {
        expect(await acm.hasRole(roleFor(PENDLE_PT_VAULT_ADAPTER, "pause()"), account)).to.equal(true);
        expect(await acm.hasRole(roleFor(PENDLE_PT_VAULT_ADAPTER, "unpause()"), account)).to.equal(true);
      }
    });

    it("grants addMarket to the Normal Timelock only", async () => {
      const role = roleFor(PENDLE_PT_VAULT_ADAPTER, "addMarket(address,address)");
      expect(await acm.hasRole(role, bscmainnet.NORMAL_TIMELOCK)).to.equal(true);
      expect(await acm.hasRole(role, bscmainnet.GUARDIAN)).to.equal(false);
    });

    it("leaves the registered market and the unpaused state untouched", async () => {
      expect(await adapter.paused()).to.equal(false);
      expect(await adapter.getAllMarkets()).to.deep.equal(["0x3C1a3D6B69A866444Fe506F7D38a00a1C2D859C5"]);
    });
  });
});
