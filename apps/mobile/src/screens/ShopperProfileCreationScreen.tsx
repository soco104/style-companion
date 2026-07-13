import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, View } from "react-native";

import { apiClient } from "../api/client";
import { setCurrentShopperProfile } from "../api/sessionStore";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Card } from "../components/Card";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "ShopperProfileCreation">;

const defaultAvailabilityDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().slice(0, 10);
};

const dateOptions = () =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().slice(0, 10);
  });

const timeOptions = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const dateTimeFromParts = (datePart: string, timePart: string) => {
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(hour, minute ?? 0, 0, 0);
  return date.toISOString();
};

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short"
  }).format(new Date(`${value}T12:00:00`));

export function ShopperProfileCreationScreen({ navigation, route }: Props) {
  const [availabilityDate, setAvailabilityDate] = useState(defaultAvailabilityDate());
  const [availabilityEnd, setAvailabilityEnd] = useState("17:00");
  const [availabilityStart, setAvailabilityStart] = useState("15:00");
  const [bio, setBio] = useState("I help clients build flexible outfits they can recreate on their own.");
  const [city, setCity] = useState("Nashville");
  const [error, setError] = useState<string | null>(null);
  const [headline, setHeadline] = useState("Practical wardrobe edits for busy professionals");
  const [hourlyRate, setHourlyRate] = useState("85");
  const [loading, setLoading] = useState(false);
  const [packageDescription, setPackageDescription] = useState("Two focused sessions for closet editing and outfit planning.");
  const [packageSessions, setPackageSessions] = useState("2");
  const [packageTitle, setPackageTitle] = useState("Closet Refresh");
  const [preferredBrands, setPreferredBrands] = useState("Madewell, Everlane, Quince");
  const [radius, setRadius] = useState("20");
  const [state, setState] = useState("TN");
  const [styleTags, setStyleTags] = useState("tailored, capsule, workwear");

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const hourlyRateCents = Number(hourlyRate || "0") * 100;
      const sessionCount = Math.max(1, Number(packageSessions || "1"));
      const profile = await apiClient.createShopperProfile({
        bio,
        city,
        headline,
        hourlyRateCents,
        serviceRadiusMiles: Number(radius || "0"),
        state,
        userId: route.params.userId
      });
      setCurrentShopperProfile(profile);
      await Promise.all([
        apiClient.createPricingPackage(profile.id, {
          description: packageDescription,
          ownerUserId: route.params.userId,
          pricePerSessionCents: hourlyRateCents,
          sessionCount,
          title: packageTitle,
          totalPriceCents: hourlyRateCents * sessionCount
        }),
        apiClient.addAvailabilitySlot(profile.id, {
          endsAt: dateTimeFromParts(availabilityDate, availabilityEnd),
          ownerUserId: route.params.userId,
          shopperProfileId: profile.id,
          startsAt: dateTimeFromParts(availabilityDate, availabilityStart),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }),
        apiClient.createShopperStylePreference(profile.id, {
          ownerUserId: route.params.userId,
          preferredBrands: splitList(preferredBrands),
          styleTags: splitList(styleTags)
        })
      ]);
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
      <Card>
        <Text style={screenStyles.cardTitle}>Pricing package</Text>
        <AppTextInput label="Package title" onChangeText={setPackageTitle} value={packageTitle} />
        <AppTextInput keyboardType="number-pad" label="Session count" onChangeText={setPackageSessions} value={packageSessions} />
        <AppTextInput label="Description" multiline onChangeText={setPackageDescription} value={packageDescription} />
      </Card>
      <Card>
        <Text style={screenStyles.cardTitle}>Availability</Text>
        <View style={screenStyles.pillRow}>
          {dateOptions().map((date) => (
            <ChoicePill
              key={date}
              label={formatDateLabel(date)}
              onPress={() => setAvailabilityDate(date)}
              selected={date === availabilityDate}
            />
          ))}
        </View>
        <Text style={screenStyles.bodyText}>Start</Text>
        <View style={screenStyles.pillRow}>
          {timeOptions.map((time) => (
            <ChoicePill
              key={time}
              label={time}
              onPress={() => setAvailabilityStart(time)}
              selected={time === availabilityStart}
            />
          ))}
        </View>
        <Text style={screenStyles.bodyText}>End</Text>
        <View style={screenStyles.pillRow}>
          {timeOptions.map((time) => (
            <ChoicePill
              key={time}
              label={time}
              onPress={() => setAvailabilityEnd(time)}
              selected={time === availabilityEnd}
            />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={screenStyles.cardTitle}>Preferred styles</Text>
        <AppTextInput label="Style tags" onChangeText={setStyleTags} value={styleTags} />
        <AppTextInput label="Preferred brands" onChangeText={setPreferredBrands} value={preferredBrands} />
      </Card>
      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      <AppButton loading={loading} onPress={submit}>
        Save shopper profile
      </AppButton>
    </Screen>
  );
}
