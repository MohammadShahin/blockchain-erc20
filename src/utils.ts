
import { Signer, ethers } from 'ethers'

export const deployContract = async (contractABI: any, bytecode: string, signer: Signer) => {
    const factory = new ethers.ContractFactory(contractABI, bytecode, signer);
    const contract = await factory.deploy();
    await contract.deployed()
    return contract
}

export const min = (a: number, b: number) => {
    if (a < b) return a
    return b
}

export const toFloat = (num: number | BigInt | string, decimals: number) => {
    const newNum = num.toString()
    const ret = parseFloat(newNum) / Math.pow(10, decimals)
    return ret;
}


