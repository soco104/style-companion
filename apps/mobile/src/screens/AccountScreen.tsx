import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text } from "react-native";

import { apiClient } from "../api/client";
import { getCurrentSession } from "../api/sessionStore";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Account">;

export function AccountScreen({ navigation }: Props) {
  const session = getCurrentSession();
  const [description, setDescription] = useState("I need help with something in the MVP flow.");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitSafetyReport = async () => {
    setLoading(true);
    try {
      await apiClient.createSafetyReport({
        category: "OTHER",
        description,
        reporterUserId: session?.user.id ?? "user-demo"
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      eyebrow="Settings"
      title="Account"
      subtitle="A compact settings shell for profile, safety, and app mode visibility."
    >
      <Card>
        <Text style={screenStyles.cardTitle}>API mode</Text>
        <Text style={screenStyles.bodyText}>
          Mock mode is the default. Set EXPO_PUBLIC_API_MODE=backend and EXPO_PUBLIC_API_URL to use the NestJS API.
        </Text>
      </Card>
      <Card>
        <Text style={screenStyles.cardTitle}>Shopper profile</Text>
        <Text style={screenStyles.bodyText}>Manage packages, availability, and preferred styles.</Text>
        {session?.user.shopperProfile ? (
          <>
            <AppButton
              variant="secondary"
              onPress={() => navigation.navigate("ShopperPublicPreview", { shopperProfileId: session.user.shopperProfile!.id })}
            >
              View public preview
            </AppButton>
            <AppButton
              variant="secondary"
              onPress={() =>
                navigation.navigate("ShopperProfileEdit", {
                  shopperProfileId: session.user.shopperProfile!.id,
                  userId: session.user.id
                })
              }
            >
              Edit shopper profile
            </AppButton>
          </>
        ) : session ? (
          <AppButton
            variant="secondary"
            onPress={() => navigation.navigate("ShopperProfileCreation", { userId: session.user.id })}
          >
            Create shopper profile
          </AppButton>
        ) : (
          <Text style={screenStyles.bodyText}>Sign in to manage a shopper profile.</Text>
        )}
      </Card>
      {session ? (
        <Card>
          <Text style={screenStyles.cardTitle}>Wardrobe photos</Text>
          <Text style={screenStyles.bodyText}>Add customer wardrobe items or shopper portfolio references.</Text>
          <AppButton
            variant="secondary"
            onPress={() =>
              navigation.navigate("WardrobeGallery", {
                canAdd: true,
                ownerRole: session.user.role === "SHOPPER" ? "SHOPPER" : "CUSTOMER",
                title: session.user.role === "SHOPPER" ? "Portfolio references" : "My wardrobe",
                userId: session.user.id,
                visibility: session.user.role === "SHOPPER" ? "PUBLIC_PROFILE" : "PRIVATE"
              })
            }
          >
            Open wardrobe gallery
          </AppButton>
        </Card>
      ) : null}
      <Card>
        <Text style={screenStyles.cardTitle}>Safety report</Text>
        <Text style={screenStyles.bodyText}>
          Safety reporting is wired to POST /safety-reports through the API client.
        </Text>
        <AppTextInput label="What happened?" multiline onChangeText={setDescription} value={description} />
        {submitted ? <Text style={screenStyles.bodyText}>Report submitted.</Text> : null}
        <AppButton loading={loading} onPress={submitSafetyReport}>
          Submit safety report
        </AppButton>
      </Card>
    </Screen>
  );
}
