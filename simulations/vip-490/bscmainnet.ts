import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BSCMAINNET_BRAVO_NEW_IMPLEMENTATION,
  BSCMAINNET_BTCB,
  BSCMAINNET_BTCB_PER_BLOCK_REWARD,
  BSCMAINNET_COMPTROLLER,
  BSCMAINNET_DEFAULT_PROXY_ADMIN,
  BSCMAINNET_ETH,
  BSCMAINNET_ETH_PER_BLOCK_REWARD,
  BSCMAINNET_GOVERNANCE_BRAVO,
  BSCMAINNET_NEW_PLP_IMPLEMENTATION,
  BSCMAINNET_NEW_PRIME_IMPLEMENTATION,
  BSCMAINNET_NEW_VAI_IMPLEMENTATION,
  BSCMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  BSCMAINNET_NEW_XVS_VAULT_IMPLEMENTATION,
  BSCMAINNET_PLP_PROXY,
  BSCMAINNET_PRIME_PROXY,
  BSCMAINNET_USDC,
  BSCMAINNET_USDC_PER_BLOCK_REWARD,
  BSCMAINNET_USDT,
  BSCMAINNET_USDT_PER_BLOCK_REWARD,
  BSCMAINNET_VAI_UNITROLLER,
  BSCMAINNET_VAI_VAULT_RATE_PER_BLOCK,
  BSCMAINNET_VTOKEN_BEACON,
  BSCMAINNET_XVS,
  BSCMAINNET_XVS_MARKET,
  BSCMAINNET_XVS_PER_BLOCK_REWARD,
  BSCMAINNET_XVS_VAULT_PROXY,
  BSC_XVS_MARKET_SUPPLY_REWARD_PER_BLOCK,
  MAX_VOTING_DELAY,
  MAX_VOTING_PERIOD,
  MIN_VOTING_DELAY,
  MIN_VOTING_PERIOD,
  PROPOSAL_CONFIGS,
  vip490,
} from "../../vips/vip-490/bscmainnet";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PROXY_ADMIN_ABI from "./abi/defaultProxyAdmin.json";
import DELEGATOR_ABI from "./abi/governorBravoDelegator.json";
import DELEGATE_ABI from "./abi/governorBravodelegate.json";
import PROXY_ABI from "./abi/manualProxy.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";
import VTOKEN_ABI from "./abi/vtoken.json";
import VTOKEN_BEACON_ABI from "./abi/vtokenBeacon.json";

