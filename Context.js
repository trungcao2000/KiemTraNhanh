import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ResultsContext = createContext();

export const ResultsProvider = ({ children }) => {
    const [results, setResults] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [students, setStudents] = useState([]);
    const [points, setPoints] = useState({}); // { name: score }
    const [pointPerQuestion, setPointPerQuestion] = useState('1');

    const [rankThresholds, setRankThresholds] = useState({
        gioi: 8,
        kha: 6.5,
        tb: 5,
    });
    useEffect(() => {
        const loadData = async () => {
            try {
                const [
                    storedQuestions,
                    storedResults,
                    storedPoints,
                    storedRanks,
                    storedStudents
                ] = await Promise.all([
                    AsyncStorage.getItem('questions'),
                    AsyncStorage.getItem('results'),
                    AsyncStorage.getItem('pointPerQuestion'),
                    AsyncStorage.getItem('rankThresholds'),
                    AsyncStorage.getItem('students')
                ]);

                if (storedQuestions) setQuestions(JSON.parse(storedQuestions));
                if (storedResults) setResults(JSON.parse(storedResults));
                if (storedPoints) setPointPerQuestion(JSON.parse(storedPoints));
                if (storedRanks) setRankThresholds(JSON.parse(storedRanks));
                if (storedStudents) setStudents(JSON.parse(storedStudents));
            } catch (error) {
                console.log('❌ Lỗi khi load dữ liệu:', error);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        AsyncStorage.multiSet([
            ['results', JSON.stringify(results)],
            ['questions', JSON.stringify(questions)],
            ['pointPerQuestion', JSON.stringify(pointPerQuestion)],
            ['rankThresholds', JSON.stringify(rankThresholds)],
            ['students', JSON.stringify(students)],
        ]);
    }, [results, questions, , students, pointPerQuestion, rankThresholds]);

    useEffect(() => {
        const scoreMap = {};
        results.forEach((r) => {
            if (!scoreMap[r.name]) {
                scoreMap[r.name] = 0;
            }
            if (r.isCorrect) {
                scoreMap[r.name] += parseFloat(pointPerQuestion || '0');
            }
        });
        setPoints(scoreMap);
    }, [results, pointPerQuestion]);


    const clearAllData = async () => {
        try {
            await AsyncStorage.removeItem('results');
            await AsyncStorage.removeItem('pointPerQuestion');
            await AsyncStorage.removeItem('rankThresholds');
            setResults([]);
            setPointPerQuestion(1);
            setRankThresholds({ gioi: 8, kha: 6.5, tb: 5 });
        } catch (err) {
            console.log('❌ Không thể xóa dữ liệu:', err);
        }
    };

    return (
        <ResultsContext.Provider value={{
            results, setResults,
            questions, setQuestions,
            points, pointPerQuestion,
            setPointPerQuestion,
            rankThresholds,
            setRankThresholds,
            clearAllData, students, setStudents
        }}>
            {children}
        </ResultsContext.Provider>

    );
};

export const useResults = () => useContext(ResultsContext);
