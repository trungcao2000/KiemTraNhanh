import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView, FlatList
} from 'react-native';

import { styles } from './Style';
import { Giaovien } from './Giaovien';
import { Hocsinh } from './Hocsinh';
import { Camera } from './Camera';
import { Ketqua } from './Ketqua';
import { useResults } from './Context';

// Root App
export default function App() {
    const {
        results,
        setResults,
        points,
        rankThresholds,
        setRankThresholds,
        questions,
        setQuestions,
        students,
        setStudents,
        pointPerQuestion,
        setPointPerQuestion,
        clearAllData,
    } = useResults();
    // Quản lý trạng thái active để chuyển tab
    const [active, setActive] = useState(0);
    const [activeSubTab, setActiveSubTab] = useState(0); // chuyển vào trong đây
    const [showPointInput, setShowPointInput] = useState(false);
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
                    return <Giaovien questions={questions} setQuestions={setQuestions} clearAllData={clearAllData} />;
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

    const Tab2 = () => <Camera results={results} setResults={setResults} questions={questions} />;
    const Tab3 = () => (
        <Ketqua
            results={results}
            points={points}
            rankThresholds={rankThresholds}
        />
    );

    return (
        <View style={styles.center}>
            <View style={{ flex: 1, display: active === 0 ? 'flex' : 'none' }}>
                <FlatList
                    data={[{ key: 'content' }]} // Mảng data giả
                    renderItem={() => (
                        <View >
                            <TouchableOpacity onPress={() => setShowPointInput(!showPointInput)} style={styles.button}>
                                <Text style={styles.buttonText}>
                                    {showPointInput ? 'Ẩn nhập điểm/câu' : 'Hiện nhập điểm/câu'}
                                </Text>
                            </TouchableOpacity>

                            {showPointInput && (
                                <View style={styles.container}>
                                    <Text style={styles.title}>Nhập số điểm/câu</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Nhập điểm số/câu VD 0.25 ..."
                                        value={pointPerQuestion}
                                        onChangeText={setPointPerQuestion}
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}

                            {/* Subtabs hoặc nội dung chính */}
                            <SubTabGiaovien labels={['Trắc nghiệm', 'Học sinh']} />
                        </View>
                    )}
                />
            </View>

            <View style={{ flex: 1, display: active === 1 ? 'flex' : 'none' }}>
                <Tab2 />
            </View>
            <View style={{ flex: 1, display: active === 2 ? 'flex' : 'none' }}>
                <ScrollView >

                    <TouchableOpacity onPress={() => setShowPointInput(!showPointInput)} style={styles.button}>
                        <Text style={styles.buttonText}>
                            {showPointInput ? 'Ẩn nhập xếp loại' : 'Hiện nhập xếp loại'}
                        </Text>
                    </TouchableOpacity>

                    {showPointInput && (
                        <View style={styles.scrollView}>
                            {/* Ngưỡng xếp loại */}
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>🔧 Ngưỡng xếp loại:</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {['gioi', 'kha', 'tb'].map((key) => (
                                    <View key={key} style={{ flex: 1, marginHorizontal: 4 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
                                            {key === 'gioi' ? '🌟 ≥ Giỏi' : key === 'kha' ? '👍 ≥ Khá' : '🙂 ≥ Trung bình'}
                                        </Text>
                                        <TextInput
                                            keyboardType="decimal-pad"
                                            value={String(rankThresholds[key] ?? '')}
                                            placeholder={
                                                key === 'gioi'
                                                    ? 'Giỏi'
                                                    : key === 'kha'
                                                        ? 'Khá'
                                                        : key === 'trungbinh'
                                                            ? 'Trung bình'
                                                            : 'Yếu'
                                            }
                                            onChangeText={(text) => setRankThresholds((prev) => ({ ...prev, [key]: text }))}
                                            style={styles.textInput}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Subtabs hoặc nội dung chính */}
                    <Tab3 />
                </ScrollView>

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
                    <Text style={[styles.tabButtonText, active === 1 && styles.activeText]}>Quét mã</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActive(2)}
                    style={[styles.tabButton, active === 2 && styles.activeTab]}
                >
                    <Text style={[styles.tabButtonText, active === 2 && styles.activeText]}>Kết quả</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
