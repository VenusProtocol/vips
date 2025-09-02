import Safe, { ContractNetworksConfig, EthersAdapter } from "@safe-global/protocol-kit";
import { SafeTransactionOptionalProps } from "@safe-global/protocol-kit";
import { MetaTransactionData, OperationType, SafeTransaction } from "@safe-global/safe-core-sdk-types";
import { ethers, network } from "hardhat";
import { Proposal, SUPPORTED_NETWORKS } from "src/types";

import { NETWORK_ADDRESSES } from "../networkAddresses";

const DEFAULT_OPERATION = OperationType.Call; // Call

export const loadMultisigTx = async (multisigVipPath: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vip = require(`../../multisig/proposals/${multisigVipPath}`).default;
  return vip();
};

export const getSafeAddress = (networkName: SUPPORTED_NETWORKS): string => {
  return NETWORK_ADDRESSES[networkName].GUARDIAN;
};

export const buildMultiSigTx = async (proposal: Proposal): Promise<MetaTransactionData[]> => {
  const { signatures, targets, params, values, data } = proposal;
  const safeTransactionData: MetaTransactionData[] = [];
  for (let i = 0; i < signatures.length; ++i) {
    let callData;

    if (data && data[i] != "") {
      callData = data[i];
    } else {
      const abi = new ethers.utils.Interface([`function ${signatures[i]}`]);
      callData = abi.encodeFunctionData(signatures[i], params[i]);
    }

    const safeTxData: MetaTransactionData = {
      to: targets[i],
      data: callData,
      value: values[i].toString(),
      operation: DEFAULT_OPERATION,
    };

    safeTransactionData.push(safeTxData);
  }
  return safeTransactionData;
};

export const createGnosisTx = async (
  ethAdapter: EthersAdapter,
  safeSdk: Safe,
  multisigVipPath: string,
  onlyCalls?: boolean,
  options?: SafeTransactionOptionalProps,
): Promise<SafeTransaction> => {
  const proposal = await loadMultisigTx(multisigVipPath);

  const safeTransactionData = await buildMultiSigTx(proposal);

  return await safeSdk.createTransaction({ safeTransactionData, onlyCalls, options });
};

