import { EthplorerResponse } from '../types';
import { databaseService } from './database';

const ETHPLORER_API_BASE = 'https://api.ethplorer.io';

export class EthplorerService {
  private apiKey: string = 'freekey';
  private apiKeyLoaded: boolean = false;

  async getAddressInfo(address: string): Promise<EthplorerResponse> {
    try {
      // Load API key only when needed and if not already loaded
      if (!this.apiKeyLoaded) {
        await this.loadApiKey();
      }

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
      // Load API key only when needed and if not already loaded
      if (!this.apiKeyLoaded) {
        await this.loadApiKey();
      }

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

  private async loadApiKey() {
    try {
      const savedKey = await databaseService.getSetting('ethplorer_api_key');
      if (savedKey) {
        this.apiKey = savedKey;
      }
      this.apiKeyLoaded = true;
    } catch (error) {
      console.error('Error loading API key, using default:', error);
      this.apiKey = 'freekey';
      this.apiKeyLoaded = true;
    }
  }

  async setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.apiKeyLoaded = true;
    try {
      await databaseService.setSetting('ethplorer_api_key', apiKey);
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  }
}

export const ethplorerService = new EthplorerService();