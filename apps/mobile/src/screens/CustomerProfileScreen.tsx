import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text } from "react-native";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "CustomerProfile">;

export function CustomerProfileScreen({ navigation, route }: Props) {
  const [bio, setBio] = useState("Refreshing my work wardrobe after a career change.");
  const [city, setCity] = useState("Nashville");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pronouns, setPronouns] = useState("she/her");
  const [state, setState] = useState("TN");

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const profile = await apiClient.createCustomerProfile({
        bio,
        city,
        pronouns,
        state,
        userId: route.params.userId
      });
      await apiClient.createStyleQuiz({
        ...route.params.quizDraft,
        customerProfileId: profile.id
      });
      navigation.navigate("ShopperMatchList", { customerProfileId: profile.id });
    } catch {
      setError("We could not save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      eyebrow="Customer profile"
      title="Where should guides meet you?"
      subtitle="This profile keeps local matching grounded in real places and preferences."
    >
      <AppTextInput label="City" onChangeText={setCity} value={city} />
      <AppTextInput autoCapitalize="characters" label="State" onChangeText={setState} value={state} />
      <AppTextInput label="Pronouns" onChangeText={setPronouns} value={pronouns} />
      <AppTextInput label="Profile note" multiline onChangeText={setBio} value={bio} />
      <AppButton
        variant="secondary"
        onPress={() =>
          navigation.navigate("WardrobeGallery", {
            canAdd: true,
            ownerRole: "CUSTOMER",
            title: "My wardrobe",
            userId: route.params.userId,
            visibility: "PRIVATE"
          })
        }
      >
        Add wardrobe photos
      </AppButton>
      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      <AppButton loading={loading} onPress={submit}>
        Find style guides
      </AppButton>
    </Screen>
  );
}
