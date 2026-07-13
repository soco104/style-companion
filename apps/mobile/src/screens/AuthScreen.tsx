import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text } from "react-native";

import { apiClient } from "../api/client";
import { setCurrentSession } from "../api/sessionStore";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

export function AuthScreen({ navigation }: Props) {
  const [email, setEmail] = useState("customer@stylecompanion.test");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const session = await apiClient.devLogin(email.trim());
      setCurrentSession(session);
      navigation.navigate("RoleSelection", { userId: session.user.id });
    } catch {
      setError("We could not sign you in. Check the email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      eyebrow="Account"
      title="Start with your email."
      subtitle="Mock mode uses a development login so the MVP flow stays focused on styling and booking."
    >
      <AppTextInput
        autoCapitalize="none"
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        value={email}
      />
      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      <AppButton disabled={!email.trim()} loading={loading} onPress={submit}>
        Continue
      </AppButton>
    </Screen>
  );
}
