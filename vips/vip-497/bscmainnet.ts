import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE_BASE = "0xcBBf58bD5bAdE357b634419B70b215D5E9d6FbeD";
export const CHAINLINK_ORACLE_BASE = "0x6F2eA73597955DB37d7C06e1319F0dC7C7455dEb";
export const REDSTONE_ORACLE_BASE = "0xd101Bf51937A6718F402dA944CbfdcD12bB6a6eb";
export const BOUND_VALIDATOR_BASE = "0x66dDE062D3DC1BB5223A0096EbB89395d1f11DB0";
export const DEFAULT_PROXY_ADMIN_BASE = "0x7B06EF6b68648C61aFE0f715740fE3950B90746B";
export const RESILIENT_ORACLE_IMPLEMENTATION_BASE = "0x2632b7b2b34C80B7F854722CEB6b54714476C0A6";
export const CHAINLINK_ORACLE_IMPLEMENTATION_BASE = "0xdA079597acD9eda0c7638534fDB43F06393Fe507";
export const REDSTONE_ORACLE_IMPLEMENTATION_BASE = "0x08482c78427c2E83aA2EeedF06338E05a71bf925";
export const BOUND_VALIDATOR_IMPLEMENTATION_BASE = "0xc92eefCE80e7Ca529a060C485F462C90416cA38A";
export const wSuperOETHb_ORACLE = "0xcd1d2C99642165440c2CC023AFa2092b487f033e";
export const wSuperOETHb = "0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6";
export const wSuperOETHb_Initial_Exchange_Rate = parseUnits("1.058792829884507234", 18);
export const wstETHOracle = "0xDDD4F0836c8016E11fC6741A4886E97B3c3d20C1";
export const wstETH = "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452";
export const ACM_BASE = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const NORMAL_TIMELOCK_BASE = "0x21c12f2946a1a66cBFf7eb997022a37167eCf517";
export const CRITICAL_TIMELOCK_BASE = "0x47F65466392ff2aE825d7a170889F7b5b9D8e60D";
export const FASTTRACK_TIMELOCK_BASE = "0x209F73Ee2Fa9A72aF3Fa6aF1933A3B58ed3De5D7";

export const RESILIENT_ORACLE_OP = "0x21FC48569bd3a6623281f55FC1F8B48B9386907b";
export const CHAINLINK_ORACLE_OP = "0x1076e5A60F1aC98e6f361813138275F1179BEb52";
export const REDSTONE_ORACLE_OP = "0x7478e4656F6CCDCa147B6A7314fF68d0C144751a";
export const BOUND_VALIDATOR_OP = "0x37A04a1eF784448377a19F2b1b67cD40c09eA505";
export const DEFAULT_PROXY_ADMIN_OP = "0xeaF9490cBEA6fF9bA1D23671C39a799CeD0DCED2";
export const RESILIENT_ORACLE_IMPLEMENTATION_OP = "0xB4E073C5abB056D94f14f0F8748B6BFcb418fFe6";
export const CHAINLINK_ORACLE_IMPLEMENTATION_OP = "0x1Abf4919dE8ae2B917d553475e9B1D9CdE6E36D3";
export const BOUND_VALIDATOR_IMPLEMENTATION_OP = "0xc04C8dFF5a91f82f5617Ee9Bd83f6d96de0eb39C";
export const REDSTONE_ORACLE_IMPLEMENTATION_OP = "0x5e448421aB3c505AdF0E5Ee2D2fCCD80FDe08a43";
export const ACM_OP = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const NORMAL_TIMELOCK_OP = "0x0C6f1E6B4fDa846f63A0d5a8a73EB811E0e0C04b";
export const CRITICAL_TIMELOCK_OP = "0xB82479bc345CAA7326D7d21306972033226fC185";
export const FASTTRACK_TIMELOCK_OP = "0x508bD9C31E8d6760De04c70fe6c2b24B3cDea7E7";

