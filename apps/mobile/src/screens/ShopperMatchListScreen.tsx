import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import type { ShopperMatch } from "@style-companion/shared";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { theme } from "../theme";
import { formatCents } from "../utils/format";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "ShopperMatchList">;

export function ShopperMatchListScreen({ navigation, route }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<ShopperMatch[]>([]);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .getShopperMatches(route.params.customerProfileId)
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
      subtitle="Mock mode ranks guides by rating and profile fit. Backend mode calls GET /shoppers/matches."
    >
      {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      {matches.map((shopper) => (
        <Card key={shopper.id}>
          <Text style={screenStyles.meta}>{shopper.city}, {shopper.state}</Text>
          <Text style={screenStyles.cardTitle}>{shopper.name}</Text>
          <Text style={screenStyles.bodyText}>{shopper.headline}</Text>
          <Text style={screenStyles.bodyText}>
            {shopper.averageRating.toFixed(1)} stars · {shopper.reviewCount} reviews · {formatCents(shopper.hourlyRateCents)}/hr
          </Text>
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
