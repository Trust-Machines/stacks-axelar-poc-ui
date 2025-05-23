import { request } from '@stacks/connect';
import { broadcastTransaction, deserializeTransaction, makeUnsignedContractCall, Pc, PostConditionMode, principalCV, publicKeyToAddress, stringAsciiCV, tupleCV, uintCV, type UnsignedContractCallOptions } from "@stacks/transactions";
import { bufferFromHex } from "@stacks/transactions/dist/cl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getTokenDecimals, getTokenName, getUserTokenBalance } from "./client/contract-call-read";
import { AXELAR_CONTRACT_DEPLOYER, AXELAR_ITS_CONTRACT_IMPL, CROSS_CHAIN_FEE_STX, ITS_TOKEN_ID, NETWORK, SUI_AXELAR_CHAIN_ID, TOKEN, TOKEN_MANAGER } from "./constants";
import { formatUnits, parseUnits } from "./units";


const Transfer = ({ pubkey }: { pubkey: string }) => {
    const [name, setName] = useState('');
    const [decimals, setDecimals] = useState(0);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('0.01');
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(false);
    const [txid, setTxid] = useState('');

    console.log(name)

    const address = useMemo(() => publicKeyToAddress(pubkey, NETWORK), [pubkey]);
    const formatted = useMemo(() => formatUnits(balance, decimals), [balance, decimals]);

    useEffect(() => {
        const load = () => {
            getTokenName(TOKEN, address).then((r) => {
                setName(r);
                return getTokenDecimals(TOKEN, address);
            }).then(r => {
                setDecimals(r);
                return getUserTokenBalance(TOKEN, address);
            }).then(r => {
                setBalance(r)
            }).finally(() => {
                setLoading(false)
            });
        }

        const timer = setTimeout(load, 200);
        return () => clearTimeout(timer);
    }, [address, setName, setDecimals, setBalance, setLoading]);

    const onRecipientChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setRecipient(e.target.value);
    }, [setRecipient]);

    const onAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    }, [setAmount]);

    const onMaxClicked = useCallback(() => {
        setAmount(formatted.toString())
    }, [setAmount, formatted]);

    const onTransferClick = useCallback(async () => {
        setError('');
        setProgress(false);
        setTxid('');

        if (recipient.trim() === '') {
            setError('Enter recipient')
            return;
        }

        const parsed = parseUnits(amount, decimals);
        if (isNaN(parsed) || parsed < 1) {
            setError('Invalid amount')
            return;
        }

        if (parsed > balance) {
            setError('Insufficient balance')
            return;
        }

        const txOptions: UnsignedContractCallOptions = {
            contractAddress: AXELAR_CONTRACT_DEPLOYER,
            contractName: "interchain-token-service",
            functionName: "interchain-transfer",
            functionArgs: [
                principalCV(`${AXELAR_CONTRACT_DEPLOYER}.gateway-impl`),
                principalCV(`${AXELAR_CONTRACT_DEPLOYER}.gas-impl`),
                principalCV(AXELAR_ITS_CONTRACT_IMPL),
                principalCV(TOKEN_MANAGER),
                principalCV(TOKEN),
                bufferFromHex(ITS_TOKEN_ID),
                stringAsciiCV(SUI_AXELAR_CHAIN_ID),
                bufferFromHex(recipient),
                uintCV(parsed),
                tupleCV({ data: bufferFromHex(""), version: uintCV(0) }),
                uintCV(CROSS_CHAIN_FEE_STX), // TODO: 1 STX for paying cross chain fee, need to use AxelarSDK to calculate
            ],
            postConditions: [
                Pc.principal(address).willSendEq(CROSS_CHAIN_FEE_STX).ustx(),
                Pc.principal(address).willSendEq(parsed).ft(TOKEN, TOKEN.split(".")[1]),
            ],
            postConditionMode: PostConditionMode.Deny,
            network: NETWORK,
            publicKey: pubkey,
            // fee: 1_00000 // Pass a custom fee if needed. otherwise the wallet will take care of it.
        };

        let unsigned;
        let signed;
        let resp;
        setProgress(true);

        try {
            unsigned = await makeUnsignedContractCall(txOptions);
            signed = await request("stx_signTransaction", {
                transaction: unsigned.serialize()
            });

            resp = await broadcastTransaction({ transaction: deserializeTransaction(signed.transaction), network: NETWORK })
        } catch (e) {
            setError(String(e));
            return;
        } finally {
            setProgress(false);
        }

        if ('reason' in resp) {
            setError(resp.reason);
            return;
        }

        setTxid(resp.txid);
    }, [recipient, amount, decimals, setError, setProgress, setTxid]);

    if (loading) {
        return <><progress /></>;
    }

    return <>
        <table width={500}>
            <tbody>
                <tr>
                    <td width={100}>Sender</td>
                    <td><input style={{ width: '100%' }} type="text" value={address} readOnly={true} /></td>
                </tr>
                <tr>
                    <td width={100}>Recipient</td>
                    <td><input style={{ width: '100%' }} type="text" placeholder="SUI Address" value={recipient} onChange={onRecipientChange} autoFocus /></td>
                </tr>
                <tr>
                    <td>{name} amount:</td>
                    <td><input style={{ width: '100%' }} type="text" placeholder="Enter amount" value={amount} onChange={onAmountChange} /></td>
                </tr>
                <tr>
                    <td></td>
                    <td>balance: {formatted} <span style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }} onClick={onMaxClicked}>max</span></td>
                </tr>
                <tr>
                    <td></td>
                    <td><button onClick={onTransferClick} disabled={progress}>transfer</button></td>
                </tr>
                {error &&
                    <tr>
                        <td></td>
                        <td style={{ color: 'red' }}>{error}</td>
                    </tr>
                }
            </tbody>
        </table>
        {txid &&
            <p>
                ✅  <a href={`https://explorer.hiro.so/txid/${txid}?chain=${NETWORK}`} rel="noopener noreferrer" target="blank">{txid}</a>
            </p>
        }
    </>
}

export default Transfer;