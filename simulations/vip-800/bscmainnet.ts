import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip800, {
  BUYBACKS,
  DEFAULT_PROXY_ADMIN,
  NEW_RISK_FUND_V2_IMPL,
  OPERATOR,
  PANCAKE_ROUTER,
  PROTOCOL_SHARE_RESERVE,
  RISK_FUND_V2,
  USDT,
} from "../../vips/vip-800/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import DEFAULT_PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import ERC20_ABI from "./abi/ERC20.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import BUYBACK_ABI from "./abi/TokenBuyback.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// TODO: pin after deploy on feat/VPD-1087 so fork includes deployed buyback proxies
//       + new RiskFundV2 impl. Pick a recent block >= first post-deploy block.
const FORK_BLOCK = 0;

forking(FORK_BLOCK, async () => {
  const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, ethers.provider);
  const psr = new ethers.Contract(PROTOCOL_SHARE_RESERVE, PSR_ABI, ethers.provider);
  const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);

  let riskFundV2UsdtBalanceBefore: BigNumber;

  before(async () => {
    riskFundV2UsdtBalanceBefore = await usdt.balanceOf(RISK_FUND_V2);
  });

  describe("Pre-VIP state", () => {
    it("each buyback proxy's pendingOwner is NormalTimelock", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        expect(await buyback.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      }
    });

    it("PancakeSwap router is not yet allowlisted on buybacks", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        expect(await buyback.allowedRouters(PANCAKE_ROUTER)).to.be.false;
      }
    });

    it("operator has no executeBuyback / forwardBaseAsset grants yet", async () => {
      for (const b of BUYBACKS) {
        expect(
          await acm.isAllowedToCall(
            OPERATOR,
            b,
            "executeBuyback(address,uint256,uint256,uint256,address,bytes,address)",
          ),
        ).to.be.false;
        expect(await acm.isAllowedToCall(OPERATOR, b, "forwardBaseAsset(address,uint256)")).to.be.false;
      }
    });
  });

  testVip("VIP-800 TokenBuyback migration", await vip800());

  describe("Post-VIP state", () => {
    it("NormalTimelock owns each buyback proxy", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        expect(await buyback.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      }
    });

    it("PancakeSwap V2 router allowlisted on each buyback", async () => {
      for (const b of BUYBACKS) {
        const buyback = new ethers.Contract(b, BUYBACK_ABI, ethers.provider);
        expect(await buyback.allowedRouters(PANCAKE_ROUTER)).to.be.true;
      }
    });

    it("operator granted executeBuyback + forwardBaseAsset on each buyback", async () => {
      for (const b of BUYBACKS) {
        expect(
          await acm.isAllowedToCall(
            OPERATOR,
            b,
            "executeBuyback(address,uint256,uint256,uint256,address,bytes,address)",
          ),
        ).to.be.true;
        expect(await acm.isAllowedToCall(OPERATOR, b, "forwardBaseAsset(address,uint256)")).to.be.true;
      }
    });

    it("RiskFundV2 proxy upgraded to new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_V2)).to.equal(NEW_RISK_FUND_V2_IMPL);
    });

    it("RiskFundV2 USDT balance non-decreasing across upgrade", async () => {
      // New impl keeps funds physically in the contract (no migration).
      const after = await usdt.balanceOf(RISK_FUND_V2);
      expect(after).to.be.gte(riskFundV2UsdtBalanceBefore);
    });

    // TODO: enumerate PSR.distributionTargets(i) and assert each of the 10 new buybacks
    //       is a destination, no legacy converter remains, and percentages sum to 1e4
    //       per schema. Placeholder assertion below; flesh out after PSR rows filled.
    it("PSR distribution configs repointed", async () => {
      // Example shape — iterate until the getter reverts to enumerate:
      //   const rows = [];
      //   for (let i = 0; ; i++) {
      //     try { rows.push(await psr.distributionTargets(i)); } catch { break; }
      //   }
      //   expect(rows.map(r => r.destination)).to.include.members(BUYBACKS);
      void psr;
    });

    // TODO: legacy converter residual balances == 0 for drained tokens
    it("legacy converter balances drained", async () => {
      // TODO
    });
  });
});
