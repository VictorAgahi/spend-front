import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface ActionButtonProps {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
    disabled?: boolean;
}

export function ActionButton({
    label,
    onPress,
    variant = "primary",
    disabled = false,
}: ActionButtonProps): React.JSX.Element {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === "secondary" ? styles.secondary : styles.primary,
                disabled && styles.disabled,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled}
        >
            <Text
                style={[
                    styles.label,
                    variant === "secondary" ? styles.secondaryLabel : styles.primaryLabel,
                    disabled && styles.disabledLabel,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    primary: {
        backgroundColor: "#4f46e5",
    },
    secondary: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: "#4f46e5",
    },
    disabled: {
        backgroundColor: "#e5e7eb",
        borderColor: "#e5e7eb",
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
    },
    primaryLabel: {
        color: "#ffffff",
    },
    secondaryLabel: {
        color: "#4f46e5",
    },
    disabledLabel: {
        color: "#9ca3af",
    },
});
