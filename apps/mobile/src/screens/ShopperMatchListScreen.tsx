import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import type { ShopperMatch, ShopperMatchSearchInput } from "@style-companion/shared";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Card } from "../components/Card";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { theme } from "../theme";
import { formatCents } from "../utils/format";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "ShopperMatchList">;

const dateOptions = () =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().slice(0, 10);
  });

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short"
  }).format(new Date(`${value}T12:00:00`));

const availabilityWindowForDate = (value?: string) => {
  if (!value) {
    return {};
  }

  const [year, month, day] = value.split("-").map(Number);
  const from = new Date();
  from.setFullYear(year, month - 1, day);
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setDate(to.getDate() + 1);

  return {
    availableFrom: from.toISOString(),
    availableTo: to.toISOString()
  };
};

export function ShopperMatchListScreen({ navigation, route }: Props) {
  const initialSearch = route.params.initialSearch ?? {};
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [budget, setBudget] = useState(
    initialSearch.budgetMaxCents ? String(Math.round(initialSearch.budgetMaxCents / 100)) : ""
  );
  const [city, setCity] = useState(initialSearch.city ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<ShopperMatch[]>([]);
  const [specialties, setSpecialties] = useState(initialSearch.specialties ?? initialSearch.specialty ?? "");
  const [state, setState] = useState(initialSearch.state ?? "");
  const [styleGoals, setStyleGoals] = useState(initialSearch.styleGoals ?? "");

  const buildSearch = (): ShopperMatchSearchInput => ({
    ...availabilityWindowForDate(availabilityDate),
    budgetMaxCents: budget ? Number(budget) * 100 : undefined,
    city: city.trim() || undefined,
    customerProfileId: route.params.customerProfileId,
    specialties: specialties.trim() || undefined,
    state: state.trim() || undefined,
    styleGoals: styleGoals.trim() || undefined,
    take: 20
  });

  const loadMatches = (search: ShopperMatchSearchInput) => {
    setError(null);
    setLoading(true);

    apiClient
      .getShopperMatches(search)
      .then(setMatches)
      .catch(() => {
        setError("We could not load matches right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;

    apiClient
      .getShopperMatches({
        customerProfileId: route.params.customerProfileId,
        ...initialSearch
      })
      .then((result) => {
        if (isMounted) {
          setMatches(result);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("We could not load matches right now.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [route.params.customerProfileId]);

  return (
    <Screen
      eyebrow="Matches"
      title="Local style guides"
      subtitle="Search by location, style goals, budget, and available date."
    >
      <Card>
        <Text style={screenStyles.cardTitle}>Search guides</Text>
        <View style={screenStyles.inlineFields}>
          <AppTextInput label="City" onChangeText={setCity} value={city} />
          <AppTextInput autoCapitalize="characters" label="State" onChangeText={setState} value={state} />
          <AppTextInput label="Style goals" onChangeText={setStyleGoals} value={styleGoals} />
          <AppTextInput label="Specialties" onChangeText={setSpecialties} value={specialties} />
          <AppTextInput keyboardType="number-pad" label="Max session budget" onChangeText={setBudget} value={budget} />
        </View>
        <Text style={screenStyles.meta}>Available date</Text>
        <View style={screenStyles.pillRow}>
          <ChoicePill label="Any" onPress={() => setAvailabilityDate("")} selected={!availabilityDate} />
          {dateOptions().slice(0, 5).map((date) => (
            <ChoicePill
              key={date}
              label={formatDateLabel(date)}
              onPress={() => setAvailabilityDate(date)}
              selected={availabilityDate === date}
            />
          ))}
        </View>
        <AppButton loading={loading} onPress={() => loadMatches(buildSearch())}>
          Search guides
        </AppButton>
      </Card>
      {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      {!loading && matches.length === 0 ? (
        <Card>
          <Text style={screenStyles.bodyText}>No guides matched those filters. Try widening the location, budget, or date.</Text>
        </Card>
      ) : null}
      {matches.map((shopper) => (
        <Card key={shopper.id}>
          <Text style={screenStyles.meta}>{shopper.city}, {shopper.state}</Text>
          <Text style={screenStyles.cardTitle}>{shopper.name}</Text>
          <Text style={screenStyles.bodyText}>{shopper.headline}</Text>
          <Text style={screenStyles.bodyText}>
            {shopper.averageRating.toFixed(1)} stars - {shopper.reviewCount} reviews - {formatCents(shopper.hourlyRateCents)}/hr
          </Text>
          <View style={screenStyles.explanationList}>
            <Text style={screenStyles.meta}>Why this guide matched</Text>
            {shopper.explanation.slice(0, 3).map((reason) => (
              <Text key={reason} style={screenStyles.explanationItem}>
                {reason}
              </Text>
            ))}
          </View>
          <AppButton
            variant="secondary"
            onPress={() =>
              navigation.navigate("ShopperDetail", {
                customerProfileId: route.params.customerProfileId,
                shopper
              })
            }
          >
            View guide
          </AppButton>
        </Card>
      ))}
    </Screen>
  );
}
