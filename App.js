import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView, FlatList, Alert
} from 'react-native';

import { styles } from './Style';
import { Giaovien } from './Giaovien';
import { Hocsinh } from './Hocsinh';
import { Camera } from './Camera';
import { useResults } from './Context';

// Root App
export default function App() {
    const {
        rankThresholds,
        setRankThresholds,
        questions,
        setQuestions,
        students,
        setStudents,
        currentIndex,
        setCurrentIndex,
        results,
        setResults,
        clearAllData
    } = useResults();
    // Quản lý trạng thái active để chuyển tab
    const [active, setActive] = useState(0);
    const [activeSubTab, setActiveSubTab] = useState(0); // chuyển vào trong đây
    const [showPointInput, setShowPointInput] = useState(false);
    const [newPoint, setNewPoint] = useState('');
    // Welcome screen
    const WelcomeScreen = () => (
        <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>👋 Chào mừng bạn!</Text>
                    <Text style={styles.paragraph}>
                        Ứng dụng <Text style={{ fontWeight: 'bold' }}>Quét QR</Text> kiểm tra nhanh.
                    </Text>
                </View>
                <View style={styles.functionSection}>
                    <Text style={styles.subheader}>🔍 Các chức năng chính</Text>
                    <Text style={styles.listItem}>• Quét mã QR từ câu trả lời học sinh</Text>
                    <Text style={styles.listItem}>• Phân tích và thống kê kết quả</Text>
                    <Text style={styles.listItem}>• Hỗ trợ nhập xuất (Excel, PowerPoint)</Text>
                </View>
                <View style={styles.infoCard}>
                    <Text style={styles.infoText}>🗓️ Tính năng mới dự kiến ra mắt: <Text style={{ fontWeight: 'bold' }}>Tháng 5/2025</Text></Text>
                    <Text style={styles.infoText}>👨‍💻 Phát triển bởi: <Text style={{ fontWeight: 'bold' }}>Đại đội 13</Text></Text>
                </View>
            </View>
        </ScrollView>
    );


    // Sub Tab UI Component
    const SubTabGiaovien = ({ labels }) => {

        const renderContent = () => {
            switch (activeSubTab) {
                case 0:
                    return <Giaovien questions={questions} setQuestions={setQuestions} />

                case 1:
                    return <Hocsinh students={students} setStudents={setStudents} />;
                default:
                    return <Text>Không có nội dung</Text>;
            }
        };

        return (
            <View style={{ flex: 1 }}>
                <View style={styles.subTabBar}>
                    {labels.map((label, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.subTabButton, activeSubTab === index && styles.subTabButtonActive]}
                            onPress={() => setActiveSubTab(index)}
                        >
                            <Text style={activeSubTab === index ? styles.subTabTextActive : styles.subTabText}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.container}>{renderContent()}</View>
            </View>
        );
    };



    const Tab2 = () => {
        return (

            <Camera questions={questions} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} results={results}
                setResults={setResults} rankThresholds={rankThresholds} setRankThresholds={setRankThresholds} clearAllData={clearAllData} />
        )
    }


    return (
        <View style={styles.center}>
            <View style={{ flex: 1, display: active === 0 ? 'flex' : 'none' }}>
                <FlatList
                    data={[{ key: 'content' }]} // Mảng data giả
                    renderItem={() =>
                        <ScrollView style={styles.center}>
                            <TouchableOpacity
                                onPress={() => setShowPointInput(!showPointInput)}
                                style={[styles.button, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}
                            >
                                <Text style={styles.buttonText}>
                                    {showPointInput ? '🙈 Ẩn tạo điểm/câu' : '🔍 Hiện tạo điểm/câu'}
                                </Text>
                            </TouchableOpacity>

                            {
                                showPointInput && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                                        <TextInput
                                            placeholder="Điểm cho tất cả"
                                            value={newPoint}
                                            onChangeText={(text) => {
                                                // Cho phép số và duy nhất 1 dấu chấm
                                                let cleaned = text.replace(/[^0-9.]/g, '');

                                                // Chỉ giữ lại dấu chấm đầu tiên nếu có nhiều
                                                const firstDotIndex = cleaned.indexOf('.');
                                                if (firstDotIndex !== -1) {
                                                    cleaned =
                                                        cleaned.substring(0, firstDotIndex + 1) +
                                                        cleaned
                                                            .substring(firstDotIndex + 1)
                                                            .replace(/\./g, '');
                                                }

                                                setNewPoint(cleaned);
                                            }}
                                            style={{
                                                flex: 1,
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                                padding: 8,
                                                borderRadius: 5,
                                                marginRight: 10
                                            }}
                                            keyboardType="numeric"
                                        />
                                        <TouchableOpacity
                                            onPress={() => {
                                                const value = parseInt(newPoint);
                                                if (!isNaN(value) && value > 0) {
                                                    const updated = questions.map(q => ({ ...q, points: value }));
                                                    setQuestions(updated);
                                                    Alert.alert('✅ Thành công', `Đã cập nhật ${questions.length} câu hỏi với điểm = ${value}`);
                                                } else {
                                                    Alert.alert('⚠️ Lỗi', 'Vui lòng nhập số điểm hợp lệ (> 0)');
                                                }
                                            }}
                                            style={{
                                                backgroundColor: '#2196F3',
                                                paddingVertical: 10,
                                                paddingHorizontal: 15,
                                                borderRadius: 5
                                            }}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Áp dụng</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                            <SubTabGiaovien labels={['Tạo Câu Hỏi', 'Tạo Danh Sách Học Sinh']} />
                        </ScrollView>

                    }
                />
            </View>

            <View style={{ flex: 1, display: active === 1 ? 'flex' : 'none' }}>


                <Tab2 />


            </View>


            <View style={styles.tabBar}>

                <TouchableOpacity
                    onPress={() => setActive(0)}
                    style={[styles.tabButton, active === 0 && styles.activeTab]}
                >
                    <Text style={[styles.tabButtonText, active === 0 && styles.activeText]}>Giáo viên</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActive(1)}
                    style={[styles.tabButton, active === 1 && styles.activeTab]}
                >
                    <Text style={[styles.tabButtonText, active === 1 && styles.activeText]}>Kiểm Tra</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                    onPress={() => setActive(2)}
                    style={[styles.tabButton, active === 2 && styles.activeTab]}
                >
                    <Text style={[styles.tabButtonText, active === 2 && styles.activeText]}>Kết quả</Text>
                </TouchableOpacity> */}
            </View>
        </View>
    );
}
