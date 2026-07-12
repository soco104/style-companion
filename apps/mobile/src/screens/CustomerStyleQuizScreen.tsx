import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Card } from "../components/Card";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "CustomerStyleQuiz">;

const occasions = ["Work", "Weekend", "Events", "Travel"];
const colors = ["Navy", "Cream", "Olive", "Black", "Denim"];

const toggle = (items: string[], item: string) =>
  items.includes(item) ? items.filter((value) => value !== item) : [...items, item];

export function CustomerStyleQuizScreen({ navigation, route }: Props) {
  const [selectedOccasions, setSelectedOccasions] = useState(["Work"]);
  const [selectedColors, setSelectedColors] = useState(["Navy", "Cream"]);
  const [goals, setGoals] = useState("Build polished outfits I can repeat.");
  const [budget, setBudget] = useState("600");
  const [fitConcerns, setFitConcerns] = useState("Comfortable fit and petite-friendly options.");
  const [sizingNotes, setSizingNotes] = useState("Usually XS/S tops and petite trousers.");

  const continueToProfile = () => {
    navigation.navigate("CustomerProfile", {
      quizDraft: {
        additionalNotes: goals,
        budgetMaxCents: Number(budget || "0") * 100,
        colorPreferences: selectedColors,
        fitConcerns,
        preferredOccasions: selectedOccasions,
        sizingNotes,
        styleGoals: {
          summary: goals
        }
      },
      userId: route.params.userId
    });
  };

  return (
    <Screen
      eyebrow="Style quiz"
      title="Tell us what you want help with."
      subtitle="A few practical details help us surface guides who fit your goals."
    >
      <Card>
        <Text style={screenStyles.meta}>Style direction</Text>
        <AppTextInput label="Primary goal" multiline onChangeText={setGoals} value={goals} />
        <View style={screenStyles.pillRow}>
          {occasions.map((occasion) => (
            <ChoicePill
              key={occasion}
              label={occasion}
              onPress={() => setSelectedOccasions((current) => toggle(current, occasion))}
              selected={selectedOccasions.includes(occasion)}
            />
          ))}
        </View>
        <View style={screenStyles.pillRow}>
          {colors.map((color) => (
            <ChoicePill
              key={color}
              label={color}
              onPress={() => setSelectedColors((current) => toggle(current, color))}
              selected={selectedColors.includes(color)}
            />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={screenStyles.meta}>Fit and budget</Text>
        <AppTextInput keyboardType="number-pad" label="Max shopping budget" onChangeText={setBudget} value={budget} />
        <AppTextInput label="Fit concerns" multiline onChangeText={setFitConcerns} value={fitConcerns} />
        <AppTextInput label="Sizing notes" multiline onChangeText={setSizingNotes} value={sizingNotes} />
      </Card>
      <AppButton onPress={continueToProfile}>Continue to profile</AppButton>
    </Screen>
  );
}
