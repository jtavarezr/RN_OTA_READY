import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../../context/WalletContext';
import { useTailwind } from '../../utils/tailwind';
import { useThemeColors } from '../../utils/themeColors';

export const WalletPanel = () => {
    const { balance, earnCredits, loading } = useWallet();
    const [adLoading, setAdLoading] = useState(false);
    const tw = useTailwind();
    const colors = useThemeColors();

    const handleWatchAd = async () => {
        setAdLoading(true);
        // Simulate Ad viewing time
        setTimeout(async () => {
            const success = await earnCredits('VALID_AD_TOKEN');
            setAdLoading(false);
            if (success) {
               // Alert.alert("Success", "You earned 1 credit!");
            } else {
               Alert.alert("Error", "Failed to reward credits.");
            }
        }, 2000);
    };

    if (loading) return <View style={tw('p-4')}><ActivityIndicator size="small" color={colors.primary} /></View>;

    return (
        <View style={[tw('p-4 rounded-xl mb-4 border'), { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={tw('flex-row justify-between items-center mb-4')}>
                <Text style={[tw('text-lg font-bold'), { color: colors.textMain }]}>Wallet Balance</Text>
                <View style={tw('flex-row items-center')}>
                    <Ionicons name='wallet-outline' size={24} color={colors.primary} style={tw('mr-2')} />
                    <Text style={[tw('text-2xl font-bold'), { color: colors.textMain }]}>{balance}</Text>
                    <Text style={[tw('ml-1 text-sm'), { color: colors.textSecondary }]}>credits</Text>
                </View>
            </View>
            
            <View>
                <Text style={[tw('mb-4 text-sm'), { color: colors.textSecondary }]}>
                    Earn credits by watching ads to generate premium reports.
                </Text>
                <TouchableOpacity 
                    onPress={handleWatchAd} 
                    disabled={adLoading}
                    style={[tw('py-3 rounded-lg flex-row justify-center items-center'), { backgroundColor: colors.primary, opacity: adLoading ? 0.7 : 1 }]}
                >
                    {adLoading ? (
                        <ActivityIndicator size="small" color="white" style={tw('mr-2')} />
                    ) : (
                        <Ionicons name='play-circle-outline' size={20} color="white" style={tw('mr-2')} />
                    )}
                    <Text style={tw('text-white font-bold')}>
                        {adLoading ? 'Watching Ad...' : 'Watch Ad (+1 Credit)'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    balanceText: {
        marginRight: 4,
        fontWeight: 'bold',
    },
    content: {
        marginTop: 10,
    },
    info: {
        marginBottom: 10,
        color: '#8F9BB3',
    },
    button: {
        width: '100%',
    },
});
