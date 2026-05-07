import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumberish, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, { XVS_PROXY_OFT_SRC, remoteBridgeEntries } from "../../vips/vip-999/bscmainnet";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/XVSBridgeAdmin.json";
import XVS_BRIDGE_SRC_ABI from "./abi/XVSProxyOFTSrc.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const SUPPORTER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";
// Binance 8 hot wallet: pure EOA holding ~1.76M XVS at the fork block.
const XVS_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

// XVS in the BSC ResilientOracle has 3 oracles configured: main = Chainlink,
// pivot = Binance feed registry, fallback = RedStone. We promote RedStone
// to MAIN, disable pivot+fallback, and pin RedStone's `prices[XVS]` via
// `setDirectPrice` so `ResilientOracle.getPrice(XVS)` returns a stable value
// during the cap-enforcement tests. Returns the pinned USD18 price so callers
// can convert XVS amounts to USD without re-reading the oracle (the live feed
// path stays sensitive to staleness even after `setDirectPrice` is set).
const overrideXvsPriceOnBsc = async () => {
  const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));

  const redstone = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);
  const xvsPrice = await redstone.getPrice(bscmainnet.XVS);
  await redstone.connect(timelock).setDirectPrice(bscmainnet.XVS, xvsPrice);

  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  await resilientOracle.connect(timelock).setTokenConfig({
    asset: bscmainnet.XVS,
    oracles: [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
    enableFlagsForOracles: [true, false, false],
    cachingEnabled: false,
  });

  return xvsPrice;
};

