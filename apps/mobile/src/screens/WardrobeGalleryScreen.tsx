import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { WardrobePhoto } from "@style-companion/shared";
import { useCallback, useState } from "react";
import { Image, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "WardrobeGallery">;

export function WardrobeGalleryScreen({ navigation, route }: Props) {
  const { bookingId, canAdd = true, ownerRole, readOnly = false, userId, visibility } = route.params;
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<WardrobePhoto[]>([]);

  const loadPhotos = useCallback(() => {
    let mounted = true;
    setError(null);

    const request = bookingId
      ? apiClient.getWardrobePhotosForBooking(bookingId)
      : userId
        ? apiClient.getWardrobePhotos(userId)
        : Promise.resolve([]);

    request
      .then((nextPhotos) => {
        if (mounted) {
          setPhotos(nextPhotos);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("We could not load wardrobe photos.");
        }
      });

    return () => {
      mounted = false;
    };
  }, [bookingId, userId]);

  useFocusEffect(loadPhotos);

  return (
    <Screen
      eyebrow="Wardrobe"
      title={route.params.title ?? "Wardrobe photos"}
      subtitle="Photo storage is mocked for the MVP. Metadata and permissions are wired through the API."
    >
      {canAdd && userId && !readOnly ? (
        <AppButton
          onPress={() =>
            navigation.navigate("WardrobePhotoForm", {
              bookingId,
              ownerRole,
              userId,
              visibility
            })
          }
        >
          Add photo
        </AppButton>
      ) : null}

      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      {photos.length === 0 ? (
        <Card>
          <Text style={screenStyles.bodyText}>No photos yet.</Text>
        </Card>
      ) : null}

      {photos.map((photo) => (
        <Card key={photo.id}>
          <Image source={{ uri: photo.url }} style={screenStyles.photoPreview} />
          <Text style={screenStyles.cardTitle}>{photo.title ?? photo.category}</Text>
          {photo.caption ? <Text style={screenStyles.bodyText}>{photo.caption}</Text> : null}
          <Text style={screenStyles.meta}>
            {photo.category} - {photo.visibility.replace("_", " ").toLowerCase()} - {photo.uploadedByRole.toLowerCase()}
          </Text>
          <View style={screenStyles.pillRow}>
            {photo.tags.map((tag) => (
              <ChoicePill key={tag} label={tag} onPress={() => undefined} selected />
            ))}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
