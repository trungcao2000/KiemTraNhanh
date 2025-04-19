import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { styles } from './Style';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

export const Giaovien = ({ questions, setQuestions }) => {

    const [current, setCurrent] = useState({
        question: '',
        answers: [
            { option: 'A', text: '' },
            { option: 'B', text: '' },
            { option: 'C', text: '' },
            { option: 'D', text: '' }
        ],
        correct: 'A',
        points: 1,
    });

    const [editingIndex, setEditingIndex] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);  // State to control modal visibility
    const [searchKeyword, setSearchKeyword] = useState('');

    const handleChangeAnswer = (option, value) => {
        const updated = current.answers.map((a) =>
            a.option === option ? { ...a, text: value } : a
        );
        setCurrent({ ...current, answers: updated });
    };

    const handleSave = () => {
        // Kiểm tra xem câu hỏi và các đáp án có đầy đủ thông tin không
        if (!current.question || current.answers.some((a) => !a.text)) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        // Nếu đang sửa câu hỏi (editingIndex !== null)
        if (editingIndex !== null) {
            // Kiểm tra xem câu hỏi đã tồn tại ngoài câu hỏi đang chỉnh sửa
            const isQuestionExist = questions.some((q, index) =>
                index !== editingIndex && q.question.trim().toLowerCase() === current.question.trim().toLowerCase()
            );

            if (isQuestionExist) {
                alert('Câu hỏi này đã tồn tại! Vui lòng nhập câu hỏi khác.');
                return;
            }

            // Cập nhật câu hỏi cũ
            const updatedList = [...questions];
            updatedList[editingIndex] = current;
            setQuestions(updatedList);

        } else {
            // Kiểm tra câu hỏi đã tồn tại khi không phải chỉnh sửa
            const isQuestionExist = questions.some((q) => q.question.trim().toLowerCase() === current.question.trim().toLowerCase());

            if (isQuestionExist) {
                alert('Câu hỏi này đã tồn tại! Vui lòng nhập câu hỏi khác.');
                return;
            }

            // Thêm câu hỏi mới vào danh sách
            setQuestions([...questions, current]);
        }

        // Reset các trường nhập liệu sau khi lưu
        resetForm();
        setModalVisible(false);  // Close the modal after saving
    };

    // Reset form for new question
    const resetForm = () => {
        setCurrent({
            question: '',
            answers: [
                { option: 'A', text: '' },
                { option: 'B', text: '' },
                { option: 'C', text: '' },
                { option: 'D', text: '' }
            ],
            correct: '',
            points: 1,
        });
        setEditingIndex(null);
    };

    const handleEdit = (index) => {
        setCurrent(questions[index]);
        setEditingIndex(index);
        setModalVisible(true);  // Open modal for editing
    };

    const handleDelete = (index) => {
        const updated = [...questions];
        updated.splice(index, 1);
        setQuestions(updated);
    };


    const handleImport = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: '*/*', // hoặc: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                copyToCacheDirectory: true,
            });

            if (res.canceled) {
                console.log('Đã huỷ chọn file.');
                return;
            }

            const fileUri = res.assets[0].uri;

            const base64 = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const binary = atob(base64);
            const buffer = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                buffer[i] = binary.charCodeAt(i);
            }

            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            if (rows.length < 2) {
                Alert.alert('File không hợp lệ', 'File phải có ít nhất 1 dòng dữ liệu!');
                return;
            }

            const questionList = rows.slice(1).map((row) => ({
                question: row[0],
                answers: [
                    { option: 'A', text: row[1] },
                    { option: 'B', text: row[2] },
                    { option: 'C', text: row[3] },
                    { option: 'D', text: row[4] },
                ],
                correct: row[5] || 'A', // Nếu không có đáp án đúng, mặc định là A
                points: row[6] || 1, // Nếu không có điểm, mặc định là 10
            }));

            // Giả sử bạn có useState:
            setQuestions(prevQuestions => [...prevQuestions, ...questionList]);
            Alert.alert('✅ Thành công', `Đã nhập ${questionList.length} câu hỏi`);
        } catch (err) {
            console.error('Lỗi import Excel:', err);
            Alert.alert('❌ Lỗi', 'Không thể đọc file Excel!');
        }
    };

    const handleExport = async (questions) => {
        if (!questions || questions.length === 0) {
            Alert.alert('Thông báo', 'Không có dữ liệu để xuất.');
            return;
        }

        try {
            // Chuyển đổi dữ liệu
            const sheetData = questions.map((q, index) => ({
                'Câu hỏi': q.question,
                'Đáp án A': q.answers.find(a => a.option === 'A')?.text || '',
                'Đáp án B': q.answers.find(a => a.option === 'B')?.text || '',
                'Đáp án C': q.answers.find(a => a.option === 'C')?.text || '',
                'Đáp án D': q.answers.find(a => a.option === 'D')?.text || '',
                'Đáp án đúng': q.correct,
                'Số điểm': q.points // Thêm số điểm vào dữ liệu xuất
            }));

            const worksheet = XLSX.utils.json_to_sheet(sheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách câu hỏi');

            const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

            const uri = FileSystem.cacheDirectory + 'CauHoiTracNghiem.xlsx';
            await FileSystem.writeAsStringAsync(uri, wbout, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Chia sẻ file Excel câu hỏi',
                UTI: 'com.microsoft.excel.xlsx',
            });
        } catch (error) {
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xuất file Excel.');
        }
    };


    const filteredQuestions = questions.filter(q =>
        q.question.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    return (

        <View style={styles.center}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleImport}
                >
                    <Text style={styles.buttonText}>📥 Nhập Excel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleExport(questions)}
                >
                    <Text style={styles.buttonText}>📤 Xuất Excel</Text>
                </TouchableOpacity>

            </View>
            <Text style={styles.title}>
                Tạo câu hỏi
            </Text>


            <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.buttonText}>Thêm câu hỏi 📝</Text>
            </TouchableOpacity>





            <TextInput
                placeholder="Tìm câu hỏi theo tên..."
                value={searchKeyword}
                onChangeText={setSearchKeyword}
                style={{
                    margin: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                }}
            />
            {/* Danh sách câu hỏi */}
            {filteredQuestions.length > 0 && (
                <ScrollView style={{ flex: 1 }}>
                    <Text style={styles.title}>
                        Danh sách câu hỏi
                    </Text>

                    {filteredQuestions.map((q, index) => (
                        <View
                            key={index}
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 5,
                                padding: 10,
                                marginBottom: 10,
                                backgroundColor: '#f9f9f9',
                            }}
                        >
                            {/* Hàng chứa câu hỏi + số điểm */}
                            <Text style={styles.title}>
                                Câu {index + 1}: {q.question}
                            </Text>
                            <Text style={{ fontStyle: 'italic', marginBottom: 10 }}>
                                Số điểm: {q.points || 1} {/* Nếu không có điểm, mặc định là 10 */}
                            </Text>

                            {/* Danh sách đáp án */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {/* Cột 1 */}
                                <View style={{ flex: 1, paddingRight: 8 }}>
                                    {q.answers.slice(0, Math.ceil(q.answers.length / 2)).map((a) => (
                                        <Text
                                            key={a.option}
                                            style={{
                                                color: a.option === q.correct ? 'green' : '#333',
                                                fontWeight: a.option === q.correct ? 'bold' : 'normal',
                                                marginBottom: 6,
                                            }}
                                        >
                                            {a.option}. {a.text}
                                        </Text>
                                    ))}
                                </View>

                                {/* Cột 2 */}
                                <View style={{ flex: 1, paddingLeft: 8 }}>
                                    {q.answers.slice(Math.ceil(q.answers.length / 2)).map((a) => (
                                        <Text
                                            key={a.option}
                                            style={{
                                                color: a.option === q.correct ? 'green' : '#333',
                                                fontWeight: a.option === q.correct ? 'bold' : 'normal',
                                                marginBottom: 6,
                                            }}
                                        >
                                            {a.option}. {a.text}
                                        </Text>
                                    ))}
                                </View>
                            </View>

                            {/* Nút Sửa và Xoá */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: '#2196F3' }]}
                                    onPress={() => handleEdit(index)}
                                >
                                    <Text style={styles.buttonText}>✏️ Sửa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: '#f44336' }]}
                                    onPress={() => handleDelete(index)}
                                >
                                    <Text style={styles.buttonText}>🗑️ Xoá</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Modal for Create or Edit Question */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                        >
                            <ScrollView
                                contentContainerStyle={styles.modalContainer}
                                keyboardShouldPersistTaps="handled"
                            >
                                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
                                    {editingIndex !== null ? 'Sửa câu hỏi' : 'Tạo câu hỏi'}
                                </Text>

                                {/* Câu hỏi */}
                                <TextInput
                                    placeholder="Nội dung câu hỏi"
                                    value={current.question}
                                    onChangeText={(text) => setCurrent({ ...current, question: text })}
                                    style={styles.textInput}
                                />

                                {/* Đáp án */}
                                {current.answers.map((a) => (
                                    <TextInput
                                        key={a.option}
                                        placeholder={`Đáp án ${a.option}`}
                                        value={a.text}
                                        onChangeText={(text) => handleChangeAnswer(a.option, text)}
                                        style={styles.textInput}
                                    />
                                ))}
                                {/* Điểm số */}

                                <TextInput
                                    placeholder="Số điểm"
                                    value={current.points?.toString() || ''}
                                    onChangeText={(text) => {
                                        // Nếu người dùng xóa hết, cho phép chuỗi rỗng
                                        if (text === '') {
                                            setCurrent({ ...current, points: null });
                                        } else {
                                            // Loại bỏ tất cả ký tự không phải là số
                                            const newValue = text.replace(/[^0-9]/g, '');

                                            // Chuyển đổi giá trị sang số
                                            const points = parseInt(newValue);

                                            // Nếu points là NaN hoặc nhỏ hơn hoặc bằng 0, mặc định là 1
                                            setCurrent({ ...current, points: points > 0 ? points : 1 });
                                        }
                                    }}
                                    style={styles.textInput}
                                    keyboardType='numeric'
                                />
                                {/* Chọn đáp án đúng */}
                                <Text style={{ marginVertical: 8, fontWeight: 'bold' }}>Chọn đáp án đúng:</Text>
                                <View style={styles.answerOptions}>
                                    {['A', 'B', 'C', 'D'].map((opt) => (
                                        <TouchableOpacity
                                            key={opt}
                                            style={{
                                                ...styles.answerButton,
                                                backgroundColor: current.correct === opt ? '#e0f0ff' : '#fff',
                                                borderColor: current.correct === opt ? '#6200ee' : '#ccc',
                                            }}
                                            onPress={() => setCurrent({ ...current, correct: opt })}
                                        >
                                            <View style={styles.circle}>
                                                {current.correct === opt && <View style={styles.innerCircleSelected} />}
                                            </View>
                                            <Text style={{ color: '#333', fontSize: 16 }}>Đáp án {opt}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Nút lưu hoặc cập nhật */}
                                <TouchableOpacity onPress={handleSave} style={styles.button}>
                                    <Text style={styles.buttonText}>
                                        {editingIndex !== null ? 'Cập nhật câu hỏi' : 'Lưu câu hỏi'}
                                    </Text>
                                </TouchableOpacity>

                                {/* Close Button */}
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={[styles.button, { backgroundColor: '#f44336', marginTop: 12 }]}
                                >
                                    <Text style={styles.buttonText}>Đóng lại ❌</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </View>
    )
};