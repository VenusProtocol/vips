import govBscmainnetContracts from "@venusprotocol/governance-contracts/deployments/bscmainnet_addresses.json";
import govBsctestnetContracts from "@venusprotocol/governance-contracts/deployments/bsctestnet_addresses.json";
import ilBscmainnetDeployedContracts from "@venusprotocol/isolated-pools/deployments/bscmainnet_addresses.json";
import ilBsctestnetDeployedContracts from "@venusprotocol/isolated-pools/deployments/bsctestnet_addresses.json";
import ilEthereumDeployedContracts from "@venusprotocol/isolated-pools/deployments/ethereum_addresses.json";
import ilSepoliaDeployedContracts from "@venusprotocol/isolated-pools/deployments/sepolia_addresses.json";
import oracleBscmainnetContracts from "@venusprotocol/oracle/deployments/bscmainnet_addresses.json";
import oracleBsctestnetContracts from "@venusprotocol/oracle/deployments/bsctestnet_addresses.json";
import oracleEthereumContracts from "@venusprotocol/oracle/deployments/ethereum_addresses.json";
import oracleSepoliaContracts from "@venusprotocol/oracle/deployments/sepolia_addresses.json";
import tokenBridgeEthereumContracts from "@venusprotocol/token-bridge/deployments/ethereum_addresses.json";
import tokenBridgeOpbnbmainnetContracts from "@venusprotocol/token-bridge/deployments/opbnbmainnet_addresses.json";
import tokenBridgeOpbnbtestnetContracts from "@venusprotocol/token-bridge/deployments/opbnbtestnet_addresses.json";
import tokenBridgeSepoliaContracts from "@venusprotocol/token-bridge/deployments/sepolia_addresses.json";
import bscmainnetDeployedContracts from "@venusprotocol/venus-protocol/deployments/bscmainnet_addresses.json";
import bsctestnetDeployedContracts from "@venusprotocol/venus-protocol/deployments/bsctestnet_addresses.json";
import ethereumDeployedContracts from "@venusprotocol/venus-protocol/deployments/ethereum_addresses.json";
import opbnbmainnetDeployedContracts from "@venusprotocol/venus-protocol/deployments/opbnbmainnet_addresses.json";
import opbnbtestnetDeployedContracts from "@venusprotocol/venus-protocol/deployments/opbnbtestnet_addresses.json";
import sepoliaDeployedContracts from "@venusprotocol/venus-protocol/deployments/sepolia_addresses.json";
import { ethers } from "ethers";

export const ZERO_ADDRESS = ethers.constants.AddressZero;

