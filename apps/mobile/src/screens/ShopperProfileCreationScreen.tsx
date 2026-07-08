import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text } from "react-native";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "ShopperProfileCreation">;

export function ShopperProfileCreationScreen({ navigation, route }: Props) {
  const [bio, setBio] = useState("I help clients build flexible outfits they can recreate on their own.");
  const [city, setCity] = useState("Nashville");
  const [error, setError] = useState<string | null>(null);
  const [headline, setHeadline] = useState("Practical wardrobe edits for busy professionals");
  const [hourlyRate, setHourlyRate] = useState("85");
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState("20");
  const [state, setState] = useState("TN");

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await apiClient.createShopperProfile({
        bio,
        city,
        headline,
        hourlyRateCents: Number(hourlyRate || "0") * 100,
        serviceRadiusMiles: Number(radius || "0"),
        state,
        userId: route.params.userId
      });
      navigation.navigate("Account");
    } catch {
      setError("We could not save your shopper profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      eyebrow="Style guide profile"
      title="Create your guide profile."
      subtitle="Customers need a clear sense of where you work, what you teach, and how you price sessions."
    >
      <Card>
        <Text style={screenStyles.bodyText}>
          Payment and identity verification are placeholders in this MVP. Business rules still live in the backend.
        </Text>
      </Card>
      <AppTextInput label="Headline" onChangeText={setHeadline} value={headline} />
      <AppTextInput label="Bio" multiline onChangeText={setBio} value={bio} />
      <AppTextInput label="City" onChangeText={setCity} value={city} />
      <AppTextInput autoCapitalize="characters" label="State" onChangeText={setState} value={state} />
      <AppTextInput keyboardType="number-pad" label="Hourly rate" onChangeText={setHourlyRate} value={hourlyRate} />
      <AppTextInput keyboardType="number-pad" label="Service radius miles" onChangeText={setRadius} value={radius} />
      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      <AppButton loading={loading} onPress={submit}>
        Save shopper profile
      </AppButton>
    </Screen>
  );
}
