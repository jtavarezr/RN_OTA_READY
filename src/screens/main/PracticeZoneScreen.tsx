import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Or use ui-kitten Icon if preferred
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTailwind } from '../../utils/tailwind';
import { useThemeColors } from '../../utils/themeColors';
import { eduService, Question } from '../../services/eduService';
import { usePracticeStore } from '../../store/usePracticeStore';

// Simple UI components helper
const RNText = require('react-native').Text;
const Text = ({ children, style, ...props }: any) => {
    const colors = useThemeColors();
    return <RNText style={[{ color: colors.textMain }, style]} {...props}>{children}</RNText>;
};

export const PracticeZoneScreen = () => {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const tw = useTailwind();
    const colors = useThemeColors();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            setLoading(true);
            const cats = await eduService.getCategories();
            setCategories(cats.length > 0 ? cats : ['Development', 'Design', 'Soft Skills', 'Business']);
            setLoading(false);
        };
        loadCategories();
    }, []);

    const startQuiz = async (category: string) => {
        setLoading(true);
        setSelectedCategory(category);
        const fetched = await eduService.getQuestions(category);
        
        const shuffled = fetched.sort(() => 0.5 - Math.random()).slice(0, 10);
        
        if (shuffled.length === 0) {
            Alert.alert("No questions", "No questions found for this category.");
            setLoading(false);
            setSelectedCategory(null);
            return;
        }

        setQuestions(shuffled);
        setCurrentQIndex(0);
        setScore(0);
        setQuizFinished(false);
        setLoading(false);
    };

    const handleOptionSelect = (option: string) => {
        if (selectedOption !== null) return;
        setSelectedOption(option);
    };

    const checkAnswer = () => {
        const currentQ = questions[currentQIndex];
        const isCorrect = selectedOption === currentQ.correctAnswer;
        if (isCorrect) setScore(s => s + 1);
        setShowExplanation(true);
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setQuizFinished(true);
            usePracticeStore.getState().addAttempt({
                category: selectedCategory || 'General',
                score: score,
                totalQuestions: questions.length
            });
        }
    };

    const restart = () => {
        setSelectedCategory(null);
        setQuestions([]);
        setQuizFinished(false);
    };

    if (loading) {
        return (
            <View style={[tw('flex-1 justify-center items-center'), { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!selectedCategory) {
        return (
             <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
                <View style={[tw('p-6'), { borderBottomColor: colors.cardBorder }]}>
                    <TouchableOpacity onPress={() => navigation.navigate('StudyHub')} style={tw('mb-6')}>
                        <Ionicons name="arrow-back" size={24} color={colors.textMain} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.5 }}>{t('eduHub.practice')}</Text>
                    <Text style={[tw('mt-2'), { color: colors.textSecondary, fontSize: 16 }]}>{t('eduHub.selectCategory')}</Text>
                </View>

                <ScrollView contentContainerStyle={tw('px-6 pb-20')}>
                    <View style={tw('flex-row flex-wrap justify-between')}>
                        {categories.map((cat, idx) => (
                            <TouchableOpacity 
                                key={cat} 
                                onPress={() => startQuiz(cat)}
                                style={[
                                    tw('w-[48%] p-6 mb-4 rounded-3xl border justify-center items-center'),
                                    { 
                                        backgroundColor: colors.card, 
                                        borderColor: colors.cardBorder,
                                        height: 160
                                    }
                                ]}
                            >
                                <View style={[tw('w-12 h-12 rounded-2xl justify-center items-center mb-4'), { backgroundColor: `${colors.primary}${idx % 2 === 0 ? '15' : '30'}` }]}>
                                    <Ionicons name={idx % 2 === 0 ? "code-slash" : "brush"} size={24} color={colors.primary} />
                                </View>
                                <Text style={tw('text-base font-bold text-center')}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (quizFinished) {
        return (
            <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <View style={[tw('p-10 rounded-[40px] w-[85%] items-center border'), { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                     <View style={[tw('w-24 h-24 rounded-full justify-center items-center mb-6'), { backgroundColor: `${colors.warning}15` }]}>
                        <Ionicons name="trophy" size={48} color={colors.warning} />
                     </View>
                     <Text style={tw('text-2xl font-bold mb-2')}>{t('eduHub.results')}</Text>
                     <Text style={tw('text-5xl font-extrabold mb-8')}>{score} / {questions.length}</Text>
                     
                     <TouchableOpacity 
                        onPress={restart}
                        style={[tw('w-full py-4 rounded-2xl mb-4 items-center'), { backgroundColor: colors.primary }]}
                     >
                         <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{t('eduHub.retry')}</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity onPress={() => navigation.navigate('StudyHub')}>
                         <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('eduHub.backToMenu')}</Text>
                     </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const question = questions[currentQIndex];
    let options: string[] = [];
    try {
        options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
    } catch { options = []; }

    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]}>
            <View style={[tw('flex-row justify-between items-center p-6'), { borderBottomColor: 'transparent' }]}>
                 <TouchableOpacity onPress={restart} style={[tw('p-2 rounded-xl'), { backgroundColor: colors.card }]}>
                    <Ionicons name="close" size={24} color={colors.textMain} />
                 </TouchableOpacity>
                 <View style={tw('items-center')}>
                    <Text style={tw('font-bold text-sm tracking-widest uppercase')}>{selectedCategory}</Text>
                 </View>
                 <View style={[tw('px-3 py-1 rounded-full'), { backgroundColor: colors.card }]}>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>{currentQIndex + 1}/{questions.length}</Text>
                 </View>
            </View>

            <ScrollView contentContainerStyle={tw('p-6 pb-20')}>
                <View style={[tw('h-2 w-full rounded-full mb-10'), { backgroundColor: colors.card }]}>
                    <View style={[tw('h-full rounded-full'), { backgroundColor: colors.primary, width: `${((currentQIndex + 1) / questions.length) * 100}%` }]} />
                </View>

                <Text style={tw('text-2xl font-bold mb-10 leading-9')}>{question.text}</Text>

                {options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt === question.correctAnswer;
                    const showResult = showExplanation;
                    
                    let bg = colors.card;
                    let border = colors.cardBorder;
                    let textCol = colors.textMain;
                    
                    if (showResult) {
                         if (isCorrect) { bg = `${colors.success}20`; border = colors.success; textCol = colors.success; }
                         else if (isSelected && !isCorrect) { bg = `${colors.error}20`; border = colors.error; textCol = colors.error; }
                    } else if (isSelected) {
                        bg = `${colors.primary}10`; border = colors.primary;
                    }

                    return (
                        <TouchableOpacity
                            key={idx}
                            disabled={selectedOption !== null}
                            onPress={() => handleOptionSelect(opt)}
                            style={[
                                tw('p-5 mb-4 rounded-3xl border flex-row items-center'),
                                { backgroundColor: bg, borderColor: border, borderWidth: 2 }
                            ]}
                        >
                            <View style={[
                                tw('w-8 h-8 rounded-full border mr-4 justify-center items-center'),
                                { borderColor: showResult && isCorrect ? colors.success : (isSelected ? colors.primary : colors.cardBorder), backgroundColor: 'transparent' }
                            ]}>
                                {showResult && isCorrect && <Ionicons name="checkmark" size={20} color={colors.success} />}
                                {showResult && isSelected && !isCorrect && <Ionicons name="close" size={20} color={colors.error} />}
                                {isSelected && !showResult && <View style={[tw('w-4 h-4 rounded-full'), { backgroundColor: colors.primary }]} />}
                            </View>
                            <Text style={{ fontSize: 17, fontWeight: '600', color: textCol, flex: 1 }}>{opt}</Text>
                        </TouchableOpacity>
                    );
                })}

                <View style={tw('mt-10')}>
                    {!showExplanation && selectedOption && (
                        <TouchableOpacity 
                            onPress={checkAnswer}
                            style={[tw('py-5 rounded-3xl items-center shadow-lg'), { backgroundColor: colors.primary }]}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{t('eduHub.checkAnswer')}</Text>
                        </TouchableOpacity>
                    )}

                    {showExplanation && (
                        <View>
                            <View style={[tw('p-6 rounded-3xl mb-8'), { backgroundColor: selectedOption === question.correctAnswer ? `${colors.success}08` : `${colors.error}08`, borderWidth: 1, borderColor: selectedOption === question.correctAnswer ? `${colors.success}20` : `${colors.error}20` }]}>
                                <View style={tw('flex-row items-center mb-3')}>
                                    <Ionicons 
                                        name={selectedOption === question.correctAnswer ? "checkmark-circle" : "alert-circle"} 
                                        size={24} 
                                        color={selectedOption === question.correctAnswer ? colors.success : colors.error} 
                                        style={tw('mr-2')}
                                    />
                                    <Text style={[tw('font-bold text-lg'), { color: selectedOption === question.correctAnswer ? colors.success : colors.error }]}>
                                        {selectedOption === question.correctAnswer ? t('eduHub.correct') : t('eduHub.incorrect')}
                                    </Text>
                                </View>
                                <Text style={tw('text-base leading-6 opacity-80')}>{question.explanation || `The correct answer is: ${question.correctAnswer}`}</Text>
                            </View>
                            
                            <TouchableOpacity 
                                onPress={nextQuestion}
                                style={[tw('py-5 rounded-3xl items-center shadow-lg'), { backgroundColor: colors.primary }]}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{t('eduHub.nextQuestion')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
