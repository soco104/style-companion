import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AvailabilitySlot, ShopperPricingPackage, ShopperStylePreference, WardrobePhoto } from "@style-companion/shared";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { formatCents } from "../utils/format";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "ShopperDetail">;

const availabilityRange = () => {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 30);

  return { from: from.toISOString(), to: to.toISOString() };
};

const formatSlot = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short"
  }).format(new Date(value));

export function ShopperDetailScreen({ navigation, route }: Props) {
  const { customerProfileId, shopper } = route.params;
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<ShopperPricingPackage[]>([]);
  const [photos, setPhotos] = useState<WardrobePhoto[]>([]);
  const [preferences, setPreferences] = useState<ShopperStylePreference[]>([]);

  useEffect(() => {
    let mounted = true;

    const range = availabilityRange();

    Promise.all([
      apiClient.getPricingPackages(shopper.id),
      apiClient.getShopperStylePreferences(shopper.id),
      apiClient.getAvailability(shopper.id, range.from, range.to),
      shopper.userId ? apiClient.getWardrobePhotos(shopper.userId) : Promise.resolve([])
    ])
      .then(([nextPackages, nextPreferences, nextAvailability, nextPhotos]) => {
        if (!mounted) {
          return;
        }

        setPackages(nextPackages);
        setPreferences(nextPreferences);
        setAvailability(nextAvailability.availableSlots);
        setPhotos(nextPhotos);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [shopper.id]);

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

      <Card>
        <Text style={screenStyles.cardTitle}>Pricing packages</Text>
        {loading ? <ActivityIndicator /> : null}
        {!loading && packages.length === 0 ? (
          <Text style={screenStyles.bodyText}>No packages listed yet. You can still request a standard session.</Text>
        ) : null}
        {packages.map((pricingPackage) => (
          <View key={pricingPackage.id} style={screenStyles.itemBlock}>
            <Text style={screenStyles.itemTitle}>{pricingPackage.title}</Text>
            <Text style={screenStyles.bodyText}>
              {pricingPackage.sessionCount} session{pricingPackage.sessionCount === 1 ? "" : "s"} -{" "}
              {formatCents(pricingPackage.totalPriceCents)}
            </Text>
            {pricingPackage.description ? (
              <Text style={screenStyles.bodyText}>{pricingPackage.description}</Text>
            ) : null}
          </View>
        ))}
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Upcoming availability</Text>
        {availability.length === 0 ? <Text style={screenStyles.bodyText}>No available times listed yet.</Text> : null}
        {availability.slice(0, 5).map((slot) => (
          <Text key={slot.id} style={screenStyles.bodyText}>
            {formatSlot(slot.startsAt)} to {formatSlot(slot.endsAt)}
          </Text>
        ))}
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Portfolio photos</Text>
        {photos.length === 0 ? <Text style={screenStyles.bodyText}>No portfolio photos yet.</Text> : null}
        {photos.slice(0, 2).map((photo) => (
          <View key={photo.id} style={screenStyles.itemBlock}>
            <Image source={{ uri: photo.url }} style={screenStyles.photoPreview} />
            <Text style={screenStyles.itemTitle}>{photo.title ?? photo.category}</Text>
            {photo.caption ? <Text style={screenStyles.bodyText}>{photo.caption}</Text> : null}
          </View>
        ))}
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Session types</Text>
        <View style={screenStyles.pillRow}>
          {[...new Set([...shopper.specialties, ...packages.map((item) => item.title)])].map((label) => (
            <ChoicePill key={label} label={label} onPress={() => undefined} selected />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Style preferences</Text>
        {preferences.length === 0 ? (
          <Text style={screenStyles.bodyText}>No style preferences listed yet.</Text>
        ) : null}
        {preferences.map((preference) => (
          <View key={preference.id} style={screenStyles.itemBlock}>
            <View style={screenStyles.pillRow}>
              {preference.styleTags.map((tag) => (
                <ChoicePill key={tag} label={tag} onPress={() => undefined} selected />
              ))}
            </View>
            {preference.preferredBrands.length > 0 ? (
              <Text style={screenStyles.bodyText}>Likes: {preference.preferredBrands.join(", ")}</Text>
            ) : null}
            {preference.avoidedStyles.length > 0 ? (
              <Text style={screenStyles.bodyText}>Avoids: {preference.avoidedStyles.join(", ")}</Text>
            ) : null}
            {preference.notes ? <Text style={screenStyles.bodyText}>{preference.notes}</Text> : null}
          </View>
        ))}
      </Card>

      <AppButton onPress={() => navigation.navigate("BookingRequest", { customerProfileId, shopper })}>
        Schedule
      </AppButton>
    </Screen>
  );
}