forking(48611358, async () => {
  let plp: Contract;
  let xvsVault: Contract;
  let xvsVaultProxy: Contract;
  let comptroller: Contract;
  let prime: Contract;
  let proxyAdmin: Contract;
  let vaicontroller: Contract;
  let vaiunitroller: Contract;
  let vtokenBeacon: Contract;
  let poolRegistry: Contract;
  let delegator: Contract;
  let delegate: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PLP_ABI, BSCMAINNET_PLP_PROXY);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, BSCMAINNET_XVS_VAULT_PROXY);
    xvsVaultProxy = await ethers.getContractAt(PROXY_ABI, BSCMAINNET_XVS_VAULT_PROXY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, BSCMAINNET_COMPTROLLER);
    prime = await ethers.getContractAt(PRIME_ABI, BSCMAINNET_PRIME_PROXY);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, BSCMAINNET_DEFAULT_PROXY_ADMIN);
    vaicontroller = await ethers.getContractAt(VAI_CONTROLLER_ABI, BSCMAINNET_VAI_UNITROLLER);
    vaiunitroller = await ethers.getContractAt(PROXY_ABI, BSCMAINNET_VAI_UNITROLLER);
    vtokenBeacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, BSCMAINNET_VTOKEN_BEACON);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, NETWORK_ADDRESSES.bscmainnet.POOL_REGISTRY);
    delegate = await ethers.getContractAt(DELEGATE_ABI, BSCMAINNET_GOVERNANCE_BRAVO);
    delegator = await ethers.getContractAt(DELEGATOR_ABI, BSCMAINNET_GOVERNANCE_BRAVO);
  });

  describe("Pre-VIP behaviour", async () => {
    describe("Old distribution speed", () => {
      it("has the old XVS distribution speed", async () => {
        const OLD_BSCMAINNET_XVS_PER_BLOCK_REWARD = parseUnits("0.057256944444444445", 18);
        expect(await xvsVault.rewardTokenAmountsPerBlock(BSCMAINNET_XVS)).to.equal(OLD_BSCMAINNET_XVS_PER_BLOCK_REWARD);
      });
      it("has the old VAI vault rate", async () => {
        const OLD_BSCMAINNET_VAI_VAULT_RATE_PER_BLOCK = parseUnits("0.002278935185185185", 18).toString();
        expect(await comptroller.venusVAIVaultRate()).to.equals(OLD_BSCMAINNET_VAI_VAULT_RATE_PER_BLOCK);
      });

      it("has the old BTCB distribution speed", async () => {
        const OLD_BSCMAINNET_BTCB_PER_BLOCK_REWARD = parseUnits("0.000000152207001522", 18);
        expect(await plp.tokenDistributionSpeeds(BSCMAINNET_BTCB)).to.equal(OLD_BSCMAINNET_BTCB_PER_BLOCK_REWARD);
      });

      it("has the old ETH distribution speed", async () => {
        const OLD_BSCMAINNET_WETH_PER_BLOCK_REWARD = parseUnits("0.000013359969558599", 18);
        expect(await plp.tokenDistributionSpeeds(BSCMAINNET_ETH)).to.equal(OLD_BSCMAINNET_WETH_PER_BLOCK_REWARD);
      });

      it("has the old USDC distribution speed", async () => {
        const OLD_BSCMAINNET_USDC_PER_BLOCK_REWARD = parseUnits("0.075342465753424657", 18);
        expect(await plp.tokenDistributionSpeeds(BSCMAINNET_USDC)).to.equal(OLD_BSCMAINNET_USDC_PER_BLOCK_REWARD);
      });

      it("has the old USDT distribution speed", async () => {
        const OLD_BSCMAINNET_USDT_PER_BLOCK_REWARD = parseUnits("0.138127853881278538", 18);
        expect(await plp.tokenDistributionSpeeds(BSCMAINNET_USDT)).to.equal(OLD_BSCMAINNET_USDT_PER_BLOCK_REWARD);
      });
      it("has the old XVS market speed", async () => {
        const OLD_BSC_XVS_MARKET_SUPPLY_REWARD_PER_BLOCK = parseUnits("0.00078125", 18).toString();
        expect(await comptroller.venusSupplySpeeds(BSCMAINNET_XVS_MARKET)).to.equals(
          OLD_BSC_XVS_MARKET_SUPPLY_REWARD_PER_BLOCK,
        );
      });
    });
    describe("Old Implementations & old block rate", () => {
      describe("Prime & PLP", () => {
        it("Prime should not point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(BSCMAINNET_PRIME_PROXY)).not.equals(
            BSCMAINNET_NEW_PRIME_IMPLEMENTATION,
          );
        });
        it("Prime should have block rate of 10512000", async () => {
          expect(await prime.blocksOrSecondsPerYear()).equals(10512000);
        });
        it("PLP should not point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(BSCMAINNET_PLP_PROXY)).not.equals(
            BSCMAINNET_NEW_PLP_IMPLEMENTATION,
          );
        });
        it("PLP should have block rate of 10512000", async () => {
          expect(await plp.blocksOrSecondsPerYear()).equals(10512000);
        });
      });
      describe("VAI Controller", () => {
        it("VAI Controller should not point to new impl", async () => {
          expect(await vaiunitroller.vaiControllerImplementation()).not.equals(BSCMAINNET_NEW_VAI_IMPLEMENTATION);
        });
        it("VAI Controller should have block rate of 10512000", async () => {
          expect(await vaicontroller.getBlocksPerYear()).equals(10512000);
        });
      });
      describe("XVS Vault", () => {
        it("XVSVAULT should not point to new impl", async () => {
          expect(await xvsVaultProxy.implementation()).not.equals(BSCMAINNET_NEW_XVS_VAULT_IMPLEMENTATION);
        });
        it("XVSVAULT should have block rate of 10512000", async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(10512000);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should not point to new impl", async () => {
          expect(await vtokenBeacon.implementation()).not.equals(BSCMAINNET_NEW_VTOKEN_IMPLEMENTATION);
        });
        it("All Vtokens should have old block rate in IL", async () => {
          const registeredPools = await poolRegistry.getAllPools();
          for (const pool of registeredPools) {
            const comptrollerAddress = pool.comptroller;
            const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
            const poolVTokens = await comptroller.getAllMarkets();
            for (const vtokenAddress of poolVTokens) {
              const vtoken = await ethers.getContractAt(VTOKEN_ABI, vtokenAddress);
              expect(await vtoken.blocksOrSecondsPerYear()).equals(10512000);
            }
          }
        });
      });
      describe("Governance Bravo", () => {
        it("delegator should not point to new impl", async () => {
          expect(await delegator.implementation()).not.equals(BSCMAINNET_BRAVO_NEW_IMPLEMENTATION);
        });
      });
    });
  });

  testVip("VIP-490", await vip490(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [XVS_VAULT_ABI, COMPTROLLER_ABI, PLP_ABI],
        ["NewVenusVAIVaultRate", "TokenDistributionSpeedUpdated"],
        [1, 4],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("Should have updated  distribution speed", () => {
      it("has the new XVS distribution speed", async () => {
        expect(await xvsVault.rewardTokenAmountsPerBlock(BSCMAINNET_XVS)).to.equal(BSCMAINNET_XVS_PER_BLOCK_REWARD);
      });
      it("has the new VAI vault rate", async () => {
        expect(await comptroller.venusVAIVaultRate()).to.equals(BSCMAINNET_VAI_VAULT_RATE_PER_BLOCK);
      });

      it("has the new BTCB distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(BSCMAINNET_BTCB)).to.equal(BSCMAINNET_BTCB_PER_BLOCK_REWARD);
      });

      it("has the new ETH distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(BSCMAINNET_ETH)).to.equal(BSCMAINNET_ETH_PER_BLOCK_REWARD);
      });

      it("has the new USDC distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(BSCMAINNET_USDC)).to.equal(BSCMAINNET_USDC_PER_BLOCK_REWARD);
      });

      it("has the new USDT distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(BSCMAINNET_USDT)).to.equal(BSCMAINNET_USDT_PER_BLOCK_REWARD);
      });

      it("has the new XVS market speed", async () => {
        expect(await comptroller.venusSupplySpeeds(BSCMAINNET_XVS_MARKET)).to.equals(
          BSC_XVS_MARKET_SUPPLY_REWARD_PER_BLOCK,
        );
      });
    });
    describe("Should point to new impl and have updated block rate", () => {
      describe("Prime & PLP", () => {
        it("Prime should point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(BSCMAINNET_PRIME_PROXY)).equals(
            BSCMAINNET_NEW_PRIME_IMPLEMENTATION,
          );
        });
        it("Prime should have block rate of 21024000", async () => {
          expect(await prime.blocksOrSecondsPerYear()).equals(21024000);
        });
        it("PLP should point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(BSCMAINNET_PLP_PROXY)).equals(
            BSCMAINNET_NEW_PLP_IMPLEMENTATION,
          );
        });
        it("PLP should have block rate of 21024000", async () => {
          expect(await plp.blocksOrSecondsPerYear()).equals(21024000);
        });
      });
      describe("VAI Controller", () => {
        it("VAI Controller should point to new impl", async () => {
          expect(await vaiunitroller.vaiControllerImplementation()).equals(BSCMAINNET_NEW_VAI_IMPLEMENTATION);
        });
        it("VAI Controller should have block rate of 21024000", async () => {
          expect(await vaicontroller.getBlocksPerYear()).equals(21024000);
        });
      });
      describe("XVS Vault", async () => {
        it("XVSVAULT should point to new impl", async () => {
          expect(await xvsVaultProxy.implementation()).equals(BSCMAINNET_NEW_XVS_VAULT_IMPLEMENTATION);
        });
        it("XVSVAULT should have block rate of 21024000", async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(21024000);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should point to new impl", async () => {
          expect(await vtokenBeacon.implementation()).equals(BSCMAINNET_NEW_VTOKEN_IMPLEMENTATION);
        });
        it("All Vtokens should have new block rate in IL", async () => {
          const registeredPools = await poolRegistry.getAllPools();
          for (const pool of registeredPools) {
            const comptrollerAddress = pool.comptroller;
            const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
            const poolVTokens = await comptroller.getAllMarkets();
            for (const vtokenAddress of poolVTokens) {
              const vtoken = await ethers.getContractAt(VTOKEN_ABI, vtokenAddress);
              expect(await vtoken.blocksOrSecondsPerYear()).equals(21024000);
            }
          }
        });
      });
      describe("Governance Bravo", () => {
        it("Admin must be NT", async () => {
          expect(await delegate.admin()).equals(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
        });
        it("delegator should point to new impl", async () => {
          expect(await delegator.implementation()).equals(BSCMAINNET_BRAVO_NEW_IMPLEMENTATION);
        });
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
