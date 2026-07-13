import { StyleSheet } from "react-native";

import { theme } from "../theme";

export const screenStyles = StyleSheet.create({
  bodyText: {
    color: theme.colors.muted,
    fontSize: theme.typography.body,
    lineHeight: 23
  },
  buttonStack: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: "800",
    lineHeight: 26,
    marginBottom: theme.spacing.xs
  },
  error: {
    color: theme.colors.warning,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22
  },
  explanationItem: {
    color: theme.colors.muted,
    fontSize: theme.typography.caption,
    lineHeight: 20
  },
  explanationList: {
    backgroundColor: theme.colors.cardWarm,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm
  },
  inlineFields: {
    gap: theme.spacing.sm
  },
  itemBlock: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.md
  },
  itemTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22
  },
  photoPreview: {
    aspectRatio: 4 / 3,
    backgroundColor: theme.colors.cardWarm,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    width: "100%"
  },
  meta: {
    color: theme.colors.primaryDark,
    fontSize: theme.typography.caption,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
    textTransform: "uppercase"
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs
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
  },
  tonalPanel: {
    backgroundColor: theme.colors.cardWarm,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md
  }
});
