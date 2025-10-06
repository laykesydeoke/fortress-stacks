// Bitcoin Address Encoding Utilities
// For converting Bitcoin addresses to Clarity (version, hashbytes) tuples

import * as bitcoin from 'bitcoinjs-lib';

export interface BitcoinAddressTuple {
  version: number;
  hashbytes: Uint8Array;
}

export interface DepositAddress {
  address: string;
  redeemScript: string;
  reclaimScript: string;
}

/**
 * Convert a Bitcoin address to (version, hashbytes) tuple for Clarity contracts
 * This is required for the sBTC withdrawal contract
 */
export function bitcoinAddressToTuple(address: string, network: 'mainnet' | 'testnet' = 'testnet'): BitcoinAddressTuple {
  try {
    const btcNetwork = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    
    // Try to decode as base58 address first (P2PKH, P2SH)
    try {
      const decoded = bitcoin.address.fromBase58Check(address);
      return {
        version: decoded.version,
        hashbytes: decoded.hash,
      };
    } catch {
      // If base58 fails, try bech32 (P2WPKH, P2WSH, P2TR)
      try {
        const decoded = bitcoin.address.fromBech32(address);
        
        // For bech32 addresses, we need to map the version
        let version: number;
        if (decoded.version === 0) {
          // P2WPKH or P2WSH
          version = decoded.data.length === 20 ? 0x00 : 0x05; // P2WPKH : P2WSH
        } else if (decoded.version === 1) {
          // P2TR (Taproot)
          version = 0x51;
        } else {
          throw new Error(`Unsupported bech32 version: ${decoded.version}`);
        }
        
        return {
          version,
          hashbytes: decoded.data,
        };
      } catch {
        throw new Error(`Invalid Bitcoin address format: ${address}`);
      }
    }
  } catch (error) {
    console.error('Failed to encode Bitcoin address:', error);
    throw new Error(`Failed to encode Bitcoin address: ${address}`);
  }
}

/**
 * Generate a taproot deposit address for sBTC deposits
 * This creates the special address that users send BTC to for minting sBTC
 */
export function generateDepositAddress(
  stacksAddress: string,
  signersPublicKey: string,
  reclaimPublicKey: string,
  network: 'mainnet' | 'testnet' = 'testnet'
): DepositAddress {
  try {
    const btcNetwork = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    
    // For now, we'll create a simple deposit address
    // In a full implementation, this would involve complex taproot script construction
    // Based on the sBTC protocol specifications
    
    // This is a simplified version - in production you'd use the actual sBTC SDK
    const depositScript = `OP_DUP OP_HASH160 ${stacksAddress} OP_EQUALVERIFY OP_CHECKSIG`;
    const reclaimScript = `OP_DUP OP_HASH160 ${reclaimPublicKey} OP_EQUALVERIFY OP_CHECKSIG`;
    
    // Generate a simple P2SH address for demonstration
    // Real implementation would create proper taproot address
    const redeemScript = bitcoin.script.compile([
      bitcoin.opcodes.OP_HASH160,
      Buffer.from(stacksAddress.slice(2), 'hex'),
      bitcoin.opcodes.OP_EQUAL,
    ]);
    
    const { address } = bitcoin.payments.p2sh({
      redeem: { output: redeemScript },
      network: btcNetwork,
    });
    
    if (!address) {
      throw new Error('Failed to generate deposit address');
    }
    
    return {
      address,
      redeemScript: redeemScript.toString('hex'),
      reclaimScript,
    };
  } catch (error) {
    console.error('Failed to generate deposit address:', error);
    throw new Error('Failed to generate deposit address');
  }
}

/**
 * Validate a Bitcoin address format
 */
export function isValidBitcoinAddress(address: string, network: 'mainnet' | 'testnet' = 'testnet'): boolean {
  try {
    bitcoinAddressToTuple(address, network);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the address type description for UI display
 */
export function getAddressType(address: string): string {
  try {
    // Try base58 first
    try {
      const decoded = bitcoin.address.fromBase58Check(address);
      // P2PKH versions: mainnet 0x00, testnet 0x6f
      // P2SH versions: mainnet 0x05, testnet 0xc4
      if (decoded.version === 0x00 || decoded.version === 0x6f) {
        return 'P2PKH (Legacy)';
      } else if (decoded.version === 0x05 || decoded.version === 0xc4) {
        return 'P2SH (Script Hash)';
      }
    } catch {
      // Try bech32
      try {
        const decoded = bitcoin.address.fromBech32(address);
        if (decoded.version === 0) {
          return decoded.data.length === 20 ? 'P2WPKH (SegWit)' : 'P2WSH (SegWit Script)';
        } else if (decoded.version === 1) {
          return 'P2TR (Taproot)';
        }
      } catch {
        return 'Unknown';
      }
    }
    return 'Unknown';
  } catch {
    return 'Invalid';
  }
}