export class CurrencyRate {
    private provider: string;
    private currency: string;
    private buyRate: number;
    private sellRate: number;

    constructor(provider: string, currency: string, buyRate: number, sellRate: number) {
        this.provider = provider;
        this.currency = currency;
        this.buyRate = buyRate;
        this.sellRate = sellRate;
    }

    public getProvider(): string {
        return this.provider;
    }

    public getCurrency(): string {
        return this.currency;
    }

    public getBuyRate(): number {
        return this.buyRate;
    }

    public getSellRate(): number {
        return this.sellRate;
    }
}
