import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BTCB,
  BTCB_PER_BLOCK_REWARD,
  COMPTROLLER,
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
  NEW_SHORTFALL_IMPLEMENTATION,
  NEW_VAI_IMPLEMENTATION,
  NEW_VTOKEN_IMPLEMENTATION,
  PLP_PROXY,
  PRIME_PROXY,
  PROPOSAL_CONFIGS,
  SHORTFALL_PROXY,
  USDC,
  USDC_PER_BLOCK_REWARD,
  USDT,
  USDT_PER_BLOCK_REWARD,
  VAI_UNITROLLER,
  VAI_VAULT_RATE_PER_BLOCK,
  VTOKEN_BEACON,
  XVS,
  XVS_MARKET,
  XVS_MARKET_SUPPLY_REWARD_PER_BLOCK,
  XVS_PER_BLOCK_REWARD,
  XVS_VAULT_PROXY,
  vip524,
} from "../../vips/vip-524/bscmainnet";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PROXY_ADMIN_ABI from "./abi/defaultProxyAdmin.json";
import DELEGATE_ABI from "./abi/governorBravodelegate.json";
import PROXY_ABI from "./abi/manualProxy.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import SHORTFALL_ABI from "./abi/shortfall.json";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";
import VTOKEN_ABI from "./abi/vtoken.json";
import VTOKEN_BEACON_ABI from "./abi/vtokenBeacon.json";

forking(51263918, async () => {
  const OLD_BSC_BLOCK_RATE = 21024000;
  let plp: Contract;
  let xvsVault: Contract;
  let comptroller: Contract;
  let prime: Contract;
  let proxyAdmin: Contract;
  let vaicontroller: Contract;
  let vaiunitroller: Contract;
  let vtokenBeacon: Contract;
  let poolRegistry: Contract;
  let delegate: Contract;
  let shortfall: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PLP_ABI, PLP_PROXY);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    prime = await ethers.getContractAt(PRIME_ABI, PRIME_PROXY);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, DEFAULT_PROXY_ADMIN);
    vaicontroller = await ethers.getContractAt(VAI_CONTROLLER_ABI, VAI_UNITROLLER);
    vaiunitroller = await ethers.getContractAt(PROXY_ABI, VAI_UNITROLLER);
    vtokenBeacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, VTOKEN_BEACON);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, NETWORK_ADDRESSES.bscmainnet.POOL_REGISTRY);
    delegate = await ethers.getContractAt(DELEGATE_ABI, GOVERNANCE_BRAVO);
    shortfall = await ethers.getContractAt(SHORTFALL_ABI, SHORTFALL_PROXY);
  });

  describe("Pre-VIP behaviour", async () => {
    describe("Old distribution speed", () => {
      it("has the old XVS distribution speed", async () => {
        const OLD_XVS_PER_BLOCK_REWARD = parseUnits("0.028628472222222222", 18);
        expect(await xvsVault.rewardTokenAmountsPerBlock(XVS)).to.equal(OLD_XVS_PER_BLOCK_REWARD);
      });
      it("has the old VAI vault rate", async () => {
        const OLD_VAI_VAULT_RATE_PER_BLOCK = parseUnits("0.001139467592592592", 18).toString();
        expect(await comptroller.venusVAIVaultRate()).to.equals(OLD_VAI_VAULT_RATE_PER_BLOCK);
      });

      it("has the old BTCB distribution speed", async () => {
        const OLD_BTCB_PER_BLOCK_REWARD = parseUnits("0.000000076103500761", 18);
        expect(await plp.tokenDistributionSpeeds(BTCB)).to.equal(OLD_BTCB_PER_BLOCK_REWARD);
      });

      it("has the old ETH distribution speed", async () => {
        const OLD_WETH_PER_BLOCK_REWARD = parseUnits("0.000006679984779299", 18);
        expect(await plp.tokenDistributionSpeeds(ETH)).to.equal(OLD_WETH_PER_BLOCK_REWARD);
      });

      it("has the old USDC distribution speed", async () => {
        const OLD_USDC_PER_BLOCK_REWARD = parseUnits("0.037671232876712328", 18);
        expect(await plp.tokenDistributionSpeeds(USDC)).to.equal(OLD_USDC_PER_BLOCK_REWARD);
      });

      it("has the old USDT distribution speed", async () => {
        const OLD_USDT_PER_BLOCK_REWARD = parseUnits("0.069063926940639269", 18);
        expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(OLD_USDT_PER_BLOCK_REWARD);
      });
      it("has the old XVS market supply speed", async () => {
        const OLD_BSC_XVS_MARKET_SUPPLY_REWARD_PER_BLOCK = parseUnits("0.000390625", 18).toString();
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
      describe("Shortfall", () => {
        it("Shortfall should not point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(SHORTFALL_PROXY)).not.equals(NEW_SHORTFALL_IMPLEMENTATION);
        });
      });
      describe("XVS Vault", () => {
        it(`XVSVAULT should have block rate of ${OLD_BSC_BLOCK_RATE}`, async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(OLD_BSC_BLOCK_RATE);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should not point to new impl", async () => {
          expect(await vtokenBeacon.implementation()).not.equals(NEW_VTOKEN_IMPLEMENTATION);
        });
        it("All Vtokens should have old block rate in IL", async () => {
          const registeredPools = await poolRegistry.getAllPools();
          for (const pool of registeredPools) {
            const comptrollerAddress = pool.comptroller;
            const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
            const poolVTokens = await comptroller.getAllMarkets();
            for (const vtokenAddress of poolVTokens) {
              const vtoken = await ethers.getContractAt(VTOKEN_ABI, vtokenAddress);
              expect(await vtoken.blocksOrSecondsPerYear()).equals(OLD_BSC_BLOCK_RATE);
            }
          }
        });
      });
    });
  });

  testVip("VIP-524", await vip524(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [XVS_VAULT_ABI, COMPTROLLER_ABI, PLP_ABI],
        ["NewVenusVAIVaultRate", "TokenDistributionSpeedUpdated", "VenusSupplySpeedUpdated"],
        [1, 4, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
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
      describe("Shortfall", () => {
        it("Shortfall should point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(SHORTFALL_PROXY)).equals(NEW_SHORTFALL_IMPLEMENTATION);
        });
        it(`Shortfall should have block rate of ${NEW_BSC_BLOCK_RATE}`, async () => {
          expect(await shortfall.blocksOrSecondsPerYear()).equals(NEW_BSC_BLOCK_RATE);
        });
      });
      describe("XVS Vault", async () => {
        it(`XVSVAULT should have block rate of ${NEW_BSC_BLOCK_RATE}`, async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(NEW_BSC_BLOCK_RATE);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should point to new impl", async () => {
          expect(await vtokenBeacon.implementation()).equals(NEW_VTOKEN_IMPLEMENTATION);
        });
        it("All Vtokens should have new block rate in IL", async () => {
          const registeredPools = await poolRegistry.getAllPools();
          for (const pool of registeredPools) {
            const comptrollerAddress = pool.comptroller;
            const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
            const poolVTokens = await comptroller.getAllMarkets();
            for (const vtokenAddress of poolVTokens) {
              const vtoken = await ethers.getContractAt(VTOKEN_ABI, vtokenAddress);
              expect(await vtoken.blocksOrSecondsPerYear()).equals(NEW_BSC_BLOCK_RATE);
            }
          }
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
