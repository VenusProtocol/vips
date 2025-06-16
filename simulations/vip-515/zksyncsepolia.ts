import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, Event, Wallet } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip515, {
  ACM_ZKSYNC,
  ERC4626_FACTORY_ZKSYNC,
  PROXY_ADMIN_ZKSYNC,
  PSR_ZKSYNC,
  PSR_ZKSYNC_NEW_IMPLEMENTATION,
} from "../../vips/vip-515/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import ERC20_ABI from "./abi/ERC20.json";
import ERC4626_ABI from "./abi/ERC4626.json";
import ERC4626FACTORY_ABI from "./abi/ERC4626Factory.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import REWARD_TOKEN_ABI from "./abi/RewardToken.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;
const DEPLOYER = "0x50e36E99F4e89d3B8EB636f73a8A28B4A2f601C7";
const BLOCK_NUMBER = 5248239;
const PSR_ZKSYNC_OLD_IMPLEMENTATION = "0x817F19DC65bBe7f87b6941aa11637A1744E4fdD6";
const WETH_HOLDER = "0xEF4B807f9442b0EbD8a051C2cAEA81e5e7BAcFBD";
const WETH_CORE = "0x53F7e72C7ac55b44c7cd73cC13D4EF4b121678e6";
const VWETH_CORE = "0x31eb7305f9fE281027028D0ba0d7f57ddA836d49";
const COMPTROLLER_CORE = "0xC527DE08E43aeFD759F7c0e6aE85433923064669";

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let erc4626Factory: Contract;
  let defaultProxyAdmin: Contract;
  let weth: Contract;
  let comptroller: Contract;
  let venusERC4626: Contract;
  let wethHolder: SignerWithAddress;
  let userSigner: Wallet;

  before(async () => {
    erc4626Factory = new ethers.Contract(ERC4626_FACTORY_ZKSYNC, ERC4626FACTORY_ABI, provider);
    defaultProxyAdmin = new ethers.Contract(PROXY_ADMIN_ZKSYNC, PROXY_ADMIN_ABI, provider);

    // Initialize signers
    userSigner = ethers.Wallet.createRandom().connect(provider);

    await ethers.provider.send("hardhat_setBalance", [
      userSigner.address,
      parseUnits("10", 18).toHexString(), // Set balance in hex
    ]);

    const tx = {
      to: userSigner.address,
      value: parseUnits("0", 18),
      nonce: 0,
    };

    await userSigner.sendTransaction(tx);

    wethHolder = await initMainnetUser(WETH_HOLDER, parseUnits("2"));

    // Get testnet contracts
    weth = new ethers.Contract(WETH_CORE, ERC20_ABI, provider);
    comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("ERC4626Factory owner should be the Deployer", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(DEPLOYER);
    });

    it("ERC4626Factory pending owner should be Normal Timelock", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(zksyncsepolia.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory should have correct ACM", async () => {
      expect(await erc4626Factory.accessControlManager()).to.be.equals(ACM_ZKSYNC);
    });

    it("ERC4626Factory rewardRecipient should be the deployer", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(DEPLOYER);
    });

    it("old PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_ZKSYNC)).to.be.equals(PSR_ZKSYNC_OLD_IMPLEMENTATION);
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
      expect(await erc4626Factory.owner()).to.be.equals(zksyncsepolia.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory pending owner should be zero address", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethers.constants.AddressZero);
    });

    it("ERC4626Factory rewardRecipient should be the PSR", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(PSR_ZKSYNC);
    });

    it("new PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_ZKSYNC)).to.be.equals(PSR_ZKSYNC_NEW_IMPLEMENTATION);
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
      await weth.connect(wethHolder).transfer(await userSigner.getAddress(), parseUnits("1", 16));
      await weth.connect(userSigner).approve(venusERC4626Address, parseUnits("1", 18));
      const depositAmount = parseUnits("1", 16);

      // Make a deposit to start earning rewards
      await venusERC4626.connect(userSigner).deposit(depositAmount, await userSigner.getAddress());
      await mine(3);

      const distributors = await comptroller.getRewardDistributors();
      if (distributors.length === 0) {
        console.log("No active reward distributors - skipping test");
        return;
      }

      const distributor = new ethers.Contract(distributors[0], REWARD_DISTRIBUTOR_ABI, provider);
      const rewardTokenAddress = await distributor.rewardToken();
      const rewardToken = new ethers.Contract(rewardTokenAddress, REWARD_TOKEN_ABI, provider);

      const initialPsrBalance = await rewardToken.balanceOf(PSR_ZKSYNC);

      await expect(venusERC4626.connect(userSigner).claimRewards()).to.emit(venusERC4626, "ClaimRewards");
      const finalPsrBalance = await rewardToken.balanceOf(PSR_ZKSYNC);

      // reward tokens transfered to PSR
      expect(finalPsrBalance).to.be.gte(initialPsrBalance);
    });
  });
});
