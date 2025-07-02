import { WhitelistToken, AirdropStatus, Token } from '../types';
import { databaseService } from './database';

export class AirdropService {
  async checkEligibility(userTokens: Token[]): Promise<AirdropStatus> {
    const whitelist = await databaseService.getWhitelist();
    const activeWhitelist = whitelist.filter(token => token.is_active);
    
    const eligibleTokens: WhitelistToken[] = [];
    let totalAirdropAmount = 0;

    userTokens.forEach(userToken => {
      const whitelistToken = activeWhitelist.find(
        wToken => wToken.address.toLowerCase() === userToken.tokenInfo.address.toLowerCase()
      );

      if (whitelistToken) {
        eligibleTokens.push(whitelistToken);
        totalAirdropAmount += whitelistToken.airdrop_amount;
      }
    });

    return {
      isEligible: eligibleTokens.length > 0,
      eligibleTokens,
      totalAirdropAmount,
      claimed: false,
    };
  }

  async claimAirdrop(address: string, eligibleTokens: WhitelistToken[]): Promise<boolean> {
    // Check if already claimed
    const hasClaimed = await databaseService.hasClaimedAirdrop(address);
    if (hasClaimed) {
      throw new Error('Airdrop already claimed for this address');
    }

    const totalAmount = eligibleTokens.reduce((sum, token) => sum + token.airdrop_amount, 0);

    // Create claim record
    const claimId = await databaseService.createAirdropClaim({
      wallet_address: address.toLowerCase(),
      tokens_claimed: eligibleTokens,
      total_amount: totalAmount,
      status: 'pending',
    });

    if (!claimId) {
      throw new Error('Failed to create airdrop claim');
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update claim status to completed
    await databaseService.updateAirdropClaim(claimId, {
      status: 'completed',
      transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
    });

    return true;
  }

  async hasClaimedAirdrop(address: string): Promise<boolean> {
    return await databaseService.hasClaimedAirdrop(address);
  }

  async getWhitelist(): Promise<WhitelistToken[]> {
    return await databaseService.getWhitelist();
  }

  async addToWhitelist(token: Omit<WhitelistToken, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    return await databaseService.addToWhitelist(token);
  }

  async updateWhitelistToken(id: string, updates: Partial<WhitelistToken>): Promise<boolean> {
    return await databaseService.updateWhitelistToken(id, updates);
  }

  async removeFromWhitelist(id: string): Promise<boolean> {
    return await databaseService.removeFromWhitelist(id);
  }
}

export const airdropService = new AirdropService();