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
    backgroundColor: theme.colors.cream,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  label: {
    color: theme.colors.primaryDark,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 7
  },
  wrap: {
    marginBottom: theme.spacing.md
  }
});
