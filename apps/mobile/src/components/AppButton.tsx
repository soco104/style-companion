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
        <ActivityIndicator color={variant === "primary" ? theme.colors.cream : theme.colors.primary} />
      ) : (
        <Text style={[styles.label, variant !== "primary" && styles.secondaryLabel]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    elevation: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 13,
    shadowColor: theme.colors.charcoal,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 10
  },
  disabled: {
    opacity: 0.55
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent"
  },
  label: {
    color: theme.colors.cream,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0
  },
  pressed: {
    opacity: 0.82
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  secondary: {
    backgroundColor: theme.colors.softGold,
    borderColor: theme.colors.gold
  },
  secondaryLabel: {
    color: theme.colors.primaryDark
  }
});
