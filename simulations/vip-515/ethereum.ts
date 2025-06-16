import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, Event } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip515, {
  ACM_ETHEREUM,
  ERC4626_FACTORY_ETHEREUM,
  PROXY_ADMIN_ETHEREUM,
  PSR_ETHEREUM,
  PSR_ETHEREUM_NEW_IMPLEMENTATION,
} from "../../vips/vip-515/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import ERC20_ABI from "./abi/ERC20.json";
import ERC4626_ABI from "./abi/ERC4626.json";
import ERC4626FACTORY_ABI from "./abi/ERC4626Factory.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import REWARD_TOKEN_ABI from "./abi/RewardToken.json";

const { ethereum } = NETWORK_ADDRESSES;
const DEPLOYER = "0xA9d02961b4B8902023Ce464F47502950f6e359b4";
const BLOCK_NUMBER = 22659501;
const PSR_ETHEREUM_OLD_IMPLEMENTATION = "0xee934792431B4Ebd91591a86c884A8b49Ed494C2";
const WETH_HOLDER = "0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E";
const WETH_CORE = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const VWETH_CORE = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let erc4626Factory: Contract;
  let defaultProxyAdmin: Contract;
  let weth: Contract;
  let comptroller: Contract;
  let venusERC4626: Contract;
  let wethHolder: SignerWithAddress;
  let userSigner: SignerWithAddress;

  before(async () => {
    erc4626Factory = new ethers.Contract(ERC4626_FACTORY_ETHEREUM, ERC4626FACTORY_ABI, provider);
    defaultProxyAdmin = new ethers.Contract(PROXY_ADMIN_ETHEREUM, PROXY_ADMIN_ABI, provider);

    // Initialize signers
    userSigner = await initMainnetUser(await ethers.provider.getSigner().getAddress(), parseUnits("2"));
    wethHolder = await initMainnetUser(WETH_HOLDER, parseUnits("2"));

    // Get mainnet contracts
    weth = new ethers.Contract(WETH_CORE, ERC20_ABI, provider);
    comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("ERC4626Factory owner should be the Deployer", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(DEPLOYER);
    });

    it("ERC4626Factory pending owner should be Normal Timelock", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethereum.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory should have correct ACM", async () => {
      expect(await erc4626Factory.accessControlManager()).to.be.equals(ACM_ETHEREUM);
    });

    it("ERC4626Factory rewardRecipient should be the deployer", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(DEPLOYER);
    });

    it("old PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_ETHEREUM)).to.be.equals(
        PSR_ETHEREUM_OLD_IMPLEMENTATION,
      );
    });
  });

  testForkedNetworkVipCommands("Accept ownerships for ERC4626Factory", await vip515(), {
    callbackAfterExecution: async txResponse => {
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
      expect(await erc4626Factory.owner()).to.be.equals(ethereum.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory pending owner should be zero address", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethers.constants.AddressZero);
    });

    it("ERC4626Factory rewardRecipient should be the PSR", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(PSR_ETHEREUM);
    });

    it("new PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_ETHEREUM)).to.be.equals(
        PSR_ETHEREUM_NEW_IMPLEMENTATION,
      );
    });

    it("check for claimRewards", async () => {
      // Deploy VenusERC4626
      const tx = await erc4626Factory.connect(userSigner).createERC4626(VWETH_CORE);
      const receipt = await tx.wait();

      const createERC4626Event = receipt.events?.find((e: Event) => e.event === "CreateERC4626");
      const venusERC4626Address = createERC4626Event?.args?.vault;

      // Deploy VenusERC4626 once we set PSR as rewardRecipient
      venusERC4626 = new ethers.Contract(venusERC4626Address, ERC4626_ABI, provider);

      // Fund user with WETH
      await weth.connect(wethHolder).transfer(await userSigner.getAddress(), parseUnits("20", 18));
      await weth.connect(userSigner).approve(venusERC4626Address, parseUnits("200", 18));

      const depositAmount = parseUnits("20", 18);

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

      const initialPsrBalance = await rewardToken.balanceOf(PSR_ETHEREUM);

      await expect(venusERC4626.connect(userSigner).claimRewards()).to.emit(venusERC4626, "ClaimRewards");
      const finalPsrBalance = await rewardToken.balanceOf(PSR_ETHEREUM);

      // reward tokens transfered to PSR
      expect(finalPsrBalance).to.be.gte(initialPsrBalance);
    });
  });
});
