import { cvToJSON, fetchCallReadOnlyFunction, principalCV } from "@stacks/transactions";
import { NETWORK } from "../constants";

export const getTokenName = (tokenAddress: string, sender: string) => {
    const [contractAddress, contractName] = tokenAddress.split('.');
    return fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-name',
        functionArgs: [],
        senderAddress: sender,
        network: NETWORK
    }).then(r => cvToJSON(r).value.value)
}

export const getTokenSymbol = (tokenAddress: string, sender: string) => {
    const [contractAddress, contractName] = tokenAddress.split('.');
    return fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-symbol',
        functionArgs: [],
        senderAddress: sender,
        network: NETWORK
    }).then(r => cvToJSON(r).value.value)
}

export const getTokenDecimals = (tokenAddress: string, sender: string) => {
    const [contractAddress, contractName] = tokenAddress.split('.');
    return fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-decimals',
        functionArgs: [],
        senderAddress: sender,
        network: NETWORK
    }).then(r => Number(cvToJSON(r).value.value))
}

export const getUserTokenBalance = (tokenAddress: string, address: string) => {
    const [contractAddress, contractName] = tokenAddress.split('.');
    return fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-balance',
        functionArgs: [
            principalCV(address)
        ],
        senderAddress: address,
        network: NETWORK
    }).then(r => Number(cvToJSON(r).value.value))
}