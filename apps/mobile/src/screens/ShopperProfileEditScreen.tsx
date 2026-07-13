import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { apiClient } from "../api/client";
import type { ShopperProfile } from "../api/types";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Card } from "../components/Card";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "ShopperProfileEdit">;

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

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

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short"
  }).format(new Date(`${value}T12:00:00`));

export function ShopperProfileEditScreen({ navigation, route }: Props) {
  const { shopperProfileId, userId } = route.params;
  const [availabilityDate, setAvailabilityDate] = useState(dateOptions()[0]);
  const [availabilityEnd, setAvailabilityEnd] = useState("17:00");
  const [availabilityStart, setAvailabilityStart] = useState("15:00");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [hourlyRate, setHourlyRate] = useState("85");
  const [loading, setLoading] = useState(true);
  const [packageDescription, setPackageDescription] = useState("Focused styling session.");
  const [packageSessions, setPackageSessions] = useState("1");
  const [packageTitle, setPackageTitle] = useState("New Session");
  const [preferredBrands, setPreferredBrands] = useState("Madewell, Everlane");
  const [radius, setRadius] = useState("20");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState("");
  const [styleTags, setStyleTags] = useState("tailored, capsule");

  useEffect(() => {
    let mounted = true;

    apiClient
      .getShopperProfile(shopperProfileId)
      .then((profile: ShopperProfile) => {
        if (!mounted) {
          return;
        }

        setBio(profile.bio ?? "");
        setCity(profile.city);
        setHeadline(profile.headline);
        setHourlyRate(String(Math.round(profile.hourlyRateCents / 100)));
        setRadius(String(profile.serviceRadiusMiles ?? 0));
        setState(profile.state);
      })
      .catch(() => {
        if (mounted) {
          setError("We could not load this shopper profile.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [shopperProfileId]);

  const save = async () => {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const hourlyRateCents = Number(hourlyRate || "0") * 100;
      const sessionCount = Math.max(1, Number(packageSessions || "1"));
      await apiClient.updateShopperProfile(shopperProfileId, {
        bio,
        city,
        headline,
        hourlyRateCents,
        serviceRadiusMiles: Number(radius || "0"),
        state
      });
      await Promise.all([
        apiClient.createPricingPackage(shopperProfileId, {
          description: packageDescription,
          ownerUserId: userId,
          pricePerSessionCents: hourlyRateCents,
          sessionCount,
          title: packageTitle,
          totalPriceCents: hourlyRateCents * sessionCount
        }),
        apiClient.addAvailabilitySlot(shopperProfileId, {
          endsAt: dateTimeFromParts(availabilityDate, availabilityEnd),
          ownerUserId: userId,
          shopperProfileId,
          startsAt: dateTimeFromParts(availabilityDate, availabilityStart),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }),
        apiClient.createShopperStylePreference(shopperProfileId, {
          ownerUserId: userId,
          preferredBrands: splitList(preferredBrands),
          styleTags: splitList(styleTags)
        })
      ]);
      setSaved(true);
    } catch {
      setError("We could not save your shopper profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen eyebrow="Style guide" title="Edit shopper profile">
        <ActivityIndicator />
      </Screen>
    );
  }

  return (
    <Screen
      eyebrow="Style guide"
      title="Edit shopper profile"
      subtitle="Update your public profile and add new packages, availability, or preferred styles."
    >
      <Card>
        <Text style={screenStyles.cardTitle}>Profile</Text>
        <AppTextInput label="Headline" onChangeText={setHeadline} value={headline} />
        <AppTextInput label="Bio" multiline onChangeText={setBio} value={bio} />
        <AppTextInput label="City" onChangeText={setCity} value={city} />
        <AppTextInput autoCapitalize="characters" label="State" onChangeText={setState} value={state} />
        <AppTextInput keyboardType="number-pad" label="Hourly rate" onChangeText={setHourlyRate} value={hourlyRate} />
        <AppTextInput keyboardType="number-pad" label="Service radius miles" onChangeText={setRadius} value={radius} />
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Add package</Text>
        <AppTextInput label="Package title" onChangeText={setPackageTitle} value={packageTitle} />
        <AppTextInput keyboardType="number-pad" label="Session count" onChangeText={setPackageSessions} value={packageSessions} />
        <AppTextInput label="Description" multiline onChangeText={setPackageDescription} value={packageDescription} />
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Add availability</Text>
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
            <ChoicePill key={time} label={time} onPress={() => setAvailabilityStart(time)} selected={time === availabilityStart} />
          ))}
        </View>
        <Text style={screenStyles.bodyText}>End</Text>
        <View style={screenStyles.pillRow}>
          {timeOptions.map((time) => (
            <ChoicePill key={time} label={time} onPress={() => setAvailabilityEnd(time)} selected={time === availabilityEnd} />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Add preferred styles</Text>
        <AppTextInput label="Style tags" onChangeText={setStyleTags} value={styleTags} />
        <AppTextInput label="Preferred brands" onChangeText={setPreferredBrands} value={preferredBrands} />
      </Card>

      <AppButton
        variant="secondary"
        onPress={() =>
          navigation.navigate("WardrobeGallery", {
            canAdd: true,
            ownerRole: "SHOPPER",
            title: "Portfolio references",
            userId,
            visibility: "PUBLIC_PROFILE"
          })
        }
      >
        Manage portfolio photos
      </AppButton>

      {saved ? <Text style={screenStyles.bodyText}>Profile changes saved.</Text> : null}
      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      <AppButton loading={saving} onPress={save}>
        Save changes
      </AppButton>
    </Screen>
  );
}
