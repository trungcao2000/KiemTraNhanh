import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ResultsContext = createContext();

export const ResultsProvider = ({ children }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const [questions, setQuestions] = useState([]);
    const [students, setStudents] = useState([]);



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
                    storedRanks,
                    storedStudents
                ] = await Promise.all([
                    AsyncStorage.getItem('questions'),
                    AsyncStorage.getItem('rankThresholds'),
                    AsyncStorage.getItem('students')
                ]);

                if (storedQuestions) setQuestions(JSON.parse(storedQuestions));
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
            ['questions', JSON.stringify(questions)],
            ['rankThresholds', JSON.stringify(rankThresholds)],
            ['students', JSON.stringify(students)],
        ]);
    }, [questions, students, rankThresholds]);


    const clearAllData = async ({ setResults }) => {
        try {
            await AsyncStorage.multiRemove(['questions', 'rankThresholds', 'students', 'results']);
            setQuestions([]);
            setStudents([]);
            setResults([])
            setRankThresholds({ gioi: 8, kha: 6.5, tb: 5 });
            console.log('🧹 Dữ liệu đã được reset.');
        } catch (e) {
            console.log('❌ Không thể xoá dữ liệu:', e);
        }
    };

    return (
        <ResultsContext.Provider value={{

            questions, setQuestions,
            rankThresholds,
            setRankThresholds,
            students,
            setStudents,
            currentIndex,
            setCurrentIndex,
            clearAllData

        }}>
            {children}
        </ResultsContext.Provider>

    );
};

export const useResults = () => useContext(ResultsContext);
