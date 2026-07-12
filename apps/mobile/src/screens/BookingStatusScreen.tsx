import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native";

import { AppButton } from "../components/AppButton";
import { getCurrentSession } from "../api/sessionStore";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { formatCents, formatDateTime } from "../utils/format";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "BookingStatus">;

export function BookingStatusScreen({ navigation, route }: Props) {
  const { booking, customerProfileId, shopper } = route.params;
  const session = getCurrentSession();

  return (
    <Screen
      eyebrow="Status"
      title={booking.status}
      subtitle="Your booking request has been created. In the MVP, status changes are managed by backend endpoints."
    >
      <Card>
        <Text style={screenStyles.cardTitle}>{booking.shopperName}</Text>
        <Text style={screenStyles.bodyText}>{formatDateTime(booking.scheduledStartAt)}</Text>
        <Text style={screenStyles.bodyText}>{booking.locationName ?? "Location to be confirmed"}</Text>
        <Text style={screenStyles.bodyText}>{formatCents(booking.totalPriceCents)} estimated total</Text>
      </Card>
      <AppButton onPress={() => navigation.navigate("ChatPlaceholder", { booking, shopper })}>
        Open chat
      </AppButton>
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
          Booking wardrobe photos
        </AppButton>
      ) : null}
      <AppButton
        variant="secondary"
        onPress={() => navigation.navigate("Review", { booking, customerProfileId, shopper })}
      >
        Leave review
      </AppButton>
      <AppButton variant="ghost" onPress={() => navigation.navigate("Account")}>
        Account settings
      </AppButton>
    </Screen>
  );
}