export const NETWORK_ADDRESSES = {
  bscmainnet: {
    DEFAULT_PROPOSER_ADDRESS: "0x97a32D4506F6A35De68e0680859cDF41D077a9a9",
    GOVERNOR_PROXY: govBscmainnetContracts.addresses.GovernorBravoDelegator,
    NORMAL_TIMELOCK: govBscmainnetContracts.addresses.NormalTimelock,
    ETH_CHAINLINK_FEED: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
    USDT_CHAINLINK_FEED: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
    CHAINLINK_ORACLE: oracleBscmainnetContracts.addresses.ChainlinkOracle,
    COMPTROLLER_LENS: bscmainnetDeployedContracts.addresses.ComptrollerLens,
    GENERIC_TEST_USER_ACCOUNT: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    XVS_VAULT_PROXY: bscmainnetDeployedContracts.addresses.XVSVaultProxy,
    XVS: bscmainnetDeployedContracts.addresses.XVS,
    VAI_UNITROLLER: bscmainnetDeployedContracts.addresses.VaiUnitroller,
    VAI_MINT_USER_ACCOUNT: "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc",
    UNITROLLER: bscmainnetDeployedContracts.addresses.Unitroller,
    VAI: bscmainnetDeployedContracts.addresses.VAI,
    VTREASURY: bscmainnetDeployedContracts.addresses.VTreasury,
    POOL_REGISTRY: ilBscmainnetDeployedContracts.addresses.PoolRegistry,
    BINANCE_ORACLE: oracleBscmainnetContracts.addresses.BinanceOracle,
    RESILIENT_ORACLE: oracleBscmainnetContracts.addresses.ResilientOracle,
  },
  bsctestnet: {
    DEFAULT_PROPOSER_ADDRESS: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    GOVERNOR_PROXY: govBsctestnetContracts.addresses.GovernorBravoDelegator,
    NORMAL_TIMELOCK: govBsctestnetContracts.addresses.NormalTimelock,
    ETH_CHAINLINK_FEED: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
    USDT_CHAINLINK_FEED: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
    CHAINLINK_ORACLE: oracleBsctestnetContracts.addresses.ChainlinkOracle,
    COMPTROLLER_LENS: bsctestnetDeployedContracts.addresses.ComptrollerLens,
    GENERIC_TEST_USER_ACCOUNT: "0xB7314B8e69DCD32a72aC163679628117E90d3746",
    XVS_VAULT_PROXY: bsctestnetDeployedContracts.addresses.XVSVaultProxy,
    XVS: bsctestnetDeployedContracts.addresses.XVS,
    VAI_UNITROLLER: bsctestnetDeployedContracts.addresses.VaiUnitroller,
    VAI_MINT_USER_ACCOUNT: "0x6eACe20E1F89D0B24e5B295Af1802dfBc730B37D",
    UNITROLLER: bsctestnetDeployedContracts.addresses.Unitroller,
    VAI: bsctestnetDeployedContracts.addresses.VAI,
    VTREASURY: bsctestnetDeployedContracts.addresses.VTreasury,
    POOL_REGISTRY: ilBsctestnetDeployedContracts.addresses.PoolRegistry,
    BINANCE_ORACLE: oracleBsctestnetContracts.addresses.BinanceOracle,
    RESILIENT_ORACLE: oracleBsctestnetContracts.addresses.ResilientOracle,
  },
  ethereum: {
    NORMAL_TIMELOCK: "0x285960C5B22fD66A736C7136967A3eB15e93CC67", // Ethereum Multisig
    GUARDIAN: "0x285960C5B22fD66A736C7136967A3eB15e93CC67",
    VTREASURY: ethereumDeployedContracts.addresses.VTreasuryV8,
    POOL_REGISTRY: ilEthereumDeployedContracts.addresses.PoolRegistry,
    RESILIENT_ORACLE: oracleEthereumContracts.addresses.ResilientOracle,
    XVS: tokenBridgeEthereumContracts.addresses.XVS,
    XVS_VAULT_PROXY: ethereumDeployedContracts.addresses.XVSVaultProxy,
    GENERIC_TEST_USER_ACCOUNT: "0x700E5E41Ee18455540256C4e6F055a4CE9BdBd7C", // XVS Holder
    CHAINLINK_ORACLE: oracleEthereumContracts.addresses.ChainlinkOracle,
  },
  sepolia: {
    NORMAL_TIMELOCK: "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB", // Sepolia Multisig
    GUARDIAN: "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB",
    CHAINLINK_ORACLE: oracleSepoliaContracts.addresses.ChainlinkOracle,
    RESILIENT_ORACLE: oracleSepoliaContracts.addresses.ResilientOracle,
    REDSTONE_ORACLE: oracleSepoliaContracts.addresses.RedStoneOracle,
    XVS: tokenBridgeSepoliaContracts.addresses.XVS,
    POOL_REGISTRY: ilSepoliaDeployedContracts.addresses.PoolRegistry,
    VTREASURY: sepoliaDeployedContracts.addresses.VTreasuryV8,
    XVS_VAULT_PROXY: sepoliaDeployedContracts.addresses.XVSVaultProxy,
    GENERIC_TEST_USER_ACCOUNT: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  },
  opbnbtestnet: {
    NORMAL_TIMELOCK: "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf",
    GUARDIAN: "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf",
    XVS: tokenBridgeOpbnbtestnetContracts.addresses.XVS,
    XVS_VAULT_PROXY: opbnbtestnetDeployedContracts.addresses.XVSVaultProxy,
    GENERIC_TEST_USER_ACCOUNT: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    POOL_REGISTRY: "0x560eA4e1cC42591E9f5F5D83Ad2fd65F30128951",
    RESILIENT_ORACLE: "0xEF4e53a9A4565ef243A2f0ee9a7fc2410E1aA623",
    VTREASURY: "0x3370915301E8a6A6baAe6f461af703e2498409F3",
    BINANCE_ORACLE: "0x496B6b03469472572C47bdB407d5549b244a74F2",
    vWBNB_CORE: "0xD36a31AcD3d901AeD998da6E24e848798378474e",
  },
  opbnbmainnet: {
    NORMAL_TIMELOCK: "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207",
    GUARDIAN: "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207",
    XVS: tokenBridgeOpbnbmainnetContracts.addresses.XVS,
    XVS_VAULT_PROXY: opbnbmainnetDeployedContracts.addresses.XVSVaultProxy,
    GENERIC_TEST_USER_ACCOUNT: "0xa258a693A403b7e98fd05EE9e1558C760308cFC7",
    POOL_REGISTRY: "0x345a030Ad22e2317ac52811AC41C1A63cfa13aEe",
    RESILIENT_ORACLE: "0x8f3618c4F0183e14A218782c116fb2438571dAC9",
    VTREASURY: "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52",
    BINANCE_ORACLE: "0xB09EC9B628d04E1287216Aa3e2432291f50F9588",
  },
  arbitrumsepolia: {
    NORMAL_TIMELOCK: "0x1426A5Ae009c4443188DA8793751024E358A61C2", // arbitrumsepolia Multisig
    GUARDIAN: "0x1426A5Ae009c4443188DA8793751024E358A61C2",
    CHAINLINK_ORACLE: "0xeDd02c7FfA31490b4107e8f2c25e9198a04F9E45",
    RESILIENT_ORACLE: "0x6708bAd042916B47311c8078b29d7f432342102F",
    XVS: "0x877Dc896e7b13096D3827872e396927BbE704407",
    XVS_VAULT_PROXY: "0x407507DC2809D3aa31D54EcA3BEde5C5c4C8A17F",
    GENERIC_TEST_USER_ACCOUNT: "0x6f057A858171e187124ddEDF034dAc63De5dE5dB",
    POOL_REGISTRY: "0xf93Df3135e0D555185c0BC888073374cA551C5fE",
    VTREASURY: "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB",
    GENERIC_TEST_USER_ACCOUNT: "0x6f057A858171e187124ddEDF034dAc63De5dE5dB",
  },
  arbitrumone: {
    NORMAL_TIMELOCK: "0x14e0E151b33f9802b3e75b621c1457afc44DcAA0", // arbitrumone Multisig
    GUARDIAN: "0x14e0E151b33f9802b3e75b621c1457afc44DcAA0",
    CHAINLINK_ORACLE: "0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113", // sequencer chainlink oracle
    RESILIENT_ORACLE: "0xd55A98150e0F9f5e3F6280FC25617A5C93d96007",
    REDSTONE_ORACLE: "0xF792C4D3BdeF534D6d1dcC305056D00C95453dD6",
  },
};
