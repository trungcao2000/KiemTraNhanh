
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
        paddingVertical: 20,
        marginHorizontal: 5
    },
    container: {
        flex: 1,
    },

    // Typography
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: textColor,

        marginVertical: 5,
    },
    subtitle: {
        fontSize: 16,
        color: mutedColor,
        textAlign: 'center',
        marginVertical: 12,
    },
    paragraph: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 16,
    },

    // Modal
    modalOverlay: {
        flex: 1,

        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius,
        marginHorizontal: 30,
        elevation: 10,
        maxWidth: 400, // Ensure modal doesn't stretch too wide
    },

    // Input
    textInput: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#fff',
        width: '100%',
        marginBottom: 20,
    },

    // Buttons
    button: {
        backgroundColor: primaryColor,
        borderRadius,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginVertical: 10,
        elevation: 5,
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

    // Answer options
    answerOptions: {
        marginBottom: 16,
    },
    answerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ccc',
        marginBottom: 12,
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
        marginVertical: 10,
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
        padding: 20,
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
});