import { StyleSheet } from "react-native";

import { theme } from "../theme";

export const screenStyles = StyleSheet.create({
  bodyText: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  buttonStack: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: theme.spacing.xs
  },
  error: {
    color: theme.colors.warning,
    fontSize: 14,
    lineHeight: 20
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
    textTransform: "uppercase"
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.md
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md
  }
});
