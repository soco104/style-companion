import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";

import { theme } from "../theme";

type AppTextInputProps = TextInputProps & {
  label: string;
};

export function AppTextInput({ label, style, ...props }: AppTextInputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6
  },
  wrap: {
    marginBottom: theme.spacing.md
  }
});
