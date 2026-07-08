import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "../theme";

type ChoicePillProps = {
  label: string;
  onPress: () => void;
  selected: boolean;
};

export function ChoicePill({ label, onPress, selected }: ChoicePillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.pill, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.text,
    fontWeight: "700"
  },
  pill: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  selected: {
    backgroundColor: theme.colors.softPrimary,
    borderColor: theme.colors.primary
  },
  selectedLabel: {
    color: theme.colors.primaryDark
  }
});