export const getContractNetworks = (chainId: number): ContractNetworksConfig => {
  // Define contract addresses for different networks here
  const networks: Record<string, ContractNetworksConfig> = {
    // Sepolia network
    sepolia: {
      [chainId]: {
        safeMasterCopyAddress: "0x42f9B1A23193465A4049DA3af93f9faBF3054951",
        safeProxyFactoryAddress: "0x4cEeffCE2e51cFaD71bF23C816756b9D789395cC",
        multiSendAddress: "0xE4BDFeD788718f1FA72C249e100B21eAE5a549e4",
        multiSendCallOnlyAddress: "0x028664f9c577698Ae250cAA51ADC22377B03ec4A",
        fallbackHandlerAddress: "0x1259Aa9FaCd0feFB5a91da65682C7EDD51608D4b",
        signMessageLibAddress: "0xaF838B48F16728169E78985Cc8eB1bda25D75B29",
        createCallAddress: "0x6B95D96C78F6433992A5F81aEcF82bAE449016Df",
        simulateTxAccessorAddress: "0x249b0178432e34320D7d30A4A9699cAf23Bcf04c",
      },
    },
    opbnbtestnet: {
      [chainId]: {
        safeMasterCopyAddress: "0xE2CF742b554F466d5E7a37C371FD47C786d2FBc0",
        safeProxyFactoryAddress: "0x9fea7F7C69f14aa1a7d62cC9D468fEB2F9371CB3",
        multiSendAddress: "0xDeB0467cCfAda493902C8D279A2F41f26b813AC9",
        multiSendCallOnlyAddress: "0xC33224E130C702808e12299eCaBC16148a5B3d0B",
        fallbackHandlerAddress: "0x40B30946045a876ffD68CaF008f94eeAAD50F855",
        signMessageLibAddress: "0x6ACe153bF757b4999c7D6f0F3dFb1043dC67d61a",
        createCallAddress: "0x392e2F66c3BBF0046c861e0065fB7C7917b18078",
        simulateTxAccessorAddress: "0xd77D8020bEa6Aad4f5D636b1EB1FB3B9d08bbb7F",
      },
    },
    arbitrumsepolia: {
      [chainId]: {
        safeMasterCopyAddress: "0xc40483C21728BF342e4C0d1Ca693AdDC6c0b6dbA",
        safeProxyFactoryAddress: "0x9E52EFCAD3db5191B4Cb69CaBdCe4F356119F8d8",
        multiSendAddress: "0x6B02AbB69337C8dF8Ad312D6c5C2D58711736a36",
        multiSendCallOnlyAddress: "0x50542C494932F79FcB15Ab0e25CA08BB8610b03f",
        fallbackHandlerAddress: "0xE0C5C79D9CB5Bfa096b10396B1AE9FbBFc860fA6",
        signMessageLibAddress: "0x37942Af543F6E8E8e8E2784fb3C989c957FE4097",
        createCallAddress: "0xD79AcAdDC21A2e7A9D15Fff711Ec47def7259DD3",
        simulateTxAccessorAddress: "0xd55A98150e0F9f5e3F6280FC25617A5C93d96007",
      },
    },
    zksyncsepolia: {
      [chainId]: {
        safeMasterCopyAddress: "0x3844DF536332845c0df8E9DD99dD7f21c9B6A271",
        safeProxyFactoryAddress: "0xC0EbF369B02BcE19E2CB8B78BFee8E4DeB1B99fE",
        multiSendAddress: "0xb740cb884da1549e82Ae3aB3a3586a4a7c012819",
        multiSendCallOnlyAddress: "0x489a3314b2D4e448E1B26AaCdFEde47ba97a7668",
        fallbackHandlerAddress: "0x5351c28B5Cac1014Eddc49735EE5F75aBA23C1dd",
        signMessageLibAddress: "0x219f9a7E2cB8f956D1e619FCa50d98B574d02223",
        createCallAddress: "0x6ec92E280fB7eF8bdbB3d64612Eb7485Ec4aFB45",
        simulateTxAccessorAddress: "0x4F8ce5F350E57419F68732f1F15D761044239B8b",
      },
    },
    opsepolia: {
      [chainId]: {
        safeMasterCopyAddress: "0xe1Ed13Dd60b85a072401a3C4Fc7d2EaA678092F8",
        safeProxyFactoryAddress: "0xf509dB5de5e01ce6e29EAaF8301981DE3C4c7cda",
        multiSendAddress: "0x0A941df0A84634098abE04f52037c7Fb05C2dEd7",
        multiSendCallOnlyAddress: "0x2694246B72e40a72B0F9137A9A0a9e818775B4dc",
        fallbackHandlerAddress: "0x4f85CF627f6106FFDB72aBee57f143C61b6aEcA2",
        signMessageLibAddress: "0xe5A8983525b0dC8757C47eD001C22ADB003ae372",
        createCallAddress: "0xFf17bb26b8B702b698FE3De40C10d430742C9F47",
        simulateTxAccessorAddress: "0xe7A7552B0Cff45E837e1422b479d2dEDE748f571",
      },
    },
    basesepolia: {
      [chainId]: {
        safeMasterCopyAddress: "0xD189759699F85d42d32d825e500DEdD44396B269",
        safeProxyFactoryAddress: "0xD769885563414753C62864fE7fC07522aa764937",
        multiSendAddress: "0x228a04A59BEF23106Bcb2b4158422baAC60646Ce",
        multiSendCallOnlyAddress: "0x50cafDD5E439994509202CfCd569DcA7E1fd9659",
        fallbackHandlerAddress: "0xDC1336f9E6488cD03b533449ea723cE32f2B1Ff3",
        signMessageLibAddress: "0x8fcB4617eae6261Cea37e629244AA2A4d92940d1",
        createCallAddress: "0xB22D635D552eC95142E2Abe3FfB859eA7d7C0316",
        simulateTxAccessorAddress: "0x38710E559A67ef07bcF8EeA70B076ac8e756DE08",
      },
    },
    unichainsepolia: {
      [chainId]: {
        safeMasterCopyAddress: "0xe336a5962Ab178E2856BEd37230777BF551302fE",
        safeProxyFactoryAddress: "0xCE103033E5341a0830e6971DD61deb18b237E54B",
        multiSendAddress: "0xd58De9D288831482346fA36e6bdc16925d9cFC85",
        multiSendCallOnlyAddress: "0x4873593fC8e788eFc06287327749fdDe08C0146b",
        fallbackHandlerAddress: "0x76D20797A41Da59Df96a6726F2c7D365b84be9Ac",
        signMessageLibAddress: "0xDB94695bB4E974adfCD116351aF427937AD3a4b5",
        createCallAddress: "0x474761AC5c317d93B76d8dc5388A9F38B5412E2C",
        simulateTxAccessorAddress: "0xf95b731E477c3d16c3C68E7c9c766CBf6E190D49",
      },
    },
    ethereum: {
      // v1.3.0
      [chainId]: {
        safeMasterCopyAddress: "0x3E5c63644E683549055b9Be8653de26E0B4CD36E",
        safeProxyFactoryAddress: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
        multiSendAddress: "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761",
        multiSendCallOnlyAddress: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
        fallbackHandlerAddress: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        signMessageLibAddress: "0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2",
        createCallAddress: "0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4",
        simulateTxAccessorAddress: "0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da",
      },
    },
    opbnbmainnet: {
      // v1.3.0
      [chainId]: {
        safeMasterCopyAddress: "0xe2cf742b554f466d5e7a37c371fd47c786d2fbc0",
        safeProxyFactoryAddress: "0x9fea7f7c69f14aa1a7d62cc9d468feb2f9371cb3",
        multiSendAddress: "0xdeb0467ccfada493902c8d279a2f41f26b813ac9",
        multiSendCallOnlyAddress: "0xc33224e130c702808e12299ecabc16148a5b3d0b",
        fallbackHandlerAddress: "0x40b30946045a876ffd68caf008f94eeaad50f855",
        signMessageLibAddress: "0x6ace153bf757b4999c7d6f0f3dfb1043dc67d61a",
        createCallAddress: "0x392e2f66c3bbf0046c861e0065fb7c7917b18078",
        simulateTxAccessorAddress: "0x3fa429e8feb5ea46cea2f435b1c0f60890c02483",
      },
    },
    arbitrumone: {
      // v1.3.0
      [chainId]: {
        safeMasterCopyAddress: "0x3E5c63644E683549055b9Be8653de26E0B4CD36E",
        safeProxyFactoryAddress: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
        multiSendAddress: "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761",
        multiSendCallOnlyAddress: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
        fallbackHandlerAddress: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        signMessageLibAddress: "0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2",
        createCallAddress: "0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4",
        simulateTxAccessorAddress: "0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da",
      },
    },
    zksyncmainnet: {
      // v1.3.0
      [chainId]: {
        safeMasterCopyAddress: "0x1727c2c531cf966f902E5927b98490fDFb3b2b70",
        safeProxyFactoryAddress: "0xDAec33641865E4651fB43181C6DB6f7232Ee91c2",
        multiSendAddress: "0x0dFcccB95225ffB03c6FBB2559B530C2B7C8A912",
        multiSendCallOnlyAddress: "0xf220d3b4dfb23c4ade8c88e526c1353abacbc38f",
        fallbackHandlerAddress: "0x2f870a80647BbC554F3a0EBD093f11B4d2a7492A",
        signMessageLibAddress: "0x357147caf9C0cCa67DfA0CF5369318d8193c8407",
        createCallAddress: "0xcB8e5E438c5c2b45FbE17B02Ca9aF91509a8ad56",
        simulateTxAccessorAddress: "0x4191E2e12E8BC5002424CE0c51f9947b02675a44",
      },
    },
    opmainnet: {
      // v1.3.0
      [chainId]: {
        safeMasterCopyAddress: "0xfb1bffC9d739B8D520DaF37dF666da4C687191EA",
        safeProxyFactoryAddress: "0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC",
        multiSendAddress: "0x998739BFdAAdde7C933B942a68053933098f9EDa",
        multiSendCallOnlyAddress: "0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B",
        fallbackHandlerAddress: "0x017062a1dE2FE6b99BE3d9d37841FeD19F573804",
        signMessageLibAddress: "0x98FFBBF51bb33A056B08ddf711f289936AafF717",
        createCallAddress: "0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d",
        simulateTxAccessorAddress: "0x727a77a074D1E6c4530e814F89E618a3298FC044",
      },
    },
    basemainnet: {
      // v1.4.1
      [chainId]: {
        safeMasterCopyAddress: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
        safeProxyFactoryAddress: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
        multiSendAddress: "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526",
        multiSendCallOnlyAddress: "0x9641d764fc13c8B624c04430C7356C1C7C8102e2",
        fallbackHandlerAddress: "0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99",
        signMessageLibAddress: "0xd53cd0aB83D845Ac265BE939c57F53AD838012c9",
        createCallAddress: "0x9b35Af71d77eaf8d7e40252370304687390A1A52",
        simulateTxAccessorAddress: "0x3d4BA2E0884aa488718476ca2FB8Efc291A46199",
      },
    },
    unichainmainnet: {
      // v1.4.1
      [chainId]: {
        safeMasterCopyAddress: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
        safeProxyFactoryAddress: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
        multiSendAddress: "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526",
        multiSendCallOnlyAddress: "0x9641d764fc13c8B624c04430C7356C1C7C8102e2",
        fallbackHandlerAddress: "0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99",
        signMessageLibAddress: "0xd53cd0aB83D845Ac265BE939c57F53AD838012c9",
        createCallAddress: "0x9b35Af71d77eaf8d7e40252370304687390A1A52",
        simulateTxAccessorAddress: "0x3d4BA2E0884aa488718476ca2FB8Efc291A46199",
      },
    },
    // Add more networks as needed, taking into account the version of the Safe wallet
    // Safe addresses on mainnets: https://docs.safe.global/advanced/smart-account-supported-networks
  };

  if (network.name in networks) {
    return networks[network.name];
  } else {
    throw new Error(`Network ${network.name} is not supported.`);
  }
};
