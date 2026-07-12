import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen
      eyebrow="Style Companion"
      title="Shop smarter with a local style guide."
      subtitle="Get in-person wardrobe help from guides who teach you how to shop and style yourself."
    >
      <View style={screenStyles.tonalPanel}>
        <Text style={screenStyles.meta}>Warm, practical, personal</Text>
        <Text style={screenStyles.bodyText}>
          A calmer way to plan outfits, understand your closet, and book hands-on support nearby.
        </Text>
      </View>
      <Card>
        <Text style={screenStyles.cardTitle}>MVP preview</Text>
        <Text style={screenStyles.bodyText}>
          Browse guides, request a session, track booking status, and leave a review after a completed visit.
        </Text>
      </Card>
      <AppButton onPress={() => navigation.navigate("Auth")}>Get started</AppButton>
      <AppButton variant="secondary" onPress={() => navigation.navigate("Account")}>
        Account settings
      </AppButton>
    </Screen>
  );
}
