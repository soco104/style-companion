import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { theme } from "../theme";

type CardProps = {
  children: ReactNode;
};

export function Card({ children }: CardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md
  }
});
