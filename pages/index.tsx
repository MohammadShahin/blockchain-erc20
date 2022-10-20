import Head from 'next/head'
import React from 'react'
import styles from '../styles/Home.module.css'
import { useAccount, useConnect, useDisconnect, useContract, useSigner } from 'wagmi'
// import { calculatorAbi } from '../src/abi'
import { Contract, ethers } from 'ethers'
import { useToast, Button, Input, Text, Flex, Box, Heading, NumberInput, NumberInputField } from '@chakra-ui/react'
import { min, toFloat } from '../src/utils'
import { abi, tokenAddress } from '../src/constants'

const maxChar = 50;

export default function Home() {

  // Wagmi
  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Token metadata
  const contract = useContract({ address: tokenAddress, abi: abi, signerOrProvider: signer })
  const [currentHolders, setCurrentHolders] = React.useState<string[]>([])
  const [tokenName, setTokenName] = React.useState<string>()
  const [tokenSymbol, setTokenSymbol] = React.useState<string>()
  const [totalSupply, setTotalSupply] = React.useState<number>()
  const [tokenDecimals, setTokenDecimals] = React.useState<number>()

  // Token logic
  // transfer
  const [transferAddress, setTransferAddress] = React.useState<string>()
  const [transferValue, setTransferValue] = React.useState<string>()
  // transfer from
  const [transferFromOwner, setTransferFromOwner] = React.useState<string>()
  const [transferFromBuyer, setTransferFromBuyer] = React.useState<string>()
  const [transferFromValue, setTransferFromValue] = React.useState<string>()
  // approve
  const [approveAddress, setApproveAddress] = React.useState<string>()
  const [approveValue, setApproveValue] = React.useState<string>()
  // allowance
  const [allowanceOwner, setAllowanceOwner] = React.useState<string>()
  const [allowanceDelegate, setAllowanceDelegate] = React.useState<string>()
  const [allowanceValue, setAllowanceValue] = React.useState<string>()
  // balance of
  const [balanceOfAddress, setBalanceOfAddress] = React.useState<string>()
  const [balanceOfValue, setBalanceOfValue] = React.useState<string>()

  // UI
  const toast = useToast()

  React.useEffect(() => {
    const updateTokenDetails = async () => {
      if (contract && isConnected) {
        const promises = [contract.name(), contract.symbol(), contract.totalSupply(), contract.decimals()]
        const promisesResult = await Promise.allSettled(promises)
        let decimals;
        if (promisesResult[0].status === 'fulfilled') {
          setTokenName(promisesResult[0].value)
        }
        if (promisesResult[1].status === 'fulfilled') {
          setTokenSymbol(promisesResult[1].value)
        }
        if (promisesResult[3].status === 'fulfilled') {
          decimals = promisesResult[3].value
          setTokenDecimals(parseInt(promisesResult[3].value))
        }
        if (promisesResult[2].status === 'fulfilled') {
          setTotalSupply(parseInt(promisesResult[2].value) / Math.pow(10, decimals))
        }
      }
    }
    updateTokenDetails()
  }, [contract])

  React.useEffect(() => {
    if (contract && isConnected)
      handleUpdateCurrentHolders()
  }, [contract])

  React.useEffect(() => {
    disconnect()
  }, [])

  const func = async () => {
    try {
      if (!contract) throw new Error("Contract is not provided");

      const tx = await contract.enter({ value: ethers.utils.parseEther("0.011") })
      await tx.wait()
      handleUpdateCurrentHolders()
    }
    catch (e) {
      let _errorMessage = '';
      if (typeof e === "string") {
        _errorMessage = e.toUpperCase()
      } else if (e instanceof Error) {
        _errorMessage = e.message // works, `e` narrowed to Error
      }

      toast({
        title: 'Entering lottery failed.',
        description: `Failure message: ${_errorMessage.slice(0, min(maxChar, _errorMessage.length))}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleUpdateCurrentHolders = async () => {
    if (!contract) return
    const allTimeHolders = await contract.getAllTimeHolder()
    console.log(allTimeHolders)
    const newCurrentHolders: string[] = []
    await Promise.all(allTimeHolders.map(async (address: string) => {
      const addressBalance = await contract.balanceOf(address)
      if (addressBalance > 0) newCurrentHolders.push(address)
    }))

    setCurrentHolders(newCurrentHolders)
  }

  const handleTransfer = async () => {
    try {
      if (!contract) throw Error("The contract is not initialized")
      if (!transferValue) throw Error("The transfer value is not initialized")
      if (!transferAddress) throw Error("The transfer address is not initialized")
      const _transferValue = ethers.utils.parseUnits(transferValue, tokenDecimals)
      const tx = await contract.transfer(transferAddress, _transferValue)
      await tx.wait()
      handleUpdateCurrentHolders()
    } catch (e) {
      let _errorMessage = "";
      if (typeof e === "string") {
        _errorMessage = e.toUpperCase()
      } else if (e instanceof Error) {
        _errorMessage = e.message // works, `e` narrowed to Error
      }

      toast({
        title: 'Error in picking winner.',
        description: `Failure message: ${_errorMessage.slice(0, min(maxChar, _errorMessage.length))}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleTransferFrom = async () => {
    try {
      if (!contract) throw Error("The contract is not initialized")
      if (!transferFromValue) throw Error("The transfer value is not initialized")
      if (!transferFromOwner) throw Error("The transfer value is not initialized")
      if (!transferFromBuyer) throw Error("The transfer value is not initialized")
      const _transferFromValue = ethers.utils.parseUnits(transferFromValue, tokenDecimals)
      const tx = await contract.transferFrom(transferFromOwner, transferFromBuyer, _transferFromValue)
      await tx.wait()
      handleUpdateCurrentHolders()
    } catch (e) {
      let _errorMessage = "";
      if (typeof e === "string") {
        _errorMessage = e.toUpperCase()
      } else if (e instanceof Error) {
        _errorMessage = e.message // works, `e` narrowed to Error
      }

      toast({
        title: 'Error in picking winner.',
        description: `Failure message: ${_errorMessage.slice(0, min(maxChar, _errorMessage.length))}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleApprove = async () => {
    try {
      if (!contract) throw Error("The contract is not initialized")
      if (!approveAddress) throw Error("The approve delegate is not initialized")
      if (!approveValue) throw Error("The approve value is not initialized")
      const _approveValue = ethers.utils.parseUnits(approveValue, tokenDecimals)
      const tx = await contract.approve(approveAddress, _approveValue)
      await tx.wait()
      handleUpdateCurrentHolders()
    } catch (e) {
      let _errorMessage = "";
      if (typeof e === "string") {
        _errorMessage = e.toUpperCase()
      } else if (e instanceof Error) {
        _errorMessage = e.message // works, `e` narrowed to Error
      }

      toast({
        title: 'Error in picking winner.',
        description: `Failure message: ${_errorMessage.slice(0, min(maxChar, _errorMessage.length))}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleAllowance = async () => {
    try {
      if (!contract) throw Error("The contract is not initialized")
      if (!allowanceOwner) throw Error("The allowance owner is not initialized")
      if (!allowanceDelegate) throw Error("The allowance delegate is not initialized")
      let numTokens = await contract.allowance(allowanceOwner, allowanceDelegate)
      numTokens = ethers.utils.formatUnits(numTokens, tokenDecimals)
      setAllowanceValue(numTokens)
    } catch (e) {
      let _errorMessage = "";
      if (typeof e === "string") {
        _errorMessage = e.toUpperCase()
      } else if (e instanceof Error) {
        _errorMessage = e.message // works, `e` narrowed to Error
      }

      toast({
        title: 'Error in picking winner.',
        description: `Failure message: ${_errorMessage.slice(0, min(maxChar, _errorMessage.length))}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleBalanceOf = async () => {
    try {
      if (!contract) throw Error("The contract is not initialized")
      if (!balanceOfAddress) throw Error("The balance owner is not initialized")
      let numTokens = await contract.balanceOf(balanceOfAddress)
      numTokens = ethers.utils.formatUnits(numTokens, tokenDecimals)
      setBalanceOfValue(numTokens)
    } catch (e) {
      let _errorMessage = "";
      if (typeof e === "string") {
        _errorMessage = e.toUpperCase()
      } else if (e instanceof Error) {
        _errorMessage = e.message // works, `e` narrowed to Error
      }

      toast({
        title: 'Error in picking winner.',
        description: `Failure message: ${_errorMessage.slice(0, min(maxChar, _errorMessage.length))}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }



  return (
    <Box p="0 2rem">
      <Head>
        <title>ERC20 Token</title>
        {/* <meta name="description" content="Generated by create next app" /> */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>

        {isConnected ?
          <React.Fragment>
            <Heading as='h1' fontSize={"4rem"} lineHeight="1.1">
              Welcome to <span className={styles.blue}>Blockchain Lottery</span>
            </Heading>

            <Heading mt='10'>
              The address of the token is <span className={styles.blue}>{tokenAddress}</span>
            </Heading>

            <Text mt='10'>
              The name of the token is <span className={styles.blue}>{tokenName}</span>
              <br />
              The symbol of the token is <span className={styles.blue}>{tokenSymbol}</span>
              <br />
              The total Supply of the token is <span className={styles.blue}>{totalSupply}</span>
              <br />
              The decimals of the token is <span className={styles.blue}>{tokenDecimals}</span>
              <br />
            </Text>

            <Heading mt='10' mb="10">
              Your address: <span className={styles.blue}>{address}</span>
            </Heading>

            <Flex flexDir={'column'} gap="5">
              <Flex flexDir={'row'} gap="5" alignItems='center'>
                <Input placeholder='destination address' type={'text'} value={transferAddress} onChange={(event) => setTransferAddress(event.target.value)} />
                <NumberInput value={transferValue} min={0} onChange={(newVal: string) => setTransferValue(newVal)}>
                  <NumberInputField placeholder='5.3' />
                </NumberInput>
                <Button w={400} onClick={handleTransfer}>Transfer</Button>
              </Flex>

              <Flex flexDir={'row'} gap="5" alignItems='center'>
                <Input placeholder='owner address' type={'text'} value={transferFromOwner} onChange={(event) => setTransferFromOwner(event.target.value)} />
                <Input placeholder='buyer address' type={'text'} value={transferFromBuyer} onChange={(event) => setTransferFromBuyer(event.target.value)} />
                <NumberInput value={transferFromValue} min={0} onChange={(newVal: string) => setTransferFromValue(newVal)}>
                  <NumberInputField placeholder='20.4' />
                </NumberInput>
                <Button w={400} onClick={handleTransferFrom}>Transfer From</Button>
              </Flex>

              <Flex flexDir={'row'} gap="5" alignItems='center'>
                <Input placeholder='delegate address' type={'text'} value={approveAddress} onChange={(event) => setApproveAddress(event.target.value)} />
                <NumberInput value={approveValue} min={0} onChange={(newVal: string) => setApproveValue(newVal)}>
                  <NumberInputField placeholder='19.9' />
                </NumberInput>
                <Button w={400} onClick={handleApprove}>Approve</Button>
              </Flex>

              <Flex flexDir={'column'} gap="5" alignItems='center'>
                <Flex flexDir={'row'} gap="5" alignItems={'center'} >
                  <Input placeholder='owner address' type={'text'} value={allowanceOwner} onChange={(event) => setAllowanceOwner(event.target.value)} />
                  <Input placeholder='delegate address' type={'text'} value={allowanceDelegate} onChange={(event) => setAllowanceDelegate(event.target.value)} />

                  <Button w={400} onClick={handleAllowance}>Get Allowance</Button>
                </Flex>
                {!!allowanceValue &&
                  <Text>
                    Last allowance query result {' '} {allowanceValue}
                  </Text>
                }

              </Flex>


              <Flex flexDir={'column'} gap="5" alignItems='center'>
                <Flex flexDir={'row'} gap="5" alignItems={'center'} >
                  <Input placeholder='owner address' type={'text'} value={balanceOfAddress} onChange={(event) => setBalanceOfAddress(event.target.value)} />

                  <Button w={400} onClick={handleBalanceOf}>Get Balance</Button>
                </Flex>
                {!!balanceOfValue &&
                  <Text>
                    Last &quotbalance of&quot query result {' '} {balanceOfValue}
                  </Text>
                }

              </Flex>

              <Flex flexDir='column' gap={5} alignItems={'center'}>
                <Text>
                  Current Holders
                  <Flex flexDir={'column'}>
                    {currentHolders.map(address => (<Box key={address}>{address}</Box>))}
                  </Flex>
                </Text>

                <Button w={400} onClick={handleUpdateCurrentHolders}>Update</Button>
              </Flex>
            </Flex>
          </React.Fragment>
          :
          <React.Fragment>
            <Heading fontSize={"4rem"} lineHeight="1.1">
              Welcome to <span className={styles.blue}>Blockchain Lottery</span>
            </Heading>
            <Text >
              Please connect to metamask to continue.
            </Text>
            <div className={styles.inputs}>
              <Button onClick={() => {
                connect({ connector: connectors[0] })
              }}>Connect Wallet</Button>
            </div>
          </React.Fragment>}
      </main>
    </Box>
  )
}
