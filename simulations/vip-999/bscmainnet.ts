import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import ERC1967_PROXY_ARTIFACT from "@openzeppelin/contracts/build/contracts/ERC1967Proxy.json";
import CHAINLINK_ORACLE_ARTIFACT from "@venusprotocol/oracle/artifacts/contracts/oracles/ChainlinkOracle.sol/ChainlinkOracle.json";
import { expect } from "chai";
import { BigNumberish, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, { XVS_PROXY_OFT_SRC, remoteBridgeEntries } from "../../vips/vip-999/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/XVSBridgeAdmin.json";
import XVS_BRIDGE_SRC_ABI from "./abi/XVSProxyOFTSrc.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const SUPPORTER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";
const XVS_HOLDER = "0x4F2F8448F857994CE83ef14cf4EBb7DF0bb14667";

const ONE_YEAR = 31536000;
const ORACLE_ROLE_MAIN = 0;
const ORACLE_ROLE_PIVOT = 1;
const ORACLE_ROLE_FALLBACK = 2;

const ACM_ABI = ["function giveCallPermission(address, string, address) external"];
const RESILIENT_ORACLE_SET_ORACLE_ABI = ["function setOracle(address asset, address oracle, uint8 role)"];

// Pin XVS to $1 so the cap is the only thing that can block `sendFrom`.
// Deploys a fresh ChainlinkOracle (RedStone uses the same bytecode) behind
// an ERC1967 proxy, sets a $1 direct price, then swaps it in as XVS's MAIN
// on the live ResilientOracle with pivot + fallback cleared.
const overrideXvsPriceOnBsc = async () => {
  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;

  const implFactory = new ethers.ContractFactory(
    CHAINLINK_ORACLE_ARTIFACT.abi,
    CHAINLINK_ORACLE_ARTIFACT.bytecode,
    deployer,
  );
  const impl = await implFactory.deploy();
  await impl.deployed();

  const initData = impl.interface.encodeFunctionData("initialize", [bscmainnet.ACCESS_CONTROL_MANAGER]);
  const proxyFactory = new ethers.ContractFactory(
    ERC1967_PROXY_ARTIFACT.abi,
    ERC1967_PROXY_ARTIFACT.bytecode,
    deployer,
  );
  const proxy = await proxyFactory.deploy(impl.address, initData);
  await proxy.deployed();

  const xvsOracle = new ethers.Contract(proxy.address, CHAINLINK_ORACLE_ARTIFACT.abi, deployer);

  const acmAdmin = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
  const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, provider);
  await acm.connect(acmAdmin).giveCallPermission(xvsOracle.address, "setDirectPrice(address,uint256)", deployer.address);
  await acm.connect(acmAdmin).giveCallPermission(xvsOracle.address, "setTokenConfig(TokenConfig)", deployer.address);

  // ChainlinkOracle.setTokenConfig requires a non-zero feed; the feed address
  // is never consulted once `setDirectPrice` writes a non-zero `prices[asset]`.
  await xvsOracle.setTokenConfig({
    asset: bscmainnet.XVS,
    feed: "0x0000000000000000000000000000000000000001",
    maxStalePeriod: ONE_YEAR,
  });
  await xvsOracle.setDirectPrice(bscmainnet.XVS, parseUnits("1", 18));

  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_SET_ORACLE_ABI, provider);
  await resilientOracle.connect(acmAdmin).setOracle(bscmainnet.XVS, xvsOracle.address, ORACLE_ROLE_MAIN);
  await resilientOracle.connect(acmAdmin).setOracle(bscmainnet.XVS, ethers.constants.AddressZero, ORACLE_ROLE_PIVOT);
  await resilientOracle.connect(acmAdmin).setOracle(bscmainnet.XVS, ethers.constants.AddressZero, ORACLE_ROLE_FALLBACK);
};

const readLimits = async (bridge: Contract, dstLzChainId: LzChainId) => ({
  maxDailyLimit: await bridge.chainIdToMaxDailyLimit(dstLzChainId),
  maxSingleTransactionLimit: await bridge.chainIdToMaxSingleTransactionLimit(dstLzChainId),
});

const expectLimitsEqual = (
  actual: Record<string, BigNumberish>,
  expected: Record<string, BigNumberish>,
  label: string,
) => {
  for (const key of Object.keys(expected)) {
    expect(actual[key], `${label}.${key}`).to.equal(expected[key]);
  }
};

