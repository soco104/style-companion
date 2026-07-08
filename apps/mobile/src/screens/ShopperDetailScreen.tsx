import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { formatCents } from "../utils/format";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "ShopperDetail">;

export function ShopperDetailScreen({ navigation, route }: Props) {
  const { customerProfileId, shopper } = route.params;

  return (
    <Screen eyebrow="Style guide" title={shopper.name} subtitle={shopper.headline}>
      <Card>
        <Text style={screenStyles.meta}>{shopper.city}, {shopper.state}</Text>
        <Text style={screenStyles.bodyText}>{shopper.bio}</Text>
        <Text style={screenStyles.sectionTitle}>Specialties</Text>
        <View style={screenStyles.pillRow}>
          {shopper.specialties.map((specialty) => (
            <ChoicePill key={specialty} label={specialty} onPress={() => undefined} selected />
          ))}
        </View>
        <Text style={screenStyles.bodyText}>
          {shopper.averageRating.toFixed(1)} stars from {shopper.reviewCount} reviews
        </Text>
        <Text style={screenStyles.bodyText}>{formatCents(shopper.hourlyRateCents)} per hour</Text>
      </Card>
      <AppButton onPress={() => navigation.navigate("BookingRequest", { customerProfileId, shopper })}>
        Request booking
      </AppButton>
    </Screen>
  );
}
