import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../theme";

type ScreenProps = {
  children: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title?: string;
};

export function Screen({ children, eyebrow, subtitle, title }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: theme.spacing.sm
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl
  },
  eyebrow: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: theme.spacing.sm,
    textTransform: "uppercase"
  },
  safe: {
    backgroundColor: theme.colors.background,
    flex: 1
  },
  header: {
    backgroundColor: theme.colors.cardWarm,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 25
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: "800",
    lineHeight: 40,
    marginBottom: theme.spacing.sm
  }
});