forking(96883423, async () => {
  const provider = ethers.provider;
  let bridge: Contract;
  let xvsPriceUsd18: BigNumberish;

  // Pin XVS price BEFORE the VIP runs — `testVip` advances time past timelock delays,
  // which pushes the fork past RedStone's staleness window. Reading `getPrice` after
  // that point reverts; setting `setDirectPrice` while the feed is still fresh keeps
  // the pinned value usable through post-VIP `sendFrom` calls.
  before(async () => {
    xvsPriceUsd18 = await overrideXvsPriceOnBsc();
  });

  beforeEach(async () => {
    bridge = new ethers.Contract(XVS_PROXY_OFT_SRC, XVS_BRIDGE_SRC_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    describe("Current bridge limits per remote chain", () => {
      for (const entry of remoteBridgeEntries) {
        it(`BSC → ${LzChainId[entry.dstLzChainId]} (${entry.dstLzChainId}) matches old limits`, async () => {
          expect(await bridge.chainIdToMaxDailyLimit(entry.dstLzChainId)).to.equal(entry.oldMaxDailyLimit);
          expect(await bridge.chainIdToMaxSingleTransactionLimit(entry.dstLzChainId)).to.equal(
            entry.oldMaxSingleTransactionLimit,
          );
          expect(await bridge.chainIdToMaxDailyReceiveLimit(entry.dstLzChainId)).to.equal(
            entry.oldMaxDailyReceiveLimit,
          );
          expect(await bridge.chainIdToMaxSingleReceiveTransactionLimit(entry.dstLzChainId)).to.equal(
            entry.oldMaxSingleReceiveTransactionLimit,
          );
        });
      }
    });
  });

  testVip("VIP-999 Update XVS bridge limits on BSC", await vip999(), {
    supporter: SUPPORTER,
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_SRC_ABI],
        [
          "SetMaxDailyLimit",
          "SetMaxSingleTransactionLimit",
          "SetMaxDailyReceiveLimit",
          "SetMaxSingleReceiveTransactionLimit",
        ],
        [5, 5, 5, 5],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    describe("New bridge limits per remote chain", () => {
      for (const entry of remoteBridgeEntries) {
        it(`BSC → ${LzChainId[entry.dstLzChainId]} (${entry.dstLzChainId}) matches new limits`, async () => {
          expect(await bridge.chainIdToMaxDailyLimit(entry.dstLzChainId)).to.equal(entry.newMaxDailyLimit);
          expect(await bridge.chainIdToMaxSingleTransactionLimit(entry.dstLzChainId)).to.equal(
            entry.newMaxSingleTransactionLimit,
          );
          expect(await bridge.chainIdToMaxDailyReceiveLimit(entry.dstLzChainId)).to.equal(
            entry.newMaxDailyReceiveLimit,
          );
          expect(await bridge.chainIdToMaxSingleReceiveTransactionLimit(entry.dstLzChainId)).to.equal(
            entry.newMaxSingleReceiveTransactionLimit,
          );
        });
      }
    });

    // Live `sendFrom` per affected route: tightened routes must succeed within the new cap;
    // disabled routes (single-tx cap == 0) must revert with "Single Transaction Limit Exceed".
    describe("Single-tx cap enforcement on `sendFrom`", () => {
      const disabledRoutes = remoteBridgeEntries.filter(entry => entry.newMaxSingleTransactionLimit.isZero());
      const tightenedRoutes = remoteBridgeEntries.filter(
        entry =>
          !entry.newMaxSingleTransactionLimit.eq(entry.oldMaxSingleTransactionLimit) &&
          !entry.newMaxSingleTransactionLimit.isZero(),
      );
      const affectedRoutes = [...tightenedRoutes, ...disabledRoutes];

      const SEND_AMOUNT = parseUnits("0.5", 18);
      const fees = new Map<number, BigNumberish>();
      const overCapAmounts = new Map<number, BigNumberish>();

      let xvs: Contract;
      let xvsHolderSigner: SignerWithAddress;
      let receiver: SignerWithAddress;
      let receiverAddressBytes32: string;
      let defaultAdapterParams: string;

      before(async () => {
        [receiver] = await ethers.getSigners();
        receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
        defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

        for (const entry of affectedRoutes) {
          const { nativeFee } = await bridge.estimateSendFee(
            entry.dstLzChainId,
            receiverAddressBytes32,
            SEND_AMOUNT,
            false,
            defaultAdapterParams,
          );
          fees.set(entry.dstLzChainId, nativeFee);
        }

        // For each tightened route, compute an XVS amount whose USD value sits just above the new cap.
        // Limits are USD18; oracle returns USD18 for an 18-decimal token, so amount * price / 1e18 = USD.
        // overCap = cap * 1e18 / price + 1 XVS adds a safe cushion past rounding. Price is captured
        // pre-VIP in the outer `before` since RedStone's feed is stale at this point in the run.
        for (const entry of tightenedRoutes) {
          const overCap = entry.newMaxSingleTransactionLimit
            .mul(parseUnits("1", 18))
            .div(xvsPriceUsd18)
            .add(parseUnits("1", 18));
          overCapAmounts.set(entry.dstLzChainId, overCap);
        }

        xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
        xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("10"));
        await xvs.connect(xvsHolderSigner).approve(bridge.address, ethers.constants.MaxUint256);
      });

      for (const entry of tightenedRoutes) {
        it(`BSC → ${LzChainId[entry.dstLzChainId]}: sendFrom succeeds within the lowered cap`, async () => {
          await expect(
            bridge
              .connect(xvsHolderSigner)
              .sendFrom(
                xvsHolderSigner.address,
                entry.dstLzChainId,
                receiverAddressBytes32,
                SEND_AMOUNT,
                [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
                { value: fees.get(entry.dstLzChainId) },
              ),
          )
            .to.emit(bridge, "SendToChain")
            .withArgs(entry.dstLzChainId, XVS_HOLDER, receiverAddressBytes32, SEND_AMOUNT);
        });

        it(`BSC → ${LzChainId[entry.dstLzChainId]}: sendFrom reverts when amount exceeds the lowered cap`, async () => {
          await expect(
            bridge
              .connect(xvsHolderSigner)
              .sendFrom(
                xvsHolderSigner.address,
                entry.dstLzChainId,
                receiverAddressBytes32,
                overCapAmounts.get(entry.dstLzChainId)!,
                [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
                { value: fees.get(entry.dstLzChainId) },
              ),
          ).to.be.revertedWith("Single Transaction Limit Exceed");
        });
      }

      for (const entry of disabledRoutes) {
        it(`BSC → ${LzChainId[entry.dstLzChainId]}: sendFrom reverts — single-tx cap is 0`, async () => {
          await expect(
            bridge
              .connect(xvsHolderSigner)
              .sendFrom(
                xvsHolderSigner.address,
                entry.dstLzChainId,
                receiverAddressBytes32,
                SEND_AMOUNT,
                [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
                { value: fees.get(entry.dstLzChainId) },
              ),
          ).to.be.revertedWith("Single Transaction Limit Exceed");
        });
      }
    });
  });
});
