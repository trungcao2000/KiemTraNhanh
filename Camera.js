import { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput, Alert, Vibration, Animated, ScrollView
} from 'react-native';
import { CameraView } from 'expo-camera';
import { Ketqua } from './Ketqua';
import { styles } from './Style';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import PptxGenJS from 'pptxgenjs';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
// {
//     "name": "Nguyễn Văn A",
//     "answer": "B"
//   }

export const Camera = ({ questions = [], currentIndex, setCurrentIndex, rankThresholds, setRankThresholds, clearAllData }) => {

    const [goTo, setGoTo] = useState('');
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [results, setResults] = useState([]);
    const [displayedResults, setDisplayedResults] = useState([]);
    const [activeSubTab, setActiveSubTab] = useState(0);
    const [inputTime, setInputTime] = useState('1');
    const [timeLeft, setTimeLeft] = useState(inputTime);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const countdownColor = '#ff3b30'; // đỏ cảnh báo

    const [questionTime, setQuestionTime] = useState(inputTime); // Null ban đầu
    const [showPresentation, setShowPresentation] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);


    const togglePresentation = () => {
        setShowPresentation(!showPresentation);
    };



    useEffect(() => {
        const loadData = async () => {
            try {
                const storedResults = await AsyncStorage.getItem('result');
                if (storedResults) {
                    setResults(JSON.parse(storedResults));
                }
            } catch (error) {
                console.log('❌ Lỗi khi load dữ liệu:', error);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const saveData = async () => {
            try {
                await AsyncStorage.setItem('result', JSON.stringify(results));
            } catch (error) {
                console.log('❌ Lỗi khi lưu dữ liệu:', error);
            }
        };

        saveData();
    }, [results]);

    // Khi chuyển câu hỏi → reset timeLeft
    useEffect(() => {
        if (questionTime !== 0) {
            setTimeLeft(questionTime);
        }
    }, [currentIndex, questionTime]);


    // Đếm ngược thời gian
    useEffect(() => {
        if (questionTime === 0) return; // Không giới hạn

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, questionTime]);

    // Nhấp nháy khi còn < 10 giây
    useEffect(() => {
        if (timeLeft <= 10 && timeLeft > 0) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 0.3,
                        duration: 300,
                        useNativeDriver: false,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        }
    }, [timeLeft]);

    // Rung khi còn 5 giây
    useEffect(() => {
        if (timeLeft === 5) {
            Vibration.vibrate(500);
        }
    }, [timeLeft]);


    useEffect(() => {
        const idx = parseInt(goTo) - 1; // 👈 Trừ 1 để chuyển từ "câu số" sang "index"
        if (!isNaN(idx) && idx >= 0 && idx < questions.length) {
            setCurrentIndex(idx);
        }
    }, [goTo]);



    const question = questions[currentIndex];
    if (!question) return <Text style={styles.title}>Chưa có câu hỏi nào!</Text>;




    const scannedSet = useRef(new Set());
    const timeoutMap = useRef({});

    const handleScanned = (scanned) => {
        try {
            const json = JSON.parse(scanned.data); // QR chứa { name, answer }

            // Kiểm tra tính hợp lệ của dữ liệu
            if (!json.name || !json.answer) {
                throw new Error("Dữ liệu không hợp lệ");
            }

            const question = questions[currentIndex];
            if (!question) return;

            const key = `${json.name}-${currentIndex}`;
            const correct = question.correct;
            const isCorrect = correct === json.answer;
            const bounds = scanned?.bounds?.origin ? scanned.bounds : null;

            if (scannedSet.current.has(key)) {
                // Đã quét rồi, chỉ cập nhật bounds
                setDisplayedResults(prev =>
                    prev.map(r => {
                        if (`${r.name}-${r.questionIndex}` === key) {
                            return { ...r, bounds };
                        }
                        return r;
                    })
                );
                return;
            }

            // Thêm key vào danh sách đã quét
            scannedSet.current.add(key);
            const alreadyAnswered = results.some(
                (r) => r.name === json.name && r.questionIndex === currentIndex
            );

            if (!alreadyAnswered) {
                setResults(prev => [
                    ...prev,
                    {
                        ...json,
                        question: questions[currentIndex].question,
                        questionIndex: currentIndex,
                        isCorrect,
                        points: questions[currentIndex].points,
                    },
                ]);
            }
            // Tránh thêm kết quả trùng vào displayedResults
            setDisplayedResults(prev => {
                const exists = prev.some(r => `${r.name}-${r.questionIndex}` === key);
                if (exists) return prev;
                return [
                    ...prev,
                    {
                        ...json,
                        questionIndex: currentIndex,
                        isCorrect,
                        bounds,
                    },
                ];
            });

            // Xoá overlay sau 3s
            timeoutMap.current[key] = setTimeout(() => {
                scannedSet.current.delete(key);
                setDisplayedResults(prev =>
                    prev.filter(r => `${r.name}-${r.questionIndex}` !== key)
                );
            }, 3000);

        } catch (err) {
            console.log("❌ Không đọc được QR JSON:", err);
        }
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            Object.values(timeoutMap.current).forEach(clearTimeout);
        };
    }, []);




    const goToQuestion = (newIndex) => {

        setCurrentIndex(newIndex);
    };

    const prevQuestion = () => {
        goToQuestion(Math.max(currentIndex - 1, 0));
    };

    const nextQuestion = () => {
        goToQuestion(Math.min(currentIndex + 1, questions.length - 1));
    };


    // Hàm xuất PowerPoint với tỷ lệ 16:9 và tính năng "hiện đáp án đúng"

    const exportToPowerPoint = async (questions) => {
        try {
            const pptx = new PptxGenJS();
            pptx.defineLayout({ name: '16:9', width: 16, height: 9 });
            pptx.layout = '16:9';

            questions.forEach((q, idx) => {
                const slide = pptx.addSlide();

                // Màu nền slide
                slide.background = { color: 'FFFDF6' };

                // Tiêu đề câu hỏi
                slide.addText(`📘 Câu hỏi ${idx + 1}`, {
                    x: 0.5,
                    y: 0.3,
                    fontSize: 28,
                    bold: true,
                    color: '2E74B5',
                });

                // Khung chứa câu hỏi
                slide.addShape(pptx.ShapeType.rect, {
                    x: 0.5,
                    y: 1,
                    w: 15,
                    h: 1.3,
                    fill: { color: 'DCE6F1' },
                    line: { color: '2E74B5', width: 1 }
                });

                // Nội dung câu hỏi
                slide.addText(`❓ ${q.question}`, {
                    x: 0.7,
                    y: 1.2,
                    fontSize: 22,
                    color: '000000',
                    w: 14
                });

                // Danh sách đáp án
                q.answers.forEach((a, i) => {
                    const isCorrect = a.correct === true || a.isCorrect === true; // tùy cách bạn đặt field
                    slide.addText(`${isCorrect ? '✅' : '🔘'} ${a.option}. ${a.text}`, {
                        x: 1,
                        y: 2.7 + i * 0.8,
                        fontSize: 20,
                        color: isCorrect ? '2E8B57' : '666666',
                        bold: isCorrect,
                        w: 14
                    });
                });
            });

            // Xuất file
            const pptxBuffer = await pptx.write('arraybuffer');
            const base64 = Buffer.from(pptxBuffer).toString('base64');
            const fileUri = FileSystem.documentDirectory + 'quiz.pptx';

            await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert("✅ Thành công", "File PowerPoint đã được lưu:\n" + fileUri);
            }
        } catch (error) {
            Alert.alert("❌ Lỗi", error.message);
        }
    };


    const renderCameraView = () => (
        <View style={styles.container}>
            {/* Camera */}
            <CameraView
                onBarcodeScanned={handleScanned}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                style={styles.container}
            />

            {/* Hiển thị kết quả quét */}
            {displayedResults.map((result, index) => {
                const { bounds, name, answer, isCorrect } = result;
                const origin = bounds?.origin;

                return (
                    origin && (
                        <View
                            key={index}
                            style={{
                                position: 'absolute',
                                left: origin.x,  // Nhân tỷ lệ với tọa độ x
                                top: origin.y,   // Nhân tỷ lệ với tọa độ y
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                borderRadius: 6,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderColor: isCorrect ? '#00C851' : '#FF6347',
                                borderWidth: 2,
                                shadowColor: '#000',
                                shadowOpacity: 0.2,
                                shadowOffset: { width: 1, height: 1 },
                                shadowRadius: 3,
                            }}
                        >
                            <Text style={{
                                color: isCorrect ? '#00C851' : '#FF6347',
                                fontWeight: 'bold',
                                fontSize: 16,
                            }}>
                                {name} ({answer})
                            </Text>
                        </View>
                    )
                );
            })}
            <TouchableOpacity
                onPress={() => setCameraVisible(false)}
                style={styles.button}
            >
                <Text style={styles.buttonText}>❌ Đóng</Text>
            </TouchableOpacity>

        </View>
    );

    const handleChange = (text) => {
        // Check if the input is empty
        if (text === '') {
            setGoTo('');  // If the input is empty, keep the value empty
        } else {
            const num = parseInt(text, 10);  // Convert input to a number

            // Check if the input is a valid number, and within the valid range
            if (!isNaN(num) && num > 0 && num <= questions.length) {
                setGoTo(num);  // Set the number only if it's between 1 and arrayLength
            }
        }
    };
    const renderQuestionView = () => (
        <View style={styles.center}>
            <TouchableOpacity
                onPress={() => exportToPowerPoint(questions)}
                style={styles.button}
            >
                <Text style={styles.buttonText}>📤 Xuất PowerPoint</Text>
            </TouchableOpacity>
            {/* Thiết lập thời gian cho mỗi câu */}
            <Text style={{ fontSize: 18, paddingVertical: 20 }}>
                ⏱ Nhập thời gian mỗi câu (giây): (0 để không giới hạn)
            </Text>

            <TextInput
                placeholder="Thời gian mỗi câu"
                value={inputTime}
                onChangeText={(text) => setInputTime(text)}
                style={styles.textInput}
                keyboardType='numeric'
            />

            <TouchableOpacity
                onPress={() => {
                    const t = parseInt(inputTime);
                    if (!isNaN(t) && t >= 0) {
                        setQuestionTime(t);
                        setTimeLeft(t);
                        setTimeout(() => {
                            togglePresentation();
                        }, 100);
                    } else {
                        Alert.alert("❗ Thời gian không hợp lệ", "Không được nhỏ hơn 0 hoặc nhập chữ.");
                    }
                }}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Bắt đầu</Text>
            </TouchableOpacity>



            {/* Nút mở lại camera */}
            {timeLeft === 0 && (
                <TouchableOpacity onPress={() => setCameraVisible(true)} style={styles.button}>
                    <Text style={styles.buttonText}>📷 Mở camera</Text>
                </TouchableOpacity>
            )}

            {/* Đồng hồ đếm ngược */}
            {questionTime !== 0 ? (
                <Animated.Text
                    style={[
                        styles.timer,
                        {
                            color: timeLeft <= 10 ? countdownColor : '#222',
                            fontWeight: 'bold',
                            fontSize: 24,
                            marginBottom: 16,
                            textAlign: 'center',
                            opacity: timeLeft <= 10 ? fadeAnim : 1,
                        },
                    ]}
                >
                    {timeLeft === 0 ? '⏰ Hết thời gian' : `⏳ Còn ${timeLeft} giây`}
                </Animated.Text>
            ) : (
                <Text style={{ textAlign: 'center', color: '#777', marginBottom: 12 }}>
                    ⏱ Không giới hạn thời gian cho mỗi câu.
                </Text>
            )}
            {/* Nhập số câu muốn chuyển đến */}

            <TextInput
                placeholder="Di chuyển tới câu"
                keyboardType="numeric"
                value={goTo === '' ? '' : String(goTo)}  // Show empty if goTo is empty
                onChangeText={handleChange}  // Use the custom handleChange function
                style={styles.textInput}
            />

            {/* Câu hỏi */}
            <Text style={styles.subtitle}>
                Câu {currentIndex + 1}: {question?.question ?? ''}
            </Text>
            {/* Đáp án 2 cột */}
            {Array.from({ length: Math.ceil(question?.answers?.length / 2) }).map((_, rowIndex) => {
                const rowAnswers = question.answers.slice(rowIndex * 2, rowIndex * 2 + 2);
                return (
                    <View
                        key={rowIndex}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: 12,
                            marginBottom: 16,
                        }}
                    >
                        {rowAnswers.map((opt) => {
                            const isSelected = selectedAnswer === opt.option;
                            const isCorrect = question.correct === opt.option;
                            const borderColor = isSelected
                                ? isCorrect
                                    ? '#4CAF50'
                                    : '#FF5252'
                                : '#ccc';
                            const textColor = isSelected
                                ? isCorrect
                                    ? '#4CAF50'
                                    : '#FF5252'
                                : '#222';

                            return (
                                <View key={opt.option} style={{ flexBasis: '48%' }}>
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() =>
                                            setSelectedAnswer((prev) => (prev === opt.option ? null : opt.option))
                                        }
                                        style={{
                                            backgroundColor: isSelected ? 'rgba(98, 0, 238, 0.06)' : '#fff',
                                            borderColor,
                                            borderWidth: 2,
                                            borderRadius: 12,
                                            paddingVertical: 14,
                                            paddingHorizontal: 16,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                                            elevation: 3,
                                        }}
                                    >
                                        <Text style={{ fontSize: 16, fontWeight: '500', color: textColor }}>
                                            {opt.option}. {opt.text}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                );
            })}

            {/* Điều hướng */}
            <View style={[styles.answerButton, { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }]}>
                <TouchableOpacity
                    onPress={prevQuestion}
                    disabled={currentIndex === 0}
                    style={[styles.button, { opacity: currentIndex === 0 ? 0.5 : 1 }]}
                >
                    <Text style={styles.buttonText}>← Trước</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={nextQuestion}
                    disabled={currentIndex === questions.length - 1}
                    style={[styles.button, { opacity: currentIndex === questions.length - 1 ? 0.5 : 1 }]}
                >
                    <Text style={styles.buttonText}>Tiếp →</Text>
                </TouchableOpacity>
            </View>



        </View>
    );


    const SubTabCamera = ({ labels }) => {
        const renderContent = () => {
            switch (activeSubTab) {
                case 0:
                    return <View style={styles.container}>{renderQuestionView()}</View>;
                case 1:
                    return <Ketqua results={results} setResults={setResults} rankThresholds={rankThresholds} setRankThresholds={setRankThresholds} clearAllData={clearAllData} />;

                default:
                    return <Text>Không có nội dung</Text>;
            }
        };

        return (
            <View style={styles.container}>
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

    return (

        <View style={styles.container}>
            {cameraVisible ? (
                renderCameraView()
            ) : (
                <SubTabCamera labels={['Quét Mã', 'Kết Quả']} />
            )}
        </View>
    );
};



