import { mine, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip582 from "../../vips/vip-582/bscmainnet";
import {
  BTCB,
  BTCB_PER_BLOCK_REWARD,
  COMPTROLLER as CORE_COMPTROLLER,
  DEFAULT_PROXY_ADMIN,
  ETH,
  ETH_PER_BLOCK_REWARD,
  GOVERNANCE_BRAVO,
  MAX_VOTING_DELAY,
  MAX_VOTING_PERIOD,
  MIN_VOTING_DELAY,
  MIN_VOTING_PERIOD,
  NEW_BSC_BLOCK_RATE,
  NEW_PLP_IMPLEMENTATION,
  NEW_PRIME_IMPLEMENTATION,
  NEW_VAI_IMPLEMENTATION,
  PLP_PROXY,
  PRIME_PROXY,
  PROPOSAL_CONFIGS,
  USDC,
  USDC_PER_BLOCK_REWARD,
  USDT,
  USDT_PER_BLOCK_REWARD,
  VAI_UNITROLLER,
  VAI_VAULT_RATE_PER_BLOCK,
  XVS,
  XVS_MARKET,
  XVS_MARKET_SUPPLY_REWARD_PER_BLOCK,
  XVS_PER_BLOCK_REWARD,
  XVS_VAULT_PROXY,
} from "../../vips/vip-582/bscmainnet";
import CORE_POOL_RATE_MODEL_ABI from "./abi/JumpRateModel.json";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PROXY_ADMIN_ABI from "./abi/defaultProxyAdmin.json";
import DELEGATE_ABI from "./abi/governorBravodelegate.json";
import PROXY_ABI from "./abi/manualProxy.json";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";
import { RateCurvePoints, VTokenContractAndSymbol, getCorePoolRateCurve, getPoolVTokens } from "./common";

const BSCMAINNET_CHECKPOINT = 1768357822;

forking(73348770, async () => {
  const OLD_BSC_BLOCK_RATE = 42048000;
  let plp: Contract;
  let xvsVault: Contract;
  let comptroller: Contract;
  let prime: Contract;
  let proxyAdmin: Contract;
  let vaicontroller: Contract;
  let vaiunitroller: Contract;
  let delegate: Contract;

  const corePoolVTokens = (await getPoolVTokens(CORE_COMPTROLLER, { onlyListed: true })).filter(
    vToken => vToken.symbol !== "vUSDF" && vToken.symbol !== "vPT-USDe-30OCT2025",
  );

  const oldCorePoolRates: Record<string, RateCurvePoints> = Object.fromEntries(
    await Promise.all(
      corePoolVTokens.map(async (vToken: VTokenContractAndSymbol) => {
        return [vToken.symbol, await getCorePoolRateCurve(vToken.contract)];
      }),
    ),
  );

  before(async () => {
    plp = await ethers.getContractAt(PLP_ABI, PLP_PROXY);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_COMPTROLLER);
    prime = await ethers.getContractAt(PRIME_ABI, PRIME_PROXY);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, DEFAULT_PROXY_ADMIN);
    vaicontroller = await ethers.getContractAt(VAI_CONTROLLER_ABI, VAI_UNITROLLER);
    vaiunitroller = await ethers.getContractAt(PROXY_ABI, VAI_UNITROLLER);
    delegate = await ethers.getContractAt(DELEGATE_ABI, GOVERNANCE_BRAVO);
  });

  describe("Pre-VIP behaviour", async () => {
    describe("Old distribution speed", () => {
      it("has the old XVS distribution speed", async () => {
        const OLD_XVS_PER_BLOCK_REWARD = parseUnits("0.020130208333333333", 18);
        expect(await xvsVault.rewardTokenAmountsPerBlock(XVS)).to.equal(OLD_XVS_PER_BLOCK_REWARD);
      });

      it("has the old VAI vault rate", async () => {
        const OLD_VAI_VAULT_RATE_PER_BLOCK = parseUnits("0.001139467592592592", 18).div(2).toString();
        expect(await comptroller.venusVAIVaultRate()).to.equals(OLD_VAI_VAULT_RATE_PER_BLOCK);
      });

      it("has the old BTCB distribution speed", async () => {
        const OLD_BTCB_PER_BLOCK_REWARD = parseUnits("0.000000076103500761", 18).div(2);
        expect(await plp.tokenDistributionSpeeds(BTCB)).to.equal(OLD_BTCB_PER_BLOCK_REWARD);
      });

      it("has the old ETH distribution speed", async () => {
        const OLD_WETH_PER_BLOCK_REWARD = parseUnits("0.000006679984779299", 18).div(2);
        expect(await plp.tokenDistributionSpeeds(ETH)).to.equal(OLD_WETH_PER_BLOCK_REWARD);
      });

      it("has the old USDC distribution speed", async () => {
        const OLD_USDC_PER_BLOCK_REWARD = parseUnits("0.005422374429223744", 18);
        expect(await plp.tokenDistributionSpeeds(USDC)).to.equal(OLD_USDC_PER_BLOCK_REWARD);
      });

      it("has the old USDT distribution speed", async () => {
        const OLD_USDT_PER_BLOCK_REWARD = parseUnits("0.005422374429223744", 18);
        expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(OLD_USDT_PER_BLOCK_REWARD);
      });

      it("has the old XVS market supply speed", async () => {
        const OLD_BSC_XVS_MARKET_SUPPLY_REWARD_PER_BLOCK = parseUnits("0.000390625", 18).div(2).toString();
        expect(await comptroller.venusSupplySpeeds(XVS_MARKET)).to.equals(OLD_BSC_XVS_MARKET_SUPPLY_REWARD_PER_BLOCK);
      });

      it("has the old XVS borrow speed", async () => {
        expect(await comptroller.venusBorrowSpeeds(XVS_MARKET)).to.equals(0);
      });
    });

    describe("Old Implementations & old block rate", () => {
      describe("Prime & PLP", () => {
        it("Prime should not point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(PRIME_PROXY)).not.equals(NEW_PRIME_IMPLEMENTATION);
        });

        it(`Prime should have block rate of ${OLD_BSC_BLOCK_RATE}`, async () => {
          expect(await prime.blocksOrSecondsPerYear()).equals(OLD_BSC_BLOCK_RATE);
        });

        it("PLP should not point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(PLP_PROXY)).not.equals(NEW_PLP_IMPLEMENTATION);
        });

        it(`PLP should have block rate of ${OLD_BSC_BLOCK_RATE}`, async () => {
          expect(await plp.blocksOrSecondsPerYear()).equals(OLD_BSC_BLOCK_RATE);
        });
      });

      describe("VAI Controller", () => {
        it("VAI Controller should not point to new impl", async () => {
          expect(await vaiunitroller.vaiControllerImplementation()).not.equals(NEW_VAI_IMPLEMENTATION);
        });

        it(`VAI Controller should have block rate of ${OLD_BSC_BLOCK_RATE}`, async () => {
          expect(await vaicontroller.getBlocksPerYear()).equals(OLD_BSC_BLOCK_RATE);
        });
      });

      describe("XVS Vault", () => {
        it(`XVSVAULT should have block rate of ${OLD_BSC_BLOCK_RATE}`, async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(OLD_BSC_BLOCK_RATE);
        });
      });
    });
  });

  testVip("VIP-582", await vip582(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [XVS_VAULT_ABI, COMPTROLLER_ABI, PLP_ABI],
        ["NewVenusVAIVaultRate", "TokenDistributionSpeedUpdated", "VenusSupplySpeedUpdated"],
        [1, 4, 1],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    describe("Interest rates after checkpoint", () => {
      before(async () => {
        await time.increaseTo(BSCMAINNET_CHECKPOINT);
        await mine();
      });

      describe("Core pool", () => {
        for (const vToken of corePoolVTokens) {
          const oldRateCurve = oldCorePoolRates[vToken.symbol];
          let newRateCurve: RateCurvePoints;

          before(async () => {
            newRateCurve = await getCorePoolRateCurve(vToken.contract);
          });

          describe(`${vToken.symbol} rate curve`, () => {
            it("has the same utilization points", async () => {
              for (const [idx] of oldRateCurve.entries()) {
                expect(oldRateCurve[idx].utilizationRate).to.equal(newRateCurve[idx].utilizationRate);
              }
            });

            it("has new supply rate ≈ old supply rate / 1.67 at all utilizations", async () => {
              for (const [idx] of oldRateCurve.entries()) {
                const expectedSupplyRate = oldRateCurve[idx].supplyRate.mul(100).div(167);
                expect(newRateCurve[idx].supplyRate).to.be.closeTo(expectedSupplyRate, 150000000);
              }
            });

            it("has new borrow rate ≈ old borrow rate / 1.67 at all utilizations", async () => {
              for (const [idx] of oldRateCurve.entries()) {
                const expectedBorrowRate = oldRateCurve[idx].borrowRate.mul(100).div(167);
                expect(newRateCurve[idx].borrowRate).to.be.closeTo(expectedBorrowRate, 150000000);
              }
            });

            it("set to 70080000 blocks per year", async () => {
              const rateModelAddress = await vToken.contract.interestRateModel();
              const rateModel = await ethers.getContractAt(CORE_POOL_RATE_MODEL_ABI, rateModelAddress);
              const blocksPerYear = await Promise.any([rateModel.blocksPerYear(), rateModel.BLOCKS_PER_YEAR()]);
              expect(blocksPerYear).to.equal(70080000);
            });
          });
        }
      });
    });

    describe("Should have updated  distribution speed", () => {
      it("has the new XVS distribution speed", async () => {
        expect(await xvsVault.rewardTokenAmountsPerBlock(XVS)).to.equal(XVS_PER_BLOCK_REWARD);
      });
      it("has the new VAI vault rate", async () => {
        expect(await comptroller.venusVAIVaultRate()).to.equals(VAI_VAULT_RATE_PER_BLOCK);
      });

      it("has the new BTCB distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(BTCB)).to.equal(BTCB_PER_BLOCK_REWARD);
      });

      it("has the new ETH distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(ETH)).to.equal(ETH_PER_BLOCK_REWARD);
      });

      it("has the new USDC distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(USDC)).to.equal(USDC_PER_BLOCK_REWARD);
      });

      it("has the new USDT distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(USDT_PER_BLOCK_REWARD);
      });

      it("has the new XVS market supply speed", async () => {
        expect(await comptroller.venusSupplySpeeds(XVS_MARKET)).to.equals(XVS_MARKET_SUPPLY_REWARD_PER_BLOCK);
      });

      it("has the XVS borrow speed of 0", async () => {
        expect(await comptroller.venusBorrowSpeeds(XVS_MARKET)).to.equals(0);
      });
    });

    describe("Should point to new impl and have updated block rate", () => {
      describe("Prime & PLP", () => {
        it("Prime should point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(PRIME_PROXY)).equals(NEW_PRIME_IMPLEMENTATION);
        });

        it(`Prime should have block rate of ${NEW_BSC_BLOCK_RATE}`, async () => {
          expect(await prime.blocksOrSecondsPerYear()).equals(NEW_BSC_BLOCK_RATE);
        });

        it("PLP should point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(PLP_PROXY)).equals(NEW_PLP_IMPLEMENTATION);
        });

        it(`PLP should have block rate of ${NEW_BSC_BLOCK_RATE}`, async () => {
          expect(await plp.blocksOrSecondsPerYear()).equals(NEW_BSC_BLOCK_RATE);
        });
      });

      describe("VAI Controller", () => {
        it("VAI Controller should point to new impl", async () => {
          expect(await vaiunitroller.vaiControllerImplementation()).equals(NEW_VAI_IMPLEMENTATION);
        });

        it(`VAI Controller should have block rate of ${NEW_BSC_BLOCK_RATE}`, async () => {
          expect(await vaicontroller.getBlocksPerYear()).equals(NEW_BSC_BLOCK_RATE);
        });
      });

      describe("XVS Vault", async () => {
        it(`XVSVAULT should have block rate of ${NEW_BSC_BLOCK_RATE}`, async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(NEW_BSC_BLOCK_RATE);
        });
      });

      describe("Governance Bravo", () => {
        it("should have updated validation params", async () => {
          const validationParams = await delegate.validationParams();
          expect(validationParams.minVotingPeriod).equals(MIN_VOTING_PERIOD);
          expect(validationParams.maxVotingPeriod).equals(MAX_VOTING_PERIOD);
          expect(validationParams.minVotingDelay).equals(MIN_VOTING_DELAY);
          expect(validationParams.maxVotingDelay).equals(MAX_VOTING_DELAY);
        });

        it("should have updated proposal configs", async () => {
          for (let i = 0; i < PROPOSAL_CONFIGS.length; i++) {
            const config = await delegate.proposalConfigs(i);
            expect(config.votingDelay).to.equal(PROPOSAL_CONFIGS[i][0]);
            expect(config.votingPeriod).to.equal(PROPOSAL_CONFIGS[i][1]);
            expect(config.proposalThreshold).to.equal(PROPOSAL_CONFIGS[i][2]);
          }
        });
      });
    });
  });
});
