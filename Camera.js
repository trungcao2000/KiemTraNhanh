import { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput, Alert, Vibration, Animated
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { styles } from './Style';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import PptxGenJS from 'pptxgenjs';
import { Buffer } from 'buffer';

// {
//     "name": "Nguyễn Văn A",
//     "answer": "B"
//   }

export const Camera = ({ results, setResults, questions = [] }) => {

    const [currentIndex, setCurrentIndex] = useState(0);
    // const [answers, setAnswers] = useState({});
    const [goTo, setGoTo] = useState('');
    const [selectedAnswer, setSelectedAnswer] = useState(null);


    const [inputTime, setInputTime] = useState('0');
    const [timeLeft, setTimeLeft] = useState(inputTime);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const countdownColor = '#ff3b30'; // đỏ cảnh báo

    const [questionTime, setQuestionTime] = useState(inputTime); // Null ban đầu
    const [showPresentation, setShowPresentation] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);

    const [permission, requestPermission] = useCameraPermissions();
    const scannedSet = useRef(new Set());
    const [displayedResults, setDisplayedResults] = useState([]);

    const togglePresentation = () => {
        setShowPresentation(!showPresentation);
    };

    const timeoutMap = useRef({}); // Lưu timer theo key

    useEffect(() => {
        const latest = {};

        results.forEach((res) => {
            const key = `${res.name}-${currentIndex}`;
            latest[key] = res;
        });

        // Gộp thêm bounds từ displayedResults nếu có
        const merged = Object.values(latest).map((res) => {
            const match = displayedResults.find(r => r.name === res.name && r.question === res.question);
            return match ? { ...res, bounds: match.bounds } : res;
        });

        setDisplayedResults(merged);
    }, [results, currentIndex]);

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
        if (!permission) {
            requestPermission();
        }
    }, []);


    useEffect(() => {
        const idx = parseInt(goTo) - 1; // 👈 Trừ 1 để chuyển từ "câu số" sang "index"
        if (!isNaN(idx) && idx >= 0 && idx < questions.length) {
            setCurrentIndex(idx);
        }
    }, [goTo]);


    // const handleAnswer = (selectedOption) => {
    //     setAnswers({ ...answers, [currentIndex]: selectedOption });
    // };


    const question = questions[currentIndex];
    if (!question) return <Text>Chưa có câu hỏi nào!</Text>;


    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>Ứng dụng cần quyền truy cập camera</Text>

                <TouchableOpacity
                    onPress={requestPermission}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>
                        Cấp quyền
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }


    const handleScanned = (scanned) => {
        try {
            const json = JSON.parse(scanned.data); // QR chứa { name, answer }
            const key = `${json.name}-${currentIndex}`;
            const correct = questions[currentIndex]?.correct;
            const isCorrect = correct === json.answer;
            const bounds = scanned?.bounds?.origin ? scanned.bounds : null;

            const alreadyAnswered = results.some(
                (r) => r.name === json.name && r.questionIndex === currentIndex
            );

            if (scannedSet.current.has(key)) {
                // 🔁 Đã quét rồi trong phiên hiện tại → chỉ cập nhật bounds nếu có
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

            // Thêm key vào bộ theo dõi tạm thời
            scannedSet.current.add(key);

            // 👉 Nếu chưa từng trả lời ở câu này thì mới ghi vào results
            if (!alreadyAnswered) {
                setResults(prev => [
                    ...prev,
                    {
                        ...json,
                        question: questions[currentIndex].question,
                        questionIndex: currentIndex,
                        isCorrect,
                    },
                ]);
            }

            // Hiển thị overlay tạm thời
            setDisplayedResults(prev => [
                ...prev,
                {
                    ...json,
                    question: questions[currentIndex].question,
                    questionIndex: currentIndex,
                    isCorrect,
                    bounds,
                },
            ]);

            // Tự động xoá overlay sau 5s (không xoá result thật)
            timeoutMap.current[key] = setTimeout(() => {
                scannedSet.current.delete(key);
                setDisplayedResults(prev =>
                    prev.filter(r => `${r.name}-${r.questionIndex}` !== key)
                );
            }, 3000);

        } catch (err) {
            console.log("Không đọc được QR JSON:", err);
        }
    };


    const prevQuestion = () => {
        scannedSet.current.clear();

        setCurrentIndex(prev => {
            const newIndex = Math.max(prev - 1, 0); // Không nhỏ hơn 0
            // const overlays = results.filter(r => r.questionIndex === newIndex && r.bounds);
            // setDisplayedResults(overlays);
            return newIndex;
        });
    };

    const nextQuestion = () => {
        scannedSet.current.clear();

        setCurrentIndex(prev => {
            const newIndex = Math.min(prev + 1, questions.length - 1); // Không vượt quá tổng câu hỏi
            // const overlays = results.filter(r => r.questionIndex === newIndex && r.bounds);
            // setDisplayedResults(overlays);
            return newIndex;
        });
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
        <View style={{ flex: 1 }}>
            {/* Nút đóng camera */}
            <TouchableOpacity
                onPress={() => setCameraVisible(false)}
                style={styles.button}
            >
                <Text style={styles.buttonText}>❌ Đóng</Text>
            </TouchableOpacity>

            {/* Camera */}
            <CameraView
                style={{ flex: 1 }}
                onBarcodeScanned={handleScanned}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />

            {/* Hiển thị kết quả quét */}
            {displayedResults.map((result, index) => {
                const { bounds, name, answer, isCorrect } = result;
                const origin = bounds?.origin;
                if (!origin) return null;

                return (
                    <View
                        key={index}
                        style={{
                            position: 'absolute',
                            left: origin.x,
                            top: origin.y,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            borderRadius: 6,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderColor: isCorrect ? 'green' : 'red',
                            borderWidth: 2,
                        }}
                    >
                        <Text style={{ color: isCorrect ? 'green' : 'red', fontWeight: 'bold' }}>
                            {name} ({answer})
                        </Text>
                    </View>
                );
            })}
        </View>
    );

    const renderQuestionView = () => (
        <View style={{ flex: 1 }}>
            {/* Thiết lập thời gian cho mỗi câu */}
            <Text style={{ fontSize: 18, paddingVertical: 20 }}>
                ⏱ Nhập thời gian mỗi câu (giây): (0 để không giới hạn)
            </Text>

            <TextInput
                placeholder="Thời gian mỗi câu"
                value={inputTime}
                onChangeText={(text) => setInputTime(text)}
                style={styles.textInput}
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
                value={goTo - 1}
                onChangeText={setGoTo}
                style={styles.textInput}
            />

            {/* Câu hỏi */}
            <Text style={styles.subtitle}>
                Câu {currentIndex + 1}: {question.question}
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
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 4,
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
                    onPress={() => exportToPowerPoint(questions)}
                    style={{ paddingVertical: 10, alignItems: 'center' }}
                >
                    <Text style={{ fontSize: 16, color: '#2196F3' }}>📤 Xuất file PowerPoint</Text>
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

    return (

        <View style={{ flex: 1, margin: 5, padding: 5 }}>{cameraVisible ? (renderCameraView()) : (renderQuestionView())}</View>

    );
};



