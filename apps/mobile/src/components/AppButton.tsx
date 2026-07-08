import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../theme";

type AppButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
};

export function AppButton({
  children,
  disabled = false,
  loading = false,
  onPress,
  variant = "primary"
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#ffffff" : theme.colors.primary} />
      ) : (
        <Text style={[styles.label, variant !== "primary" && styles.secondaryLabel]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12
  },
  disabled: {
    opacity: 0.55
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  label: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.82
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  secondary: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border
  },
  secondaryLabel: {
    color: theme.colors.primary
  }
});
