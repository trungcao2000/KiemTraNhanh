
import {
    StyleSheet,
} from 'react-native';
// Styles

// Colors
const primaryColor = '#3498db'; // Primary color
const textColor = '#222'; // Dark text for readability
const mutedColor = '#666'; // Lighter text color for secondary text
const borderRadius = 12; // Consistent border radius

export const styles = StyleSheet.create({
    // Layout
    center: {
        flex: 1,
        marginVertical: 25,
        marginHorizontal: 5,

    },
    container: {
        flex: 1,
    },

    // Typography
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: textColor,
    },
    subtitle: {
        fontSize: 16,
        color: mutedColor,
        textAlign: 'center',
    },
    // paragraph: {
    //     fontSize: 14,
    //     color: '#555',
    //     textAlign: 'center',
    //     lineHeight: 24,
    // },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        marginVertical: '10%',
        padding: 20,
        borderRadius,
        elevation: 10,


        // Optional: If it's not filling the whole screen

        maxWidth: 400, // Ensure modal doesn't stretch too wide
    },

    // Input
    textInput: {
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 4,
        margin: 5,
        paddingVertical: 10,
        paddingHorizontal: 10,
        fontSize: 14,
        backgroundColor: '#fff',
    },

    // Buttons
    button: {
        backgroundColor: primaryColor,
        borderRadius,
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',

    },


    answerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ccc',
        marginBottom: 10,
        elevation: 2,
    },
    circle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    innerCircleSelected: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: primaryColor,
    },

    // Sub Tab
    subTabBar: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius,
        overflow: 'hidden',
    },
    subTabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    subTabButtonActive: {
        backgroundColor: '#fff',
        elevation: 2,
    },
    subTabText: {
        color: mutedColor,
        fontSize: 14,
        fontWeight: '500',
    },
    subTabTextActive: {
        color: primaryColor,
        fontWeight: '700',
    },

    // Info Card
    infoCard: {
        backgroundColor: '#f8f8f8',
        borderRadius,
        padding: 16,
        width: '100%',
        marginBottom: 16,
        elevation: 2,
    },
    infoText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 6,
    },

    // List
    listItem: {
        fontSize: 16,
        color: '#444',
        marginVertical: 8,
        paddingLeft: 16,
    },

    // Utility
    functionSection: {
        width: '100%',
        marginBottom: 24,
    },
    subheader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    card: {
        marginBottom: 20,
        alignItems: 'center',
    },

    // Modal buttons
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius,
    },
    option: {
        padding: 10,
    },
    closeButton: {
        paddingTop: 20,
    },

    // Bottom Tab
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingVertical: 12,
        justifyContent: 'space-around',
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: primaryColor,
    },
    tabButtonText: {
        color: '#666',
        fontSize: 14,
    },
    activeText: {
        color: primaryColor,
        fontWeight: 'bold',
    },
    studentContainer: {
        marginBottom: 20, // Giảm khoảng cách giữa các học sinh
    },
    studentName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    qrContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // Đảm bảo có khoảng cách đều giữa các phần tử
        alignItems: 'flex-start', // Căn đầu theo chiều dọc
        paddingHorizontal: 4, // Giảm khoảng cách padding bên ngoài để giảm không gian trống
    },
    qrBox: {
        width: '48%', // Đảm bảo 2 phần tử trên mỗi dòng
        padding: 12, // Giảm padding bên trong
        marginVertical: 6, // Tăng khoảng cách giữa các box QR
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2, // Thêm shadow cho box
        marginHorizontal: 4, // Giảm khoảng cách giữa các box để các phần tử không quá tách rời
    },
    qrText: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 10,
        transform: [{ rotate: '180deg' }],
        textAlign: 'center',
    },
    qrImage: {
        width: 120,
        height: 120,
    },
    qrFooterText: {
        fontSize: 13,
        fontStyle: 'italic',
        marginTop: 10,
        textAlign: 'center',
    },

});