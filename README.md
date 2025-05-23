# Stacks -> Sui Axelar Bridge POC UI

- Connects to stacks.js ✅
- Builds an ITS transaction to send that token, doing everything necessary in advance, like approvals ✅
- Estimates gas to pay to the Axelar relayer 🚧
    - This one depends on AxelarSDK and will be possible when they merge this PR: https://github.com/axelarnetwork/axelarjs-sdk/pull/358
- Estimates the gas needed to execute on Stacks ✅
- Executes the transaction on chain, paying the ITS token and the gas ✅
- Gives the transaction hash that we can use to look up in block explorers later ✅


## Useful links
- Leather wallet: https://leather.io/
- Stacks explorer: https://explorer.hiro.so/?chain=testnet
- Testnet faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet

## Installation

`$ npm install`

`$ npm run dev`