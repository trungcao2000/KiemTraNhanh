import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput, ScrollView, Modal, Image, Alert
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { styles } from './Style';

export const Hocsinh = ({ students, setStudents }) => {
    const [name, setName] = useState('');
    const [pendingStudents, setPendingStudents] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [allQRs, setAllQRs] = useState([]);
    const [visible, setVisible] = useState(false);

    const viewShotRef = useRef();

    const addOrUpdateStudent = () => {
        if (!name.trim()) return;

        // Kiểm tra tên có tồn tại trong danh sách học sinh đã thêm hoặc đang chờ
        const isNameExist = [...students, ...pendingStudents].some(student => student.name.trim().toLowerCase() === name.trim().toLowerCase());

        if (isNameExist) {
            alert('Tên này đã tồn tại! Vui lòng chọn tên khác.');
            return;
        }

        if (editingIndex !== null) {
            // Sửa trực tiếp trong students
            const updated = [...students];
            updated[editingIndex] = { name };
            setStudents(updated);
            setEditingIndex(null);
        } else {
            // Thêm vào pending nếu không đang sửa
            setPendingStudents([...pendingStudents, { name }]);
        }

        setName('');
    };


    const confirmAddStudents = () => {
        setStudents([...students, ...pendingStudents]);
        setPendingStudents([]);
        setName('');
    };

    const removeStudent = (index) => {
        const updated = [...students];
        updated.splice(index, 1);
        setStudents(updated);
        if (editingIndex === index) {
            setEditingIndex(null);
            setName('');
        }
    };


    const generateQRSetForOne = (student) => {
        const qrSet = ['A', 'B', 'C', 'D'].map((ans) => {
            const json = {
                name: student.name,
                answer: ans,
            };
            return {
                answer: ans,
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(json))}`
            };
        });
        return qrSet;
    };

    const generateAllQRs = () => {
        const result = students.map(student => ({
            name: student.name,
            qrs: generateQRSetForOne(student)
        }));
        setAllQRs(result);
        setVisible(true);
    };

    const downloadAllQRs = async () => {
        try {
            const permission = await MediaLibrary.requestPermissionsAsync();
            if (!permission.granted) {
                alert("Cần quyền truy cập ảnh để lưu mã QR.");
                return;
            }

            const uri = await viewShotRef.current.capture(); // chụp ảnh màn
            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync("QR Codes", asset, false);

            Alert.alert("✅ Đã lưu ảnh toàn bộ mã QR");
        } catch (error) {
            console.error("Lỗi khi lưu ảnh:", error);
            alert("❌ Lỗi khi lưu ảnh.");
        }
    };


    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(name.toLowerCase())
    );
    return (

        <View style={styles.center}>
            <Text style={styles.title}>
                Danh sách học sinh
            </Text>

            <TextInput
                placeholder="Nhập tên học sinh..."
                value={name}
                onChangeText={setName}
                style={styles.textInput}
            />

            <TouchableOpacity
                onPress={addOrUpdateStudent}
                style={styles.button}
            >
                <Text style={styles.buttonText}>
                    {editingIndex !== null ? 'Cập nhật' : 'Thêm học sinh vào danh sách tạm'}
                </Text>
            </TouchableOpacity>

            {pendingStudents.length > 0 && (
                <TouchableOpacity
                    onPress={confirmAddStudents}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>
                        ✅ Xác nhận thêm {pendingStudents.length} học sinh
                    </Text>
                </TouchableOpacity>
            )}
            {/* Tạo QR cho tất cả */}
            {students.length > 0 && (
                <View style={{ marginTop: 10 }}>
                    <TouchableOpacity
                        onPress={generateAllQRs}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>
                            🔳 Tạo tất cả mã QR
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            <TextInput
                placeholder="Tìm tên học sinh..."
                value={name}
                onChangeText={setName}
                style={{
                    margin: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                }}
            />

            {/* Danh sách chờ */}
            {pendingStudents.length > 0 && (
                <View style={styles.center}>
                    <Text style={styles.title}>
                        📝 Danh sách chờ xác nhận:
                    </Text>
                    {filteredStudents.map((student, index) => (
                        <View
                            key={index}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                backgroundColor: '#e0f7fa',
                                borderRadius: 8,
                                padding: 12,
                                marginBottom: 6,
                            }}
                        >
                            <Text>{student.name}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setEditingIndex(index);
                                        setName(student.name);
                                    }}
                                    style={styles.button}
                                >
                                    <Text style={styles.buttonText}>✏️ Sửa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const updated = [...pendingStudents];
                                        updated.splice(index, 1);
                                        setPendingStudents(updated);
                                    }}
                                    style={styles.button}
                                >
                                    <Text style={styles.buttonText}>🗑️ Xoá</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}


            <View style={{
                backgroundColor: '#fff',
            }}>

                {/* Danh sách chính */}
                {filteredStudents.map((student, index) => (
                    <View
                        key={index}
                        style={{

                            borderRadius: 8,
                            padding: 12,
                            marginTop: 8,
                        }}
                    >
                        {/* Dòng tên học sinh */}
                        <Text style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 16 }}>{student.name}</Text>

                        {/* Dòng chức năng */}
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setEditingIndex(index);
                                    setName(student.name);
                                }}
                                style={[styles.button, { backgroundColor: '#2196F3' }]}
                            >
                                <Text style={styles.buttonText}>✏️ Sửa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => removeStudent(index)}
                                style={[styles.button, { backgroundColor: '#f44336' }]}
                            >
                                <Text style={styles.buttonText}>🗑️ Xoá</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setAllQRs([{ name: student.name, qrs: generateQRSetForOne(student) }]);
                                    setVisible(true);
                                }}
                                style={[styles.button, { backgroundColor: '#4CAF50' }]}
                            >
                                <Text style={styles.buttonText}>🔳 Tạo mã</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

            </View>


            {/* Modal QR */}
            <Modal visible={visible} transparent animationType="slide">
                <View style={{
                    flex: 1,
                    backgroundColor: '#000000aa',
                    justifyContent: 'center',
                }}>
                    <View style={{
                        backgroundColor: '#fff',
                        margin: 20,
                        borderRadius: 10,
                        padding: 16,
                        maxHeight: '80%',
                    }}>
                        <ScrollView>
                            <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
                                {allQRs.map((student, index) => (
                                    <View key={index} style={{ marginBottom: 20 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>
                                            {student.name}
                                        </Text>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                flexWrap: 'wrap',
                                                justifyContent: 'space-evenly',
                                                alignItems: 'center',
                                                paddingHorizontal: 12,
                                            }}
                                        >
                                            {student.qrs.map((qr, i) => (
                                                <View
                                                    key={i}
                                                    style={{
                                                        width: 160,
                                                        padding: 16,
                                                        marginVertical: 12,
                                                        backgroundColor: '#fff',
                                                        borderWidth: 1,
                                                        borderColor: '#999',
                                                        borderRadius: 8,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        elevation: 2,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontWeight: 'bold',
                                                            fontSize: 14,
                                                            marginBottom: 10,
                                                            transform: [{ rotate: '180deg' }],
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {student.name} ({qr.answer})
                                                    </Text>
                                                    <Image
                                                        source={{ uri: qr.uri }}
                                                        style={{ width: 120, height: 120 }}
                                                    />
                                                    <Text
                                                        style={{
                                                            fontSize: 13,
                                                            fontStyle: 'italic',
                                                            marginTop: 10,
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {student.name} ({qr.answer})
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </ViewShot>
                        </ScrollView>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                            <TouchableOpacity
                                onPress={() => setVisible(false)}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>❌ Đóng lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={downloadAllQRs}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>📥 Tải xuống tất cả</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View >
    )
};