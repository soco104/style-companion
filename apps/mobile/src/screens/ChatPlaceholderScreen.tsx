import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native";

import { AppButton } from "../components/AppButton";
import { getCurrentSession } from "../api/sessionStore";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "ChatPlaceholder">;

export function ChatPlaceholderScreen({ navigation, route }: Props) {
  const { booking, shopper } = route.params;
  const session = getCurrentSession();

  return (
    <Screen
      eyebrow="Chat"
      title={`Message ${shopper.name}`}
      subtitle="Realtime messaging is intentionally a placeholder for now."
    >
      <Card>
        <Text style={screenStyles.meta}>Thread shell</Text>
        <Text style={screenStyles.cardTitle}>Booking {booking.id}</Text>
        <Text style={screenStyles.bodyText}>
          Future chat messages will live here once the backend has message storage and realtime transport.
        </Text>
      </Card>
      {session ? (
        <AppButton
          variant="secondary"
          onPress={() =>
            navigation.navigate("WardrobeGallery", {
              bookingId: booking.id,
              canAdd: true,
              ownerRole: session.user.role === "SHOPPER" ? "SHOPPER" : "CUSTOMER",
              title: "Booking wardrobe photos",
              userId: session.user.id,
              visibility: "BOOKING_SHARED"
            })
          }
        >
          View wardrobe photos
        </AppButton>
      ) : null}
      <AppButton onPress={() => navigation.goBack()}>Back to booking</AppButton>
    </Screen>
  );
}
