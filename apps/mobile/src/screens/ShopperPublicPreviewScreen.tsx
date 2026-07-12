import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ShopperPricingPackage, ShopperStylePreference, WardrobePhoto } from "@style-companion/shared";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

import { apiClient } from "../api/client";
import { getCurrentSession } from "../api/sessionStore";
import type { ShopperProfile } from "../api/types";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { formatCents } from "../utils/format";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "ShopperPublicPreview">;

const formatSlot = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short"
  }).format(new Date(value));

export function ShopperPublicPreviewScreen({ navigation, route }: Props) {
  const session = getCurrentSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<ShopperPricingPackage[]>([]);
  const [photos, setPhotos] = useState<WardrobePhoto[]>([]);
  const [preferences, setPreferences] = useState<ShopperStylePreference[]>([]);
  const [profile, setProfile] = useState<ShopperProfile | null>(null);

  useEffect(() => {
    let mounted = true;
    setError(null);
    setLoading(true);

    const request = route.params.shopperProfileId
      ? apiClient.getShopperProfile(route.params.shopperProfileId)
      : apiClient.getCurrentShopperProfile();

    request
      .then(async (nextProfile) => {
        const shopperProfileId = nextProfile.id;
        const userId = nextProfile.userId;
        const [nextPackages, nextPreferences, nextPhotos] = await Promise.all([
          nextProfile.pricingPackages ? Promise.resolve(nextProfile.pricingPackages) : apiClient.getPricingPackages(shopperProfileId),
          nextProfile.stylePreferences
            ? Promise.resolve(nextProfile.stylePreferences)
            : apiClient.getShopperStylePreferences(shopperProfileId),
          nextProfile.user?.wardrobePhotos ? Promise.resolve(nextProfile.user.wardrobePhotos) : apiClient.getWardrobePhotos(userId)
        ]);

        if (!mounted) {
          return;
        }

        setProfile(nextProfile);
        setPackages(nextPackages);
        setPreferences(nextPreferences);
        setPhotos(nextPhotos);
      })
      .catch(() => {
        if (mounted) {
          setError("We could not load this shopper profile preview.");
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
  }, [route.params.shopperProfileId]);

  if (loading) {
    return (
      <Screen eyebrow="Public preview" title="Shopper profile">
        <ActivityIndicator />
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen eyebrow="Public preview" title="Shopper profile">
        {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      </Screen>
    );
  }

  const specialties = profile.specialties?.map((specialty) => specialty.name) ?? [];
  const canEdit = session?.user.id === profile.userId;

  return (
    <Screen
      eyebrow="Public preview"
      title={profile.user?.name ?? "Your shopper profile"}
      subtitle="This is the profile buyers use to decide whether you fit their style goals."
    >
      <Card>
        <Text style={screenStyles.meta}>{profile.city}, {profile.state}</Text>
        <Text style={screenStyles.cardTitle}>{profile.headline}</Text>
        {profile.bio ? <Text style={screenStyles.bodyText}>{profile.bio}</Text> : null}
        <Text style={screenStyles.bodyText}>
          {formatCents(profile.hourlyRateCents)} per hour - {profile.serviceRadiusMiles ?? 0} mile service radius
        </Text>
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Specialties</Text>
        {specialties.length === 0 ? <Text style={screenStyles.bodyText}>No specialties configured yet.</Text> : null}
        <View style={screenStyles.pillRow}>
          {specialties.map((specialty) => (
            <ChoicePill key={specialty} label={specialty} onPress={() => undefined} selected />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Pricing packages</Text>
        {packages.length === 0 ? <Text style={screenStyles.bodyText}>No packages configured yet.</Text> : null}
        {packages.map((pricingPackage) => (
          <View key={pricingPackage.id} style={screenStyles.itemBlock}>
            <Text style={screenStyles.itemTitle}>{pricingPackage.title}</Text>
            <Text style={screenStyles.bodyText}>
              {pricingPackage.sessionCount} session{pricingPackage.sessionCount === 1 ? "" : "s"} -{" "}
              {formatCents(pricingPackage.totalPriceCents)}
            </Text>
            {pricingPackage.description ? <Text style={screenStyles.bodyText}>{pricingPackage.description}</Text> : null}
          </View>
        ))}
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Preferred styles</Text>
        {preferences.length === 0 ? <Text style={screenStyles.bodyText}>No style preferences configured yet.</Text> : null}
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
            {preference.notes ? <Text style={screenStyles.bodyText}>{preference.notes}</Text> : null}
          </View>
        ))}
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Availability</Text>
        {!profile.availability || profile.availability.length === 0 ? (
          <Text style={screenStyles.bodyText}>No availability configured yet.</Text>
        ) : null}
        {profile.availability?.slice(0, 5).map((slot) => (
          <Text key={slot.id} style={screenStyles.bodyText}>
            {formatSlot(slot.startsAt)} to {formatSlot(slot.endsAt)}
          </Text>
        ))}
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Portfolio photos</Text>
        {photos.length === 0 ? <Text style={screenStyles.bodyText}>No public portfolio photos configured yet.</Text> : null}
        {photos.slice(0, 3).map((photo) => (
          <View key={photo.id} style={screenStyles.itemBlock}>
            <Image source={{ uri: photo.url }} style={screenStyles.photoPreview} />
            <Text style={screenStyles.itemTitle}>{photo.title ?? photo.category}</Text>
            {photo.caption ? <Text style={screenStyles.bodyText}>{photo.caption}</Text> : null}
          </View>
        ))}
      </Card>

      {canEdit ? (
        <View style={screenStyles.buttonStack}>
          <AppButton
            variant="secondary"
            onPress={() =>
              navigation.navigate("ShopperProfileEdit", {
                shopperProfileId: profile.id,
                userId: profile.userId
              })
            }
          >
            Edit profile details
          </AppButton>
          <AppButton
            variant="secondary"
            onPress={() =>
              navigation.navigate("WardrobeGallery", {
                canAdd: true,
                ownerRole: "SHOPPER",
                title: "Portfolio references",
                userId: profile.userId,
                visibility: "PUBLIC_PROFILE"
              })
            }
          >
            Edit portfolio photos
          </AppButton>
        </View>
      ) : null}
    </Screen>
  );
}
