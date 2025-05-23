import { connect, disconnect } from '@stacks/connect';
import { useCallback, useState } from 'react';
import Transfer from './Transfer';


function App() {
  const [pubkey, setPubkey] = useState(localStorage.getItem('stacks-pubkey'));

  const onConnectClick = useCallback(async () => {
    const { addresses } = await connect();
    const publicKey = addresses.find(x => x.symbol === 'STX')!.publicKey;
    setPubkey(publicKey);
    localStorage.setItem('stacks-pubkey', publicKey);
  }, [setPubkey]);

  const onDisconnectClick = useCallback(() => {
    disconnect();
    localStorage.removeItem('stacks-pubkey');
    setPubkey(null);
  }, [setPubkey]);

  if (!pubkey) {
    return <>
      <button onClick={onConnectClick}>Connect Wallet</button>
    </>
  }

  return (
    <>
      <p>
        <button onClick={onDisconnectClick}>Disconnect</button>
      </p>
      <hr />
      <Transfer pubkey={pubkey} />
    </>
  )
}

export default App;
