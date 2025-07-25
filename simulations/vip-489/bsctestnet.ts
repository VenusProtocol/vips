import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BSCTESTNET_ACM,
  BSCTESTNET_BRAVO_NEW_IMPL,
  BSCTESTNET_BTCB,
  BSCTESTNET_BTCB_PER_BLOCK_REWARD,
  BSCTESTNET_COMPTROLLER,
  BSCTESTNET_DEFAULT_PROXY_ADMIN,
  BSCTESTNET_ETH,
  BSCTESTNET_ETH_PER_BLOCK_REWARD,
  BSCTESTNET_GOVERNANCE_BRAVO,
  BSCTESTNET_NEW_PLP_IMPLEMENTATION,
  BSCTESTNET_NEW_PRIME_IMPLEMENTATION,
  BSCTESTNET_NEW_VAI_IMPLEMENTATION,
  BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION,
  BSCTESTNET_NEW_XVS_VAULT_IMPLEMENTATION,
  BSCTESTNET_PLP_PROXY,
  BSCTESTNET_PRIME_PROXY,
  BSCTESTNET_USDC,
  BSCTESTNET_USDC_PER_BLOCK_REWARD,
  BSCTESTNET_USDT,
  BSCTESTNET_USDT_PER_BLOCK_REWARD,
  BSCTESTNET_VAI_UNITROLLER,
  BSCTESTNET_VAI_VAULT_RATE_PER_BLOCK,
  BSCTESTNET_VPLANET_BEACON,
  BSCTESTNET_VSLIS_BEACON,
  BSCTESTNET_VTOKEN_BEACON,
  BSCTESTNET_XVS,
  BSCTESTNET_XVS_PER_BLOCK_REWARD,
  BSCTESTNET_XVS_VAULT_PROXY,
  MAX_VOTING_DELAY,
  MAX_VOTING_PERIOD,
  MIN_VOTING_DELAY,
  MIN_VOTING_PERIOD,
  PREVIOUS_XVS_EMISSIONS,
  PROPOSAL_CONFIGS,
  vip489,
} from "../../vips/vip-489/bsctestnet";
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

const skipVtokens = ["0xe237aA131E7B004aC88CB808Fa56AF3dc4C408f1", "0xeffE7874C345aE877c1D893cd5160DDD359b24dA"];