forking(96883423, async () => {
  const provider = ethers.provider;
  let bridge: Contract;

  beforeEach(async () => {
    bridge = new ethers.Contract(XVS_PROXY_OFT_SRC, XVS_BRIDGE_SRC_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    for (const entry of remoteBridgeEntries) {
      describe(`chain ${LzChainId[entry.dstLzChainId]} (${entry.dstLzChainId})`, () => {
        it("matches `before` limits", async () => {
          const onChain = await readLimits(bridge, entry.dstLzChainId);
          expectLimitsEqual(onChain, entry.before, "before");
        });
      });
    }
  });

  testVip("VIP-999 Update XVS bridge limits on BSC", await vip999(), {
    supporter: SUPPORTER,
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_SRC_ABI],
        ["SetMaxDailyLimit", "SetMaxSingleTransactionLimit", "Failure"],
        [5, 5, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    for (const entry of remoteBridgeEntries) {
      describe(`chain ${LzChainId[entry.dstLzChainId]} (${entry.dstLzChainId})`, () => {
        it("matches `after` limits", async () => {
          const onChain = await readLimits(bridge, entry.dstLzChainId);
          expectLimitsEqual(onChain, entry.after, "after");
        });
      });
    }

    // Live `sendFrom` exercises the cap on every changed destination:
    //   - LOWERED (Ethereum): single-tx cap reduced but still positive — a
    //     small-amount sendFrom should succeed under the new cap.
    //   - ZEROED (opBNB, zkSync, Optimism, Unichain): single-tx cap is now
    //     zero — any non-zero send must revert with "Single Transaction
    //     Limit Exceed".
    describe("Cap enforcement (live `sendFrom`)", () => {
      const ZEROED = remoteBridgeEntries.filter(e => e.after.maxSingleTransactionLimit.isZero());
      const LOWERED = remoteBridgeEntries.filter(
        e =>
          !e.after.maxSingleTransactionLimit.eq(e.before.maxSingleTransactionLimit) &&
          !e.after.maxSingleTransactionLimit.isZero(),
      );
      const TESTED = [...LOWERED, ...ZEROED];

      const SEND_AMOUNT = parseUnits("0.5", 18);
      const fees = new Map<number, BigNumberish>();

      let xvs: Contract;
      let xvsHolderSigner: SignerWithAddress;
      let receiver: SignerWithAddress;
      let receiverAddressBytes32: string;
      let defaultAdapterParams: string;

      before(async () => {
        [receiver] = await ethers.getSigners();
        receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
        defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

        // Estimate LZ relay fees per destination BEFORE stubbing — these are
        // pure `lzEndpoint.estimateFees` reads, never touching the oracle.
        for (const e of TESTED) {
          const { nativeFee } = await bridge.estimateSendFee(
            e.dstLzChainId,
            receiverAddressBytes32,
            SEND_AMOUNT,
            false,
            defaultAdapterParams,
          );
          fees.set(e.dstLzChainId, nativeFee);
        }

        await overrideXvsPriceOnBsc();

        xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
        xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("10"));

        // Fund the test holder by impersonating the bridge
        const impersonatedBridge = await initMainnetUser(XVS_PROXY_OFT_SRC, ethers.utils.parseEther("2"));
        const fundAmount = SEND_AMOUNT.mul(TESTED.length).add(parseUnits("1", 18));
        await xvs.connect(impersonatedBridge).transfer(XVS_HOLDER, fundAmount);

        await xvs.connect(xvsHolderSigner).approve(bridge.address, ethers.constants.MaxUint256);
      });

      for (const e of LOWERED) {
        it(`allows BSC -> ${LzChainId[e.dstLzChainId]} sendFrom within the new cap`, async () => {
          await expect(
            bridge
              .connect(xvsHolderSigner)
              .sendFrom(
                xvsHolderSigner.address,
                e.dstLzChainId,
                receiverAddressBytes32,
                SEND_AMOUNT,
                [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
                { value: fees.get(e.dstLzChainId) },
              ),
          )
            .to.emit(bridge, "SendToChain")
            .withArgs(e.dstLzChainId, XVS_HOLDER, receiverAddressBytes32, SEND_AMOUNT);
        });
      }

      for (const e of ZEROED) {
        it(`reverts BSC -> ${LzChainId[e.dstLzChainId]} sendFrom with "Single Transaction Limit Exceed"`, async () => {
          await expect(
            bridge
              .connect(xvsHolderSigner)
              .sendFrom(
                xvsHolderSigner.address,
                e.dstLzChainId,
                receiverAddressBytes32,
                SEND_AMOUNT,
                [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
                { value: fees.get(e.dstLzChainId) },
              ),
          ).to.be.revertedWith("Single Transaction Limit Exceed");
        });
      }
    });
  });
});
