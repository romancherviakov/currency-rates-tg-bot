import axios, {AxiosStatic} from "axios";
import { CurrencyRate } from "../../dto/CurrencyRate";
import { ProviderInterface } from "./providerInterface";

export class NbuProvider implements ProviderInterface {
    private httpClient;

    constructor(httpClient: typeof axios) {
        this.httpClient = httpClient;
    }

    async getTodayRates(): Promise<CurrencyRate[]> {
        
        
        let currencyRate = new CurrencyRate('t', 't', 0,0);
        let res = await this.httpClient.get('url');
        return [currencyRate];
    }
}