export const RESILIENT_ORACLE_UNICHAIN = "0x86D04d6FE928D888076851122dc6739551818f7E";
export const REDSTONE_ORACLE_UNICHAIN = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const BOUND_VALIDATOR_UNICHAIN = "0xfdaA5dEEA7850997dA8A6E2F2Ab42E60F1011C19";
export const RESILIENT_ORACLE_IMPLEMENTATION_UNICHAIN = "0x314197e6f1664C141F90403c990b668e50460315";
export const REDSTONE_ORACLE_IMPLEMENTATION_UNICHAIN = "0x477FB8C53b0c9A2B18295BBA7B1dF41356fC09D0";
export const BOUND_VALIDATOR_IMPLEMENTATION_UNICHAIN = "0x287F0f107ab4a5066bd257d684AFCc09c8d31Bde";
export const DEFAULT_PROXY_ADMIN_UNICHAIN = "0x78e9fff2ab8daAB8559070d897C399E5e1C5074c";
export const ACM_UNICHAIN = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
export const NORMAL_TIMELOCK_UNICHAIN = "0x918532A78d22419Da4091930d472bDdf532BE89a";
export const CRITICAL_TIMELOCK_UNICHAIN = "0x1b05eCb489842786776a9A10e91AAb56e2CFe15e";
export const FASTTRACK_TIMELOCK_UNICHAIN = "0x4121995b87f9EE8bA0a89e87470255e2E0fe48c7";

export const ACM_OPBNB = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const NORMAL_TIMELOCK_OPBNB = "0x10f504e939b912569Dca611851fDAC9E3Ef86819";
export const CRITICAL_TIMELOCK_OPBNB = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";
export const FASTTRACK_TIMELOCK_OPBNB = "0xEdD04Ecef0850e834833789576A1d435e7207C0d";

export const increaseExchangeRateByPercentage = (
  exchangeRate: BigNumber,
  percentage: BigNumber, // BPS value (e.g., 10000 for 100%)
) => {
  const increaseAmount = exchangeRate.mul(percentage).div(10000);
  return exchangeRate.add(increaseAmount).toString();
};

export const DAYS_30 = 30 * 24 * 60 * 60;

