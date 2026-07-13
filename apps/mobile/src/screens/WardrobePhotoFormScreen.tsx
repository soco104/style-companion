import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, View } from "react-native";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Card } from "../components/Card";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "WardrobePhotoForm">;

const categoryOptions = ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "portfolio"];

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export function WardrobePhotoFormScreen({ navigation, route }: Props) {
  const { bookingId, ownerRole, userId, visibility } = route.params;
  const [caption, setCaption] = useState("Favorite piece to build outfits around.");
  const [category, setCategory] = useState(ownerRole === "SHOPPER" ? "portfolio" : "tops");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState("capsule, workwear");
  const [title, setTitle] = useState(ownerRole === "SHOPPER" ? "Portfolio reference" : "Wardrobe item");

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const id = Date.now();
      await apiClient.createWardrobePhoto({
        bookingId,
        caption,
        category,
        metadata: {
          source: "mobile-placeholder"
        },
        storageKey: `mobile-placeholder/${userId}/${id}.jpg`,
        tags: splitList(tags),
        title,
        uploadedByRole: ownerRole,
        uploadedByUserId: userId,
        url: `https://example.test/mobile-placeholder/${userId}/${id}.jpg`,
        userId,
        visibility: visibility ?? (bookingId ? "BOOKING_SHARED" : ownerRole === "SHOPPER" ? "PUBLIC_PROFILE" : "PRIVATE")
      });
      navigation.goBack();
    } catch {
      setError("We could not save this wardrobe photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      eyebrow="Wardrobe"
      title="Add photo metadata"
      subtitle="Use a placeholder image URL for now. Real Azure Blob upload can attach to this metadata later."
    >
      <Card>
        <Text style={screenStyles.cardTitle}>Photo details</Text>
        <AppTextInput label="Title" onChangeText={setTitle} value={title} />
        <AppTextInput label="Caption" multiline onChangeText={setCaption} value={caption} />
        <Text style={screenStyles.bodyText}>Category</Text>
        <View style={screenStyles.pillRow}>
          {categoryOptions.map((option) => (
            <ChoicePill key={option} label={option} onPress={() => setCategory(option)} selected={option === category} />
          ))}
        </View>
        <AppTextInput label="Tags" onChangeText={setTags} value={tags} />
      </Card>
      <Card>
        <Text style={screenStyles.cardTitle}>Visibility</Text>
        <Text style={screenStyles.bodyText}>
          {visibility ?? (bookingId ? "BOOKING_SHARED" : ownerRole === "SHOPPER" ? "PUBLIC_PROFILE" : "PRIVATE")}
        </Text>
        <Text style={screenStyles.bodyText}>Uploaded by {ownerRole.toLowerCase()}</Text>
      </Card>
      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      <AppButton loading={loading} onPress={submit}>
        Save photo
      </AppButton>
    </Screen>
  );
}
