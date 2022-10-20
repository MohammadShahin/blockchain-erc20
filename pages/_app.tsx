import '../styles/globals.css'
import { WagmiConfig, createClient } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { getDefaultProvider } from 'ethers'
import { chain } from 'wagmi'
import { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'


const provider = getDefaultProvider(chain.goerli.id)

const client = createClient({
  autoConnect: false,
  connectors: [
    new MetaMaskConnector({
      chains: [chain.goerli],
      options: {
        shimDisconnect: true,
      },
    }),
  ],
  provider,
})

function MyApp({ Component, pageProps }: AppProps) {
  return <WagmiConfig client={client}>
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  </WagmiConfig>
}

export default MyApp