forking(50324095, async () => {
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
  let vslisBeacon: Contract;
  let vplanetBeacon: Contract;
  let delegator: Contract;
  let delegate: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PLP_ABI, BSCTESTNET_PLP_PROXY);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, BSCTESTNET_XVS_VAULT_PROXY);
    xvsVaultProxy = await ethers.getContractAt(PROXY_ABI, BSCTESTNET_XVS_VAULT_PROXY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, BSCTESTNET_COMPTROLLER);
    prime = await ethers.getContractAt(PRIME_ABI, BSCTESTNET_PRIME_PROXY);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, BSCTESTNET_DEFAULT_PROXY_ADMIN);
    vaicontroller = await ethers.getContractAt(VAI_CONTROLLER_ABI, BSCTESTNET_VAI_UNITROLLER);
    vaiunitroller = await ethers.getContractAt(PROXY_ABI, BSCTESTNET_VAI_UNITROLLER);
    vtokenBeacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, BSCTESTNET_VTOKEN_BEACON);
    vslisBeacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, BSCTESTNET_VSLIS_BEACON);
    vplanetBeacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, BSCTESTNET_VPLANET_BEACON);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, NETWORK_ADDRESSES.bsctestnet.POOL_REGISTRY);
    delegate = await ethers.getContractAt(DELEGATE_ABI, BSCTESTNET_GOVERNANCE_BRAVO);
    delegator = await ethers.getContractAt(DELEGATOR_ABI, BSCTESTNET_GOVERNANCE_BRAVO);
  });

  describe("Pre-VIP behaviour", async () => {
    describe("Old distribution speed", () => {
      it("has the old XVS distribution speed", async () => {
        const OLD_BSCTESTNET_XVS_PER_BLOCK_REWARD = parseUnits("0.01", 18);
        expect(await xvsVault.rewardTokenAmountsPerBlock(BSCTESTNET_XVS)).to.equal(OLD_BSCTESTNET_XVS_PER_BLOCK_REWARD);
      });
      it("has the old VAI vault rate", async () => {
        const OLD_BSCTESTNET_VAI_VAULT_RATE_PER_BLOCK = parseUnits("0.192", 18).toString();
        expect(await comptroller.venusVAIVaultRate()).to.equals(OLD_BSCTESTNET_VAI_VAULT_RATE_PER_BLOCK);
      });

      it("has the old BTCB distribution speed", async () => {
        const OLD_BSCTESTNET_BTCB_PER_BLOCK_REWARD = parseUnits("0.000001261574074074", 18);
        expect(await plp.tokenDistributionSpeeds(BSCTESTNET_BTCB)).to.equal(OLD_BSCTESTNET_BTCB_PER_BLOCK_REWARD);
      });

      it("has the old ETH distribution speed", async () => {
        const OLD_BSCTESTNET_WETH_PER_BLOCK_REWARD = parseUnits("0.000024438657407407", 18);
        expect(await plp.tokenDistributionSpeeds(BSCTESTNET_ETH)).to.equal(OLD_BSCTESTNET_WETH_PER_BLOCK_REWARD);
      });

      it("has the old USDC distribution speed", async () => {
        const OLD_BSCTESTNET_USDC_PER_BLOCK_REWARD = parseUnits("0.036881", 6);
        expect(await plp.tokenDistributionSpeeds(BSCTESTNET_USDC)).to.equal(OLD_BSCTESTNET_USDC_PER_BLOCK_REWARD);
      });

      it("has the old USDT distribution speed", async () => {
        const OLD_BSCTESTNET_USDT_PER_BLOCK_REWARD = parseUnits("0.087191", 6);
        expect(await plp.tokenDistributionSpeeds(BSCTESTNET_USDT)).to.equal(OLD_BSCTESTNET_USDT_PER_BLOCK_REWARD);
      });
    });
    describe("Old XVS emissions", () => {
      for (const oldSpeed of PREVIOUS_XVS_EMISSIONS) {
        it(`previous supply-side XVS emissions per block for ${oldSpeed.symbol}`, async () => {
          const supplySpeed = await comptroller.venusSupplySpeeds(oldSpeed.market);
          expect(supplySpeed).to.equal(oldSpeed.supplySideSpeed);
        });

        it(`previous borrow-side XVS emissions per block for ${oldSpeed.symbol}`, async () => {
          const borrowSpeed = await comptroller.venusBorrowSpeeds(oldSpeed.market);
          expect(borrowSpeed).to.equal(oldSpeed.borrowSideSpeed);
        });
      }
    });
    describe("Old Implementations & old block rate", () => {
      describe("Prime & PLP", () => {
        it("Prime should not point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(BSCTESTNET_PRIME_PROXY)).not.equals(
            BSCTESTNET_NEW_PRIME_IMPLEMENTATION,
          );
        });
        it("Prime should have block rate of 10512000", async () => {
          expect(await prime.blocksOrSecondsPerYear()).equals(10512000);
        });
        it("PLP should not point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(BSCTESTNET_PLP_PROXY)).not.equals(
            BSCTESTNET_NEW_PLP_IMPLEMENTATION,
          );
        });
        it("PLP should have block rate of 10512000", async () => {
          expect(await plp.blocksOrSecondsPerYear()).equals(10512000);
        });
      });
      describe("VAI Controller", () => {
        it("VAI Controller should not point to new impl", async () => {
          expect(await vaiunitroller.vaiControllerImplementation()).not.equals(BSCTESTNET_NEW_VAI_IMPLEMENTATION);
        });
        it("VAI Controller should have block rate of 10512000", async () => {
          expect(await vaicontroller.getBlocksPerYear()).equals(10512000);
        });
      });
      describe("XVS Vault", () => {
        it("XVSVAULT should not point to new impl", async () => {
          expect(await xvsVaultProxy.implementation()).not.equals(BSCTESTNET_NEW_XVS_VAULT_IMPLEMENTATION);
        });
        it("XVSVAULT should have block rate of 10512000", async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(10512000);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should not point to new impl", async () => {
          expect(await vtokenBeacon.implementation()).not.equals(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
          expect(await vslisBeacon.implementation()).not.equals(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
          expect(await vplanetBeacon.implementation()).not.equals(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
        });
        it("All Vtokens should have old block rate in IL", async () => {
          const registeredPools = await poolRegistry.getAllPools();
          for (const pool of registeredPools) {
            const comptrollerAddress = pool.comptroller;
            const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
            const poolVTokens = await comptroller.getAllMarkets();
            for (const vtokenAddress of poolVTokens) {
              const vtoken = await ethers.getContractAt(VTOKEN_ABI, vtokenAddress);
              if (skipVtokens.includes(vtokenAddress)) {
                continue;
              }
              expect(await vtoken.blocksOrSecondsPerYear()).equals(10512000);
            }
          }
        });
      });
      describe("Governance Bravo", () => {
        it("delegator shopuld not point to new impl", async () => {
          expect(await delegator.implementation()).not.equals(BSCTESTNET_BRAVO_NEW_IMPL);
        });
      });
    });
  });

  testVip("VIP-489", await vip489(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [XVS_VAULT_ABI, COMPTROLLER_ABI, PLP_ABI],
        ["NewVenusVAIVaultRate", "TokenDistributionSpeedUpdated", "VenusSupplySpeedUpdated", "VenusBorrowSpeedUpdated"],
        [1, 4, 18, 18],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("Should have updated  distribution speed", () => {
      it("has the new XVS distribution speed", async () => {
        expect(await xvsVault.rewardTokenAmountsPerBlock(BSCTESTNET_XVS)).to.equal(BSCTESTNET_XVS_PER_BLOCK_REWARD);
      });
      it("has the new VAI vault rate", async () => {
        expect(await comptroller.venusVAIVaultRate()).to.equals(BSCTESTNET_VAI_VAULT_RATE_PER_BLOCK);
      });

      it("has the new BTCB distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(BSCTESTNET_BTCB)).to.equal(BSCTESTNET_BTCB_PER_BLOCK_REWARD);
      });

      it("has the new ETH distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(BSCTESTNET_ETH)).to.equal(BSCTESTNET_ETH_PER_BLOCK_REWARD);
      });

      it("has the new USDC distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(BSCTESTNET_USDC)).to.equal(BSCTESTNET_USDC_PER_BLOCK_REWARD);
      });

      it("has the new USDT distribution speed", async () => {
        expect(await plp.tokenDistributionSpeeds(BSCTESTNET_USDT)).to.equal(BSCTESTNET_USDT_PER_BLOCK_REWARD);
      });
    });
    describe("New XVS emissions", () => {
      for (const oldSpeed of PREVIOUS_XVS_EMISSIONS) {
        it(`halve supply-side XVS emissions per block for ${oldSpeed.symbol}`, async () => {
          const supplySpeed = await comptroller.venusSupplySpeeds(oldSpeed.market);
          expect(supplySpeed).to.equal(BigNumber.from(oldSpeed.supplySideSpeed).div(2));
        });

        it(`halve borrow-side XVS emissions per block for ${oldSpeed.symbol}`, async () => {
          const borrowSpeed = await comptroller.venusBorrowSpeeds(oldSpeed.market);
          expect(borrowSpeed).to.equal(BigNumber.from(oldSpeed.borrowSideSpeed).div(2));
        });
      }
    });
    describe("Should point to new impl and have updated block rate", () => {
      describe("Prime & PLP", () => {
        it("Prime should point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(BSCTESTNET_PRIME_PROXY)).equals(
            BSCTESTNET_NEW_PRIME_IMPLEMENTATION,
          );
        });
        it("Prime should have block rate of 21024000", async () => {
          expect(await prime.blocksOrSecondsPerYear()).equals(21024000);
        });
        it("PLP should point to new impl", async () => {
          expect(await proxyAdmin.getProxyImplementation(BSCTESTNET_PLP_PROXY)).equals(
            BSCTESTNET_NEW_PLP_IMPLEMENTATION,
          );
        });
        it("PLP should have block rate of 21024000", async () => {
          expect(await plp.blocksOrSecondsPerYear()).equals(21024000);
        });
      });
      describe("VAI Controller", () => {
        it("VAI Controller should point to new impl", async () => {
          expect(await vaiunitroller.vaiControllerImplementation()).equals(BSCTESTNET_NEW_VAI_IMPLEMENTATION);
        });
        it("VAI Controller should have block rate of 21024000", async () => {
          expect(await vaicontroller.getBlocksPerYear()).equals(21024000);
        });
      });
      describe("XVS Vault", async () => {
        it("XVSVAULT should point to new impl", async () => {
          expect(await xvsVaultProxy.implementation()).equals(BSCTESTNET_NEW_XVS_VAULT_IMPLEMENTATION);
        });
        it("XVSVAULT should have block rate of 21024000", async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(21024000);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should point to new impl", async () => {
          expect(await vtokenBeacon.implementation()).equals(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
          expect(await vslisBeacon.implementation()).equals(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
          expect(await vplanetBeacon.implementation()).equals(BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION);
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
          expect(await delegate.admin()).equals(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK);
        });
        it("delegator shopuld point to new impl", async () => {
          expect(await delegator.implementation()).equals(BSCTESTNET_BRAVO_NEW_IMPL);
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
            expect(config.votingPeriod).to.equal(PROPOSAL_CONFIGS[i][0]);
            expect(config.votingDelay).to.equal(PROPOSAL_CONFIGS[i][1]);
            expect(config.proposalThreshold).to.equal(PROPOSAL_CONFIGS[i][2]);
          }
        });
      });
      describe("Configured ACM", () => {
        it("ACM should be configured in XVS vault", async () => {
          expect(await xvsVault.accessControlManager()).equals(BSCTESTNET_ACM);
        });
      });
    });
  });
});
