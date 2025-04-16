import React, { useState } from 'react';
import { ScrollView, Text, View, TextInput, Modal, TouchableOpacity } from 'react-native';
import { styles } from './Style';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';


export const Ketqua = ({
    results,
    points,
    rankThresholds }) => {
    const [nameFilter, setNameFilter] = useState('');
    const [answerFilter, setAnswerFilter] = useState('');
    const [correctFilter, setCorrectFilter] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const exportToExcel = async () => {
        try {
            // Sheet 1: Danh sách câu trả lời chi tiết
            const sheet1Data = results.map((r) => ({
                'Tên': r.name,
                'Câu hỏi': r.question,
                'Chọn đáp án': r.answer,
                'Đúng/Sai': r.isCorrect ? '✅ Đúng' : '❌ Sai',
                'Thứ tự câu': r.questionIndex + 1,
            }));

            const sheet1 = XLSX.utils.json_to_sheet(sheet1Data);

            // Sheet 2: Tổng điểm + xếp loại
            const sheet2Data = Object.entries(points).map(([name, score]) => {
                let rank = '🙂 Trung bình';
                if (score >= rankThresholds.gioi) rank = '🌟 Giỏi';
                else if (score >= rankThresholds.kha) rank = '👍 Khá';

                return {
                    'Tên': name,
                    'Tổng điểm': score,
                    'Xếp loại': rank,
                };
            });

            const sheet2 = XLSX.utils.json_to_sheet(sheet2Data);

            // Gộp workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet1, 'Chi tiết kết quả');
            XLSX.utils.book_append_sheet(workbook, sheet2, 'Tổng kết');

            const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

            const uri = FileSystem.cacheDirectory + 'ketqua.xlsx';
            await FileSystem.writeAsStringAsync(uri, wbout, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await Sharing.shareAsync(uri, {
                mimeType:
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Chia sẻ kết quả học tập',
                UTI: 'com.microsoft.excel.xlsx',
            });
        } catch (err) {
            console.error('Lỗi khi xuất Excel:', err);
        }
    };

    const handleSelect = (value) => {
        setCorrectFilter(value);
        setModalVisible(false);
    };
    const filteredResults = results.filter((r) => {
        const matchAnswer = answerFilter ? r.answer.toLowerCase() === answerFilter.toLowerCase() : true;
        const matchCorrect = correctFilter === 'true'
            ? r.isCorrect
            : correctFilter === 'false'
                ? !r.isCorrect
                : true;
        const matchName = nameFilter
            ? r.name.toLowerCase().includes(nameFilter.toLowerCase())
            : true;
        return matchAnswer && matchCorrect && matchName;
    }).sort((a, b) => a.name.localeCompare(b.name));


    const getRank = (score) => {
        if (score >= rankThresholds.gioi) return '🌟 Giỏi';
        if (score >= rankThresholds.kha) return '👍 Khá';
        return '🙂 Trung bình';
    };
    const renderSelectedFilter = () => {
        switch (correctFilter) {
            case 'true':
                return '✅ Đúng';
            case 'false':
                return '❌ Sai';
            case '':
                return 'Tất cả';
            default:
                return 'None';
        }
    };
    return (
        <ScrollView contentContainerStyle={styles.scrollView}>

            <TouchableOpacity onPress={exportToExcel} style={[styles.button, { marginTop: 10 }]}>
                <Text style={styles.buttonText}>📥 Xuất kết quả ra Excel</Text>
            </TouchableOpacity>
            {/* 🎯 PHẦN 1: XẾP LOẠI HỌC SINH */}
            <Text style={{ fontWeight: 'bold', fontSize: 20, margin: 10 }}>🎯 Xếp loại học sinh</Text>




            {/* Tổng điểm và xếp loại */}
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 20 }}>🏆 Tổng điểm và xếp loại:</Text>
            {
                Object.entries(points).map(([name, score], i) => (
                    <Text key={i} style={{ marginBottom: 4 }}>
                        {name}: {score} điểm – {getRank(score)}
                    </Text>
                ))
            }

            <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 20 }} />

            {/* 🔍 PHẦN 2: LỌC VÀ XEM KẾT QUẢ */}
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>🔍 Lọc và xem kết quả</Text>

            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
                <Text style={styles.buttonText}>Lọc kết quả</Text>
            </TouchableOpacity>

            <Text>Lựa chọn: {renderSelectedFilter()}</Text>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity onPress={() => handleSelect('')} style={styles.option}>
                            <Text>Tất cả</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSelect('true')} style={styles.option}>
                            <Text>✅ Đúng</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSelect('false')} style={styles.option}>
                            <Text>❌ Sai</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text>Thoát </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bộ lọc tên + đáp án */}
            <View style={[styles.center, { paddingHorizontal: 20 }]}>
                <View style={{ flexDirection: 'row', columnGap: 10, marginVertical: 10 }}>
                    <TextInput
                        value={nameFilter}
                        onChangeText={setNameFilter}
                        placeholder="Tên"
                        style={[styles.textInput, { flex: 1 }]}
                    />
                    <TextInput
                        value={answerFilter}
                        onChangeText={setAnswerFilter}
                        placeholder="Đáp án"
                        style={[styles.textInput, { flex: 1 }]}
                    />
                </View>
            </View>

            {/* Danh sách kết quả */}
            {
                filteredResults.map((r, index) => (
                    <View
                        key={index}
                        style={[
                            styles.resultContainer,
                            {
                                backgroundColor: r.isCorrect ? '#e6ffed' : '#ffe6e6',
                                borderLeftColor: r.isCorrect ? '#28a745' : '#dc3545',
                            },
                        ]}
                    >
                        <Text style={styles.resultName}>{r.name}</Text>
                        <Text style={styles.resultQuestion}>
                            Câu {r.questionIndex + 1}: {r.question}
                        </Text>
                        <Text style={styles.resultAnswer}>
                            Chọn: {r.answer} ➡️ {r.isCorrect ? '✅ Đúng' : '❌ Sai'}
                        </Text>
                    </View>
                ))
            }

        </ScrollView >
    );
};

