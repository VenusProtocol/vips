import { TransactionResponse } from "@ethersproject/providers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, Event } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip522, {
  ACM_BNB,
  ERC4626_FACTORY_BNB,
  PROXY_ADMIN_BNB,
  PSR_BNB,
  PSR_BNB_NEW_IMPLEMENTATION,
} from "../../vips/vip-522/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import ERC20_ABI from "./abi/ERC20.json";
import ERC4626_ABI from "./abi/ERC4626.json";
import ERC4626FACTORY_ABI from "./abi/ERC4626Factory.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import REWARD_TOKEN_ABI from "./abi/RewardToken.json";

const { bsctestnet } = NETWORK_ADDRESSES;
const DEPLOYER = "0x33C6476F88eeA28D7E7900F759B4597704Ef95B7";
const BLOCK_NUMBER = 53864628;
const PSR_BNB_OLD_IMPLEMENTATION = "0x91B67df8B13a1B53a3828EAAD3f4233B55FEc26d";
const USDT_HOLDER = "0x1818bc7F71F7314b8fb63da2956DC710CEf60994";
const USDT_STABLECOIN = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const VUSDT_STABLECOIN = "0x3338988d0beb4419Acb8fE624218754053362D06";
const COMPTROLLER_STABLECOIN = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let erc4626Factory: Contract;
  let defaultProxyAdmin: Contract;
  let usdt: Contract;
  let comptroller: Contract;
  let venusERC4626: Contract;
  let adminSigner: SignerWithAddress;
  let usdtHolder: SignerWithAddress;
  let userSigner: SignerWithAddress;

  before(async () => {
    erc4626Factory = new ethers.Contract(ERC4626_FACTORY_BNB, ERC4626FACTORY_ABI, provider);
    defaultProxyAdmin = new ethers.Contract(PROXY_ADMIN_BNB, PROXY_ADMIN_ABI, provider);
    adminSigner = await initMainnetUser(bsctestnet.NORMAL_TIMELOCK, parseUnits("2"));

    // Initialize signers
    userSigner = await initMainnetUser(await ethers.provider.getSigner().getAddress(), parseUnits("2"));
    usdtHolder = await initMainnetUser(USDT_HOLDER, parseUnits("2"));

    // Get testnet contracts
    usdt = new ethers.Contract(USDT_STABLECOIN, ERC20_ABI, provider);
    comptroller = new ethers.Contract(COMPTROLLER_STABLECOIN, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("ERC4626Factory owner should be the Deployer", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(DEPLOYER);
    });

    it("ERC4626Factory pending owner should be Normal Timelock", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(bsctestnet.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory should have correct ACM", async () => {
      expect(await erc4626Factory.accessControlManager()).to.be.equals(ACM_BNB);
    });

    it("ERC4626Factory rewardRecipient should be the deployer", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(DEPLOYER);
    });

    it("old PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_BNB)).to.be.equals(PSR_BNB_OLD_IMPLEMENTATION);
    });
  });

  testVip("VIP-522", await vip522(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [7, 0],
      );

      await expectEvents(
        txResponse,
        [ERC4626FACTORY_ABI, ACM_ABI],
        ["OwnershipTransferred", "PermissionGranted", "RewardRecipientUpdated"],
        [1, 4, 1],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("ERC4626Factory ownership transferred to Normal Timelock", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(bsctestnet.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory pending owner should be zero address", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethers.constants.AddressZero);
    });

    it("ERC4626Factory rewardRecipient should be the PSR", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(PSR_BNB);
    });

    it("new PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_BNB)).to.be.equals(PSR_BNB_NEW_IMPLEMENTATION);
    });

    it("check for claimRewards", async () => {
      // Deploy VenusERC4626
      const tx = await erc4626Factory.connect(userSigner).createERC4626(VUSDT_STABLECOIN);
      const receipt = await tx.wait();

      const createERC4626Event = receipt.events?.find((e: Event) => e.event === "CreateERC4626");
      const venusERC4626Address = createERC4626Event?.args?.vault;

      // Deploy VenusERC4626 once we set PSR as rewardRecipient
      venusERC4626 = new ethers.Contract(venusERC4626Address, ERC4626_ABI, provider);

      // we already paused USDT market in stablecoins
      await comptroller.connect(adminSigner).setActionsPaused([VUSDT_STABLECOIN], [0], false);

      // we need to set the MarketSupplyCaps for USDT
      await comptroller.connect(adminSigner).setMarketSupplyCaps([VUSDT_STABLECOIN], [parseUnits("2000", 18)]);

      // Fund user with USDT
      await usdt.connect(usdtHolder).transfer(await userSigner.getAddress(), parseUnits("1000", 18));
      await usdt.connect(userSigner).approve(venusERC4626Address, parseUnits("10000", 18));

      const depositAmount = parseUnits("1000", 18);

      // Make a deposit to start earning rewards
      await venusERC4626.connect(userSigner).deposit(depositAmount, await userSigner.getAddress());
      await mine(10000000);

      const distributors = await comptroller.getRewardDistributors();
      if (distributors.length === 0) {
        console.log("No active reward distributors - skipping test");
        return;
      }

      const distributor = new ethers.Contract(distributors[0], REWARD_DISTRIBUTOR_ABI, provider);
      const rewardTokenAddress = await distributor.rewardToken();
      const rewardToken = new ethers.Contract(rewardTokenAddress, REWARD_TOKEN_ABI, provider);

      const initialPsrBalance = await rewardToken.balanceOf(PSR_BNB);

      await expect(venusERC4626.connect(userSigner).claimRewards()).to.emit(venusERC4626, "ClaimRewards");

      // Check balances (Reward balance will be 0 as the rewardTokenSupplySpeeds is 0 for the reward Token)
      const finalPsrBalance = await rewardToken.balanceOf(PSR_BNB);
      expect(finalPsrBalance).to.equal(initialPsrBalance);
    });
  });
});