export const vip497 = () => {
  const meta = {
    version: "v2",
    title: "VIP-497 [Base][Optimism][Unichain] Capped Oracles and Cached Prices",
    description: `#### Summary

If passed, following the community proposal “[Provide Support for Capped Oracles for Enhanced Security](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xcd64c64eee56e75b56a0a0b84f1ffa2b4ea5fb2be76cca96a155137c46305c07)), this VIP will upgrade the implementations of the following contracts on Base, Optimism and Unichain, including support for Capped Oracles and Cached Prices:

- ResilientOracle
- ChainlinkOracle
- RedStoneOracle
- BoundValidator

Moreover, the oracles for the following assets are updated:

- [Base / wstETH](https://app.venus.io/#/core-pool/market/0x133d3BCD77158D125B75A17Cb517fFD4B4BE64C5?chainId=8453): using the [new implementation for the OneJumpOracle contract](https://github.com/VenusProtocol/oracle/pull/239), without changes in the risk parameters
- [Base / wsuperOETHb](https://app.venus.io/#/core-pool/market/0x75201D81B3B0b9D17b179118837Be37f64fc4930?chainId=8453): using the [new implementation for the ERC4626Oracle contract](https://github.com/VenusProtocol/oracle/pull/239), **capping the price** with the following risk parameters, following the [Chaos Labs recommendation](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092/4):
    - Maximum annual growth rate: 14.26%
    - Automatic snapshot period: 30 days (how frequently the reference value to calculate the cap in the price is updated)
    - Automatic snapshot update gap: 1.11% of the current exchange rate

#### Description

**Capped Oracles** are a type of price oracle designed to limit the maximum value (or growth) of an asset's reported price to protect against manipulation or sudden volatility.

**Cached Prices** is a new feature integrated into the Venus oracle contracts, that reduces the gas consumed by the functions that collect and return the prices, using [Transient Storage](https://soliditylang.org/blog/2024/01/26/transient-storage/) to cache the prices in the smart contract memory. This VIP doesn’t enable Cached Prices for any market on the affected networks. It only upgrades the oracle contracts to support that feature.

More information about Capped Oracles and Cached Prices:

- [VIP-495 [opBNB] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/495?chainId=56)
- [Technical article about Capped Oracles](https://docs-v4.venus.io/technical-reference/reference-technical-articles/capped-oracles)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Certik](https://www.certik.com/), [Quantstamp](https://quantstamp.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new implementations are properly set on opBNB, and the asset prices don’t change
- **Deployment on testnet**: the same upgrade has been performed on opBNB testnet, and used in the Venus Protocol testnet deployment

Permissions are granted to Governance on Base, Optimism, Unichain and opBNB, to configure the new risk parameters related to Capped oracles.

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/125_capped_cached_certik_20250430.pdf) (2025/04/30)
- [Quantstamp](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/127_capped_cached_quantstamp_20250325.pdf) (2025/03/25)
- [Fairyproof audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/126_capped_cached_fairyproof_20250319.pdf) (2025/03/19)

#### Deployed contracts

Mainnet

- Base
    - [New ResilientOracle implementation](https://basescan.org/address/0x2632b7b2b34C80B7F854722CEB6b54714476C0A6)
    - [New ChainlinkOracle implementation](https://basescan.org/address/0xdA079597acD9eda0c7638534fDB43F06393Fe507)
    - [New RedStoneOracle implementation](https://basescan.org/address/0x08482c78427c2E83aA2EeedF06338E05a71bf925)
    - [New BoundValidator implementation](https://basescan.org/address/0xc92eefCE80e7Ca529a060C485F462C90416cA38A)
    - [New oracle for wstETH](https://basescan.org/address/0xDDD4F0836c8016E11fC6741A4886E97B3c3d20C1)
    - [New oracle for wSuperOETHb](https://basescan.org/address/0xcd1d2C99642165440c2CC023AFa2092b487f033e)
- Optimism
    - [New ResilientOracle implementation](https://optimistic.etherscan.io/address/0xB4E073C5abB056D94f14f0F8748B6BFcb418fFe6)
    - [New ChainlinkOracle implementation](https://optimistic.etherscan.io/address/0x1Abf4919dE8ae2B917d553475e9B1D9CdE6E36D3)
    - [New RedStoneOracle implementation](https://optimistic.etherscan.io/address/0x5e448421aB3c505AdF0E5Ee2D2fCCD80FDe08a43)
    - [New BoundValidator implementation](https://optimistic.etherscan.io/address/0xc04C8dFF5a91f82f5617Ee9Bd83f6d96de0eb39C)
- Unichain
    - [New ResilientOracle implementation](https://uniscan.xyz/address/0x314197e6f1664C141F90403c990b668e50460315)
    - [New RedStoneOracle implementation](https://uniscan.xyz/address/0x477FB8C53b0c9A2B18295BBA7B1dF41356fC09D0)
    - [New BoundValidator implementation](https://uniscan.xyz/address/0x287F0f107ab4a5066bd257d684AFCc09c8d31Bde)

Testnet

- Base
    - [New ResilientOracle implementation](https://sepolia.basescan.org/address/0xe8c39006906a9015adC87996AcD1af20f514fdE6)
    - [New ChainlinkOracle implementation](https://sepolia.basescan.org/address/0x238F42Bc8E204583877d670891dF1f67a861ef0a)
    - [New RedStoneOracle implementation](https://sepolia.basescan.org/address/0x91eEfAb71a8BD1E4f2889D51806407cD55DBF2fC)
    - [New BoundValidator implementation](https://sepolia.basescan.org/address/0xae3C407A1C30Ac7A55A97B6A55927f6a2580bD4f)
    - [New oracle for wstETH](https://sepolia.basescan.org/address/0xB242450Ab1CBdd93409ee22c333F6f70aaA6Be08)
    - [New oracle for wSuperOETHb](https://sepolia.basescan.org/address/0x6F6e9Fd240372435eb16dBE36362ECdF84AB0399)
- Optimism
    - [New ResilientOracle implementation](https://sepolia-optimism.etherscan.io/address/0xe36F76dc26885CcEce97B96f80f4FA58c89772Fc)
    - [New ChainlinkOracle implementation](https://sepolia-optimism.etherscan.io/address/0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4)
    - [New BoundValidator implementation](https://sepolia-optimism.etherscan.io/address/0xca8c824E577e1E2EDF4442cB46046ab000FE76CF)
- Unichain
    - [New ResilientOracle implementation](https://sepolia.uniscan.xyz/address/0x4E953e3741a17aFaD69776742d1ED1c0130F43f7)
    - [New RedStoneOracle implementation](https://sepolia.uniscan.xyz/address/0x44A47AfC1A9467Dfe1D5E967cA78432C699a13d9)
    - [New BoundValidator implementation](https://sepolia.uniscan.xyz/address/0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4)

#### References

- [Capped Oracles and Cached Prices feature](https://github.com/VenusProtocol/oracle/pull/239)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/551)
- Upgrades on testnets
    - [Base Sepolia](https://sepolia.basescan.org/tx/0x36df802b58633c6c13d5591e510f1fe0d7318cc7099b2dada83778b515a788d3)
    - [Optimism Sepolia](https://sepolia-optimism.etherscan.io/tx/0x9c9f0cbfb9fa1ab61357be9bd1d78de0cb9bc6ac2b7b85c9dcf66907fc996785)
    - [Unichain Sepolia](https://sepolia.uniscan.xyz/tx/0x83e3a6b86ec498a8d9bfc342213cfaeeae4e5e0df42468a61729559f68964d36)
- Configuration of permissions on [opBNB testnet](https://testnet.opbnbscan.com/tx/0xf4e541bddfcd7204dc449d13157f2ba13294db270b4047ff80ee376b47e980c2)
- [Technical article about Capped Oracles](https://docs-v4.venus.io/technical-reference/reference-technical-articles/capped-oracles)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_BASE, RESILIENT_ORACLE_IMPLEMENTATION_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_BASE, CHAINLINK_ORACLE_IMPLEMENTATION_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_BASE, REDSTONE_ORACLE_IMPLEMENTATION_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_BASE, BOUND_VALIDATOR_IMPLEMENTATION_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: RESILIENT_ORACLE_BASE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wSuperOETHb,
            [wSuperOETHb_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: RESILIENT_ORACLE_BASE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH,
            [wstETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_BASE],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: wSuperOETHb_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(wSuperOETHb_Initial_Exchange_Rate, BigNumber.from("111")),
          1746529509,
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: wSuperOETHb_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.1426", 18), DAYS_30],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_OP, RESILIENT_ORACLE_IMPLEMENTATION_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_OP, CHAINLINK_ORACLE_IMPLEMENTATION_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_OP, BOUND_VALIDATOR_IMPLEMENTATION_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_OP, REDSTONE_ORACLE_IMPLEMENTATION_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OP,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OP,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OP,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OP,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OP,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OP,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OP,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OP,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ACM_OP,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_OP],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_UNICHAIN,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_UNICHAIN, RESILIENT_ORACLE_IMPLEMENTATION_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_UNICHAIN,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_UNICHAIN, REDSTONE_ORACLE_IMPLEMENTATION_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_UNICHAIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_UNICHAIN, BOUND_VALIDATOR_IMPLEMENTATION_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_UNICHAIN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_OPBNB],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip497;
