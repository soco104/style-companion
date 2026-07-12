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
    fontSize: 14,
    fontWeight: "800"
  },
  pill: {
    backgroundColor: theme.colors.cream,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    minHeight: 44,
    paddingHorizontal: 15,
    paddingVertical: 11
  },
  selected: {
    backgroundColor: theme.colors.softPrimary,
    borderColor: theme.colors.clay
  },
  selectedLabel: {
    color: theme.colors.primaryDark
  }
});
