import { mine, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { getCalldatas, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { bypassStalePrices } from "src/vip-framework/oracleStaleness";

import vip679, {
  BLOCKS_PER_MONTH,
  DEV_RECIPIENT,
  HUB_MAX_DISTRIBUTION_SPEED,
  MONTHLY_VHU,
  MONTHLY_VHUSDT,
  NORMAL_TIMELOCK,
  PLP,
  PRIME,
  SUPPLY_MULTIPLIER,
  U,
  USDT,
  USDT_TO_DEPOSIT,
  U_TO_DEPOSIT,
  U_TO_SWAP,
  VHU,
  VHUSDT,
  VHUSDT_SPEED,
  VHU_SPEED,
  VVHU,
  VVHUSDT,
} from "../../vips/vip-679/bscmainnet";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PRIME_ABI from "./abi/PrimeV2.json";

const FORK_BLOCK = 131549804;
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VU = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E";
const VWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function transfer(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)",
];
const HUB_ABI = [
  ...ERC20_ABI,
  "function asset() view returns (address)",
  "function previewDeposit(uint256) view returns (uint256)",
  "function convertToAssets(uint256) view returns (uint256)",
  "function deposit(uint256,address) returns (uint256)",
];
const VTOKEN_ABI = [...ERC20_ABI, "function mint(uint256) returns (uint256)"];
const { parseEther } = ethers.utils;
const { MaxUint256 } = ethers.constants;
const { bscmainnet } = NETWORK_ADDRESSES;

forking(FORK_BLOCK, async () => {
  const proposal = await vip679();
  const plp = new Contract(PLP, PLP_ABI, ethers.provider);
  const prime = await ethers.getContractAt(PRIME_ABI, PRIME);
  const usdt = new Contract(USDT, ERC20_ABI, ethers.provider);
  const u = new Contract(U, ERC20_ABI, ethers.provider);
  const vhUsdt = new Contract(VHUSDT, HUB_ABI, ethers.provider);
  const vhU = new Contract(VHU, HUB_ABI, ethers.provider);
  let recipientBefore: BigNumber;
  let usdtBefore: BigNumber;
  let uBefore: BigNumber;
  let tlUsdtBefore: BigNumber;
  let tlUBefore: BigNumber;
  let oldAccrued: BigNumber;
  let user: Awaited<ReturnType<typeof initMainnetUser>>;

  before(async () => {
    await bypassStalePrices([USDT, U, WBNB, bscmainnet.XVS, VHUSDT, VHU]);
    const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("10"));
    [user] = await ethers.getSigners();
    const whale = await initMainnetUser(USDT_WHALE, parseEther("1"));
    await usdt.connect(whale).transfer(user.address, parseEther("3000"));
    // Test-only funding from a liquid U holder; do not alter the PLP's inventory.
    await u.connect(await initMainnetUser(VU, parseEther("1"))).transfer(user.address, parseEther("1000"));
    const xvs = new Contract(bscmainnet.XVS, ERC20_ABI, user);
    await xvs.connect(await initMainnetUser(XVS_STORE, parseEther("1"))).transfer(user.address, parseEther("10000"));
    const vault = new Contract(bscmainnet.XVS_VAULT_PROXY, ["function deposit(address,uint256,uint256)"], user);
    await xvs.approve(vault.address, parseEther("10000"));
    await vault.deposit(xvs.address, 0, parseEther("10000"));
    // One extra test holder exercises real accrual/score/claim paths; no storage overrides.
    await prime.connect(timelock).setLimit((await prime.totalTokens()).add(1));
    await prime.connect(timelock).issue(user.address);
    await usdt.connect(user).approve(VUSDT, parseEther("1000"));
    await new Contract(VUSDT, VTOKEN_ABI, user).mint(parseEther("1000"));
    for (const [asset, hub, market] of [
      [usdt, vhUsdt, VVHUSDT],
      [u, vhU, VVHU],
    ] as const) {
      await asset.connect(user).approve(hub.address, parseEther("1000"));
      await hub.connect(user).deposit(parseEther("1000"), user.address);
      await hub.connect(user).approve(market, MaxUint256);
      await new Contract(market, VTOKEN_ABI, user).mint(await hub.balanceOf(user.address));
    }
    await mine(100);
    await prime["accrueInterestAndUpdateScore(address,address)"](user.address, VUSDT);
    oldAccrued = (await prime.interests(VUSDT, user.address)).accrued;
    expect(oldAccrued).to.be.gt(0);
    recipientBefore = await u.balanceOf(DEV_RECIPIENT);
    usdtBefore = await usdt.balanceOf(PLP);
    uBefore = await u.balanceOf(PLP);
    tlUsdtBefore = await usdt.balanceOf(NORMAL_TIMELOCK);
    tlUBefore = await u.balanceOf(NORMAL_TIMELOCK);
  });

  describe("Pre-VIP and execution-date funding", () => {
    it("uses the live 24-decimal Prime upgrade and uninitialised Hub rewards", async () => {
      const slot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
      const implementation = await ethers.provider.getStorageAt(PRIME, slot);
      expect(ethers.utils.getAddress(`0x${implementation.slice(-40)}`)).to.equal(
        "0xb61137934C9D52cF3ebe9BCe92586DcA048b5F88",
      );
      expect(await prime.pendingScoreUpdates()).to.equal(0);
      expect(await plp.prime()).to.equal(PRIME);
      for (const hub of [vhUsdt, vhU]) {
        expect(await hub.decimals()).to.equal(24);
        expect(await plp.lastAccruedBlockOrSecond(hub.address)).to.equal(0);
      }
      for (const asset of [usdt, u]) {
        const oldCap = await plp.maxTokenDistributionSpeeds(asset.address);
        expect(oldCap).to.equal(ethers.utils.parseUnits("1", await asset.decimals()));
        expect(HUB_MAX_DISTRIBUTION_SPEED).to.equal(oldCap.mul(10 ** 6));
      }
      expect(await vhUsdt.asset()).to.equal(USDT);
      expect(await vhU.asset()).to.equal(U);
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal("6944444444444444");
      expect(await plp.tokenDistributionSpeeds(U)).to.equal("1736111111111111");
    });

    it("quotes approximately 44K/11K underlying and respects 24-decimal share units", async () => {
      expect(VHUSDT_SPEED).to.equal("7585677102538527101188");
      expect(VHU_SPEED).to.equal("1900947462626257303479");
      expect(MONTHLY_VHUSDT.sub(VHUSDT_SPEED.mul(BLOCKS_PER_MONTH))).to.be.lt(BLOCKS_PER_MONTH);
      expect(MONTHLY_VHU.sub(VHU_SPEED.mul(BLOCKS_PER_MONTH))).to.be.lt(BLOCKS_PER_MONTH);
      expect(await vhUsdt.convertToAssets(MONTHLY_VHUSDT)).to.be.closeTo(parseEther("44000"), parseEther("1"));
      expect(await vhU.convertToAssets(MONTHLY_VHU)).to.be.closeTo(parseEther("11000"), parseEther("1"));
    });

    it("executes after four days of old emissions without spending accrued user rewards", async () => {
      const snapshot = await ethers.provider.send("evm_snapshot", []);
      try {
        // The shared lifecycle uses legacy 57,600 timelock blocks. Explicitly test
        // the full Sunday funding horizon at 192,000 blocks/day independently.
        await mine(4 * 192000, { interval: 0 });
        await time.increase(4 * 86400);
        const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("10"));
        const calldatas = getCalldatas(proposal);
        for (let i = 0; i < proposal.targets.length; ++i) {
          const selector = ethers.utils.id(proposal.signatures[i]).slice(0, 10);
          await timelock.sendTransaction({ to: proposal.targets[i], data: selector + calldatas[i].slice(2) });
        }
        for (const asset of [usdt, u]) {
          expect(await asset.balanceOf(PLP)).to.be.gte(await plp.tokenAmountAccrued(asset.address));
        }
        const freeUsdt = (await usdt.balanceOf(PLP)).sub(await plp.tokenAmountAccrued(USDT));
        const freeU = (await u.balanceOf(PLP)).sub(await plp.tokenAmountAccrued(U));
        expect(freeUsdt).to.be.gt(parseEther("900"));
        expect(freeU).to.be.gt(parseEther("3900"));
        expect(await vhU.balanceOf(PLP)).to.be.gte(VHU_SPEED.mul(BLOCKS_PER_MONTH));
        expect(await vhUsdt.balanceOf(PLP)).to.be.gt(VHUSDT_SPEED.mul(BLOCKS_PER_MONTH).div(2));
      } finally {
        await ethers.provider.send("evm_revert", [snapshot]);
      }
    });
  });

  describe("Thursday proposal scheduling", () => {
    it("waits one day for the proposer Safes' current votes to finish", async () => {
      // Both proposer Safes have active votes at the Wednesday fork block.
      // Model the planned Thursday submission, without cancelling real proposals.
      await mine(192000, { interval: 0 });
      await time.increase(86400);
      const governor = new Contract(
        bscmainnet.GOVERNOR_PROXY,
        ["function latestProposalIds(address) view returns (uint256)", "function state(uint256) view returns (uint8)"],
        ethers.provider,
      );
      for (const proposer of [
        "0x34221485302f6F2029660a000908B5FCABB9BC6e",
        "0xe5e62386933b74eA81BFd73A6a6591598E7f8cED",
      ]) {
        expect(await governor.state(await governor.latestProposalIds(proposer))).to.be.gt(1);
      }
    });
  });

  testVip("VIP-679 November Prime rewards on Hub shares", proposal, {
    callbackAfterExecution: async tx => {
      await expect(tx).to.emit(plp, "SweepToken").withArgs(U, DEV_RECIPIENT, U_TO_SWAP);
      for (const market of [VVHUSDT, VVHU]) {
        await expect(tx).to.emit(prime, "MarketAdded").withArgs(market, SUPPLY_MULTIPLIER, 0);
      }
    },
  });

  describe("Post-VIP funding, scoring and claims", () => {
    it("moves only the specified free assets and leaves no new timelock balances or allowances", async () => {
      expect(usdtBefore.sub(await usdt.balanceOf(PLP))).to.equal(USDT_TO_DEPOSIT);
      expect(uBefore.sub(await u.balanceOf(PLP))).to.equal(U_TO_DEPOSIT.add(U_TO_SWAP));
      expect((await u.balanceOf(DEV_RECIPIENT)).sub(recipientBefore)).to.equal(U_TO_SWAP);
      expect(await usdt.balanceOf(NORMAL_TIMELOCK)).to.equal(tlUsdtBefore);
      expect(await u.balanceOf(NORMAL_TIMELOCK)).to.equal(tlUBefore);
      expect(await usdt.allowance(NORMAL_TIMELOCK, VHUSDT)).to.equal(0);
      expect(await u.allowance(NORMAL_TIMELOCK, VHU)).to.equal(0);
      for (const asset of [usdt, u]) {
        expect(await asset.balanceOf(PLP)).to.be.gte(await plp.tokenAmountAccrued(asset.address));
        expect(await plp.tokenDistributionSpeeds(asset.address)).to.equal(0);
      }
    });

    it("keeps old markets and adds supply-only Hub markets with funded share rewards", async () => {
      expect(await prime.getAllMarkets()).to.deep.equal([VUSDT, VWBNB, VU, VVHUSDT, VVHU]);
      for (const [market, hub, speed] of [
        [VVHUSDT, vhUsdt, VHUSDT_SPEED],
        [VVHU, vhU, VHU_SPEED],
      ] as const) {
        const state = await prime.markets(market);
        expect(state.exists).to.equal(true);
        expect(state.supplyMultiplier).to.equal(SUPPLY_MULTIPLIER);
        expect(state.borrowMultiplier).to.equal(0);
        expect(await prime.vTokenForAsset(hub.address)).to.equal(market);
        expect(await plp.tokenDistributionSpeeds(hub.address)).to.equal(speed);
        expect(await plp.maxTokenDistributionSpeeds(hub.address)).to.equal(HUB_MAX_DISTRIBUTION_SPEED);
        expect(HUB_MAX_DISTRIBUTION_SPEED).to.equal(ethers.utils.parseUnits("1", await hub.decimals()));
        expect(speed).to.be.lt(HUB_MAX_DISTRIBUTION_SPEED);
        expect(await hub.balanceOf(PLP)).to.be.gt(0);
      }
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(0);
      expect(await prime.pendingScoreUpdates()).to.equal(await prime.totalTokens());
    });

    it("preserves old USDT claims and accrues/claims both 24-decimal Hub rewards after a score update", async () => {
      const pending = await prime.pendingScoreUpdates();
      await prime.updateScores([user.address]);
      expect(await prime.pendingScoreUpdates()).to.equal(pending.sub(1));
      for (const market of [VVHUSDT, VVHU]) {
        expect((await prime.interests(market, user.address)).score).to.be.gt(0);
      }
      const before = await usdt.balanceOf(user.address);
      await prime["claimInterest(address,address)"](VUSDT, user.address);
      expect((await usdt.balanceOf(user.address)).sub(before)).to.be.gte(oldAccrued);
      await mine(1000);
      for (const [market, hub] of [
        [VVHUSDT, vhUsdt],
        [VVHU, vhU],
      ] as const) {
        const balance = await hub.balanceOf(user.address);
        await prime["claimInterest(address,address)"](market, user.address);
        expect(await hub.balanceOf(user.address)).to.be.gt(balance);
      }
      // The operator must still update the other holders; this test does not bypass that gate.
      expect(await prime.pendingScoreUpdates()).to.equal(pending.sub(1));
    });

    it("funds the full vhUSDT month when the separate conversion proceeds are deposited into the Hub", async () => {
      // Simulate receipt of 1:1 conversion proceeds only. No DEX execution/quote is claimed.
      const recipient = await initMainnetUser(DEV_RECIPIENT, parseEther("1"));
      const whale = await initMainnetUser(USDT_WHALE, parseEther("1"));
      await usdt.connect(whale).transfer(DEV_RECIPIENT, U_TO_SWAP);
      await usdt.connect(recipient).approve(VHUSDT, U_TO_SWAP);
      await vhUsdt.connect(recipient).deposit(U_TO_SWAP, PLP);
      expect(await vhUsdt.balanceOf(PLP)).to.be.gte(VHUSDT_SPEED.mul(BLOCKS_PER_MONTH));
      expect(await vhU.balanceOf(PLP)).to.be.gte(VHU_SPEED.mul(BLOCKS_PER_MONTH));
    });
  });
});
