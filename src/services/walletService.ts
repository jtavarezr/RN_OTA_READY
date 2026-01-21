import api from './api';

export interface Wallet {
    userId: string;
    balance: number;
    lastAdView?: string;
}

export interface Transaction {
    $id: string;
    userId: string;
    walletId: string;
    amount: number;
    type: 'EARN' | 'SPEND';
    description: string;
    timestamp: string;
}

export interface ServiceInfo {
    cost: number;
    interactions: number;
}

export interface ReportPrices {
    BASIC_REPORT: ServiceInfo;
    ADVANCED_REPORT: ServiceInfo;
    OPTIMIZED_GENERATION: ServiceInfo;
    AI_IMPROVEMENT: ServiceInfo;
    AI_COACH_INTERACTION: ServiceInfo;
}

const getBalance = async (userId: string): Promise<Wallet> => {
    const response = await api.get('/api/wallet/balance', { params: { userId } });
    return response.data;
};

const addCredits = async (userId: string, adToken: string): Promise<{ success: boolean; balance: number; added: number }> => {
    const response = await api.post('/api/wallet/add-credits', { userId, adToken });
    return response.data;
};

const deductCredits = async (userId: string, amount: number, reason: string): Promise<{ success: boolean; balance: number }> => {
    const response = await api.post('/api/wallet/deduct-credits', { userId, amount, reason });
    return response.data;
};

const getTransactions = async (userId: string): Promise<{ total: number; documents: Transaction[] }> => {
    const response = await api.get('/api/wallet/transactions', { params: { userId } });
    return response.data;
};

const getPrices = async (): Promise<ReportPrices> => {
    const response = await api.get('/api/wallet/prices');
    return response.data;
};

export default {
    getBalance,
    addCredits,
    deductCredits,
    getTransactions,
    getPrices
};
