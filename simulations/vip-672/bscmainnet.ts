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

// Fork after the deployer's two handover transactions, both mined 2026-09-21:
//   adapter.transferOwnership(NORMAL_TIMELOCK)    block 123125269
//   proxyAdmin.transferOwnership(NORMAL_TIMELOCK) block 123125372
const FORK_BLOCK = 123125400;

const ADAPTER_ABI = [
  "error Unauthorized(address sender, address calledContract, string methodSignature)",
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function paused() view returns (bool)",
  "function accessControlManager() view returns (address)",
  "function pause()",
  "function unpause()",
  "function addMarket(address pendleMarket, address vToken)",
  "function getAllMarkets() view returns (address[])",
  "function markets(address) view returns (address pt, address sy, address yt, address vToken, uint256 maturity)",
  "function PENDLE_ROUTER() view returns (address)",
  "function COMPTROLLER() view returns (address)",
];

const PROXY_ADMIN_ABI = [
  "function owner() view returns (address)",
  "function getProxyImplementation(address proxy) view returns (address)",
];

const ACM_ABI = ["function isAllowedToCall(address account, string functionSig) view returns (bool)"];
const MARKET = "0x3C1a3D6B69A866444Fe506F7D38a00a1C2D859C5";
const FUNCTION_SIGNATURES = ["pause()", "unpause()", "addMarket(address,address)"];
const GOVERNANCE_ACCOUNTS = [
  bscmainnet.NORMAL_TIMELOCK,
  bscmainnet.FAST_TRACK_TIMELOCK,
  bscmainnet.CRITICAL_TIMELOCK,
  bscmainnet.GUARDIAN,
  bscmainnet.CRITICAL_GUARDIAN,
  "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF", // Oracle Guardian
];

forking(FORK_BLOCK, async () => {
  let adapter: Contract;
  let proxyAdmin: Contract;
  let acm: Contract;
  let rando: SignerWithAddress;
  let initialMarket: unknown;
  let initialRouter: string;
  let initialComptroller: string;

  // Use the adapter as ACM caller to cover both contract-scoped and wildcard roles.
  const isAllowed = (account: string, signature: string) =>
    acm.connect(ethers.provider).callStatic.isAllowedToCall(account, signature, { from: PENDLE_PT_VAULT_ADAPTER });

  before(async () => {
    adapter = await ethers.getContractAt(ADAPTER_ABI, PENDLE_PT_VAULT_ADAPTER);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN);
    acm = await ethers.getContractAt(ACM_ABI, bscmainnet.ACCESS_CONTROL_MANAGER);

    rando = await initMainnetUser("0x00000000000000000000000000000000DeaDBeef", ethers.utils.parseEther("1"));
    initialMarket = await adapter.markets(MARKET);
    initialRouter = await adapter.PENDLE_ROUTER();
    initialComptroller = await adapter.COMPTROLLER();
  });

  describe("Pre-VIP state", async () => {
    it("the deployer's handover transactions have landed", async () => {
      // Ownable2Step: the adapter records the Normal Timelock as pending owner only.
      expect(await adapter.owner()).to.equal(DEPLOYER);
      expect(await adapter.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      // Single-step Ownable: the ProxyAdmin is already under governance.
      expect(await proxyAdmin.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("proxy runs the implementation that is missing the access-control checks", async () => {
      expect(await proxyAdmin.getProxyImplementation(PENDLE_PT_VAULT_ADAPTER)).to.equal(UNGUARDED_IMPLEMENTATION);
    });

    it("pause() and unpause() are callable by any address", async () => {
      expect(await adapter.paused()).to.equal(false);
      await adapter.connect(rando).pause();
      expect(await adapter.paused()).to.equal(true);
      await adapter.connect(rando).unpause();
      expect(await adapter.paused()).to.equal(false);
    });

    it("governance, deployer and outsider hold no effective ACM permissions on this adapter", async () => {
      for (const account of [...GOVERNANCE_ACCOUNTS, DEPLOYER, rando.address]) {
        for (const sig of FUNCTION_SIGNATURES) {
          expect(await isAllowed(account, sig)).to.equal(false);
        }
      }
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
      await expect(adapter.connect(rando).callStatic.pause())
        .to.be.revertedWithCustomError(adapter, "Unauthorized")
        .withArgs(rando.address, PENDLE_PT_VAULT_ADAPTER, "pause()");
      await expect(adapter.connect(rando).callStatic.unpause())
        .to.be.revertedWithCustomError(adapter, "Unauthorized")
        .withArgs(rando.address, PENDLE_PT_VAULT_ADAPTER, "unpause()");
      await expect(
        adapter.connect(rando).callStatic.addMarket(ethers.constants.AddressZero, ethers.constants.AddressZero),
      )
        .to.be.revertedWithCustomError(adapter, "Unauthorized")
        .withArgs(rando.address, PENDLE_PT_VAULT_ADAPTER, "addMarket(address,address)");
    });

    it("leaves governance, deployer and outsider without effective ACM permissions", async () => {
      for (const account of [...GOVERNANCE_ACCOUNTS, DEPLOYER, rando.address]) {
        for (const sig of FUNCTION_SIGNATURES) {
          expect(await isAllowed(account, sig)).to.equal(false);
        }
      }
    });

    it("preserves the full market configuration, integrations and unpaused state", async () => {
      expect(await adapter.paused()).to.equal(false);
      expect(await adapter.getAllMarkets()).to.deep.equal([MARKET]);
      expect(await adapter.markets(MARKET)).to.deep.equal(initialMarket);
      expect(await adapter.PENDLE_ROUTER()).to.equal(initialRouter);
      expect(await adapter.COMPTROLLER()).to.equal(initialComptroller);
      expect(await adapter.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
    });
  });
});
