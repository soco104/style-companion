import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text } from "react-native";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { formatCents } from "../utils/format";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "BookingRequest">;

const tomorrowAt = (hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export function BookingRequestScreen({ navigation, route }: Props) {
  const { customerProfileId, shopper } = route.params;
  const [city, setCity] = useState(shopper.city);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState("Build polished work outfits that mix and match.");
  const [locationName, setLocationName] = useState("Green Hills Mall");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("I want help finding work outfits that mix and match.");
  const [state, setState] = useState(shopper.state);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const booking = await apiClient.createBooking({
        city,
        budgetCents: 60000,
        customerNotes: notes,
        customerProfileId,
        goal,
        locationName,
        scheduledEndAt: tomorrowAt(17),
        scheduledStartAt: tomorrowAt(15),
        shopperProfileId: shopper.id,
        state,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        totalPriceCents: shopper.hourlyRateCents * 2
      });
      navigation.navigate("BookingStatus", { booking, customerProfileId, shopper });
    } catch {
      setError("We could not request this booking. Please try another time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      eyebrow="Booking"
      title={`Request ${shopper.name}`}
      subtitle="The backend owns booking status rules. This request starts as REQUESTED."
    >
      <Card>
        <Text style={screenStyles.cardTitle}>Session estimate</Text>
        <Text style={screenStyles.bodyText}>Tomorrow, 3:00 PM to 5:00 PM</Text>
        <Text style={screenStyles.bodyText}>{formatCents(shopper.hourlyRateCents * 2)} estimated total</Text>
      </Card>
      <AppTextInput label="Meeting place" onChangeText={setLocationName} value={locationName} />
      <AppTextInput label="Session goal" multiline onChangeText={setGoal} value={goal} />
      <AppTextInput label="City" onChangeText={setCity} value={city} />
      <AppTextInput autoCapitalize="characters" label="State" onChangeText={setState} value={state} />
      <AppTextInput label="Notes for guide" multiline onChangeText={setNotes} value={notes} />
      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      <AppButton loading={loading} onPress={submit}>
        Send request
      </AppButton>
    </Screen>
  );
}
