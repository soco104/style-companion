import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, View } from "react-native";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Review">;

export function ReviewScreen({ navigation, route }: Props) {
  const { booking, customerProfileId, shopper } = route.params;
  const [body, setBody] = useState("My guide made shopping feel calm and practical.");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await apiClient.createReview(booking.id, {
        body,
        customerProfileId,
        rating,
        shopperProfileId: shopper.id
      });
      setSubmitted(true);
    } catch {
      setError("Reviews can be submitted only after completed bookings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      eyebrow="Review"
      title={`Review ${shopper.name}`}
      subtitle="Customer reviews require moderation before publication. Shoppers can respond after a review exists."
    >
      {submitted ? (
        <>
          <Text style={screenStyles.cardTitle}>Thanks for the review.</Text>
          <Text style={screenStyles.bodyText}>It will be queued for moderation.</Text>
          <AppButton onPress={() => navigation.navigate("Account")}>Done</AppButton>
        </>
      ) : (
        <>
          <View style={screenStyles.pillRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <ChoicePill
                key={value}
                label={`${value}`}
                onPress={() => setRating(value)}
                selected={rating === value}
              />
            ))}
          </View>
          <AppTextInput label="Review" multiline onChangeText={setBody} value={body} />
          {error ? <Text style={screenStyles.error}>{error}</Text> : null}
          <AppButton loading={loading} onPress={submit}>
            Submit review
          </AppButton>
        </>
      )}
    </Screen>
  );
}
