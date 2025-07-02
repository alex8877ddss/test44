import { EthplorerResponse } from '../types';
import { databaseService } from './database';

const ETHPLORER_API_BASE = 'https://api.ethplorer.io';

export class EthplorerService {
  private apiKey: string = 'freekey';

  constructor() {
    this.loadApiKey();
  }

  private async loadApiKey() {
    const savedKey = await databaseService.getSetting('ethplorer_api_key');
    if (savedKey) {
      this.apiKey = savedKey;
    }
  }

  async getAddressInfo(address: string): Promise<EthplorerResponse> {
    try {
      const response = await fetch(
        `${ETHPLORER_API_BASE}/getAddressInfo/${address}?apiKey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Ethplorer API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching address info:', error);
      throw error;
    }
  }

  async getTokenInfo(address: string) {
    try {
      const response = await fetch(
        `${ETHPLORER_API_BASE}/getTokenInfo/${address}?apiKey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Ethplorer API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  }

  async setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    await databaseService.setSetting('ethplorer_api_key', apiKey);
  }
}

export const ethplorerService = new EthplorerService();