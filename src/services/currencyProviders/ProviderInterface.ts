import { CurrencyRate } from "../../dto/CurrencyRate";

export interface ProviderInterface {
    getTodayRates(): Promise<CurrencyRate[]>
}