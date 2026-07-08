import { useState } from "react";
import { Text } from "react-native";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { screenStyles } from "./styles";

export function AccountScreen() {
  const [description, setDescription] = useState("I need help with something in the MVP flow.");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitSafetyReport = async () => {
    setLoading(true);
    try {
      await apiClient.createSafetyReport({
        category: "OTHER",
        description,
        reporterUserId: "user-demo"
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
