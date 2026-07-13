import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native";

import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "RoleSelection">;

export function RoleSelectionScreen({ navigation, route }: Props) {
  const { userId } = route.params;

  return (
    <Screen
      eyebrow="Role"
      title="How will you use Style Companion?"
      subtitle="Choose the path you want to set up first. You can refine this later in account settings."
    >
      <Card>
        <Text style={screenStyles.meta}>Personal wardrobe support</Text>
        <Text style={screenStyles.cardTitle}>Customer</Text>
        <Text style={screenStyles.bodyText}>
          Take the style quiz, create your profile, and match with local style guides.
        </Text>
        <AppButton onPress={() => navigation.navigate("CustomerStyleQuiz", { userId })}>
          I need style help
        </AppButton>
      </Card>
      <Card>
        <Text style={screenStyles.meta}>Local styling practice</Text>
        <Text style={screenStyles.cardTitle}>Style guide</Text>
        <Text style={screenStyles.bodyText}>
          Build a shopper profile so customers can learn your specialties and request sessions.
        </Text>
        <AppButton variant="secondary" onPress={() => navigation.navigate("ShopperProfileCreation", { userId })}>
          I am a style guide
        </AppButton>
      </Card>
    </Screen>
  );
}
