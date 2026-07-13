import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AvailabilitySlot, ShopperPricingPackage } from "@style-companion/shared";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { apiClient } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Card } from "../components/Card";
import { ChoicePill } from "../components/ChoicePill";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { formatCents } from "../utils/format";
import { screenStyles } from "./styles";

type Props = NativeStackScreenProps<RootStackParamList, "BookingRequest">;

const buildDateOptions = () =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  });

const endOfDateRange = (start: string) => {
  const date = new Date(start);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
};

const fallbackStartAt = (hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    weekday: "short",
    day: "numeric"
  }).format(new Date(value));

const formatTimeRange = (slot: AvailabilitySlot) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${formatter.format(new Date(slot.startsAt))} - ${formatter.format(new Date(slot.endsAt))}`;
};

export function BookingRequestScreen({ navigation, route }: Props) {
  const { customerProfileId, shopper } = route.params;
  const [city, setCity] = useState(shopper.city);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState("Build polished work outfits that mix and match.");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [locationName, setLocationName] = useState("Green Hills Mall");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("I want help finding work outfits that mix and match.");
  const [packages, setPackages] = useState<ShopperPricingPackage[]>([]);
  const [selectedDate, setSelectedDate] = useState(buildDateOptions()[0]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [state, setState] = useState(shopper.state);
  const dateOptions = useMemo(buildDateOptions, []);
  const selectedPackage = packages.find((item) => item.id === selectedPackageId);
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
  const fallbackTotal = shopper.hourlyRateCents * 2;

  useEffect(() => {
    let mounted = true;

    apiClient.getPricingPackages(shopper.id).then((nextPackages) => {
      if (!mounted) {
        return;
      }

      setPackages(nextPackages);
      setSelectedPackageId(nextPackages[0]?.id ?? null);
    });

    return () => {
      mounted = false;
    };
  }, [shopper.id]);

  useEffect(() => {
    let mounted = true;
    setAvailabilityLoading(true);
    setSelectedSlotId(null);
    apiClient
      .getAvailability(shopper.id, selectedDate, endOfDateRange(selectedDate))
      .then((availability) => {
        if (!mounted) {
          return;
        }

        setSlots(availability.availableSlots);
        setSelectedSlotId(availability.availableSlots[0]?.id ?? null);
      })
      .catch(() => {
        if (mounted) {
          setSlots([]);
          setError("We could not load this guide's availability. Please try another date.");
        }
      })
      .finally(() => {
        if (mounted) {
          setAvailabilityLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedDate, shopper.id]);

  const submit = async () => {
    if (!selectedSlot) {
      setError("Choose an available time before sending the request.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const booking = await apiClient.createBooking({
        city,
        budgetCents: 60000,
        customerNotes: notes,
        customerProfileId,
        goal,
        locationName,
        pricingPackageId: selectedPackage?.id,
        scheduledEndAt: selectedSlot.endsAt,
        scheduledStartAt: selectedSlot.startsAt,
        shopperProfileId: shopper.id,
        state,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        totalPriceCents: selectedPackage?.totalPriceCents ?? fallbackTotal
      });
      navigation.navigate("BookingStatus", { booking, customerProfileId, shopper });
    } catch {
      setError("That time is no longer available. Please choose another slot and try again.");
      try {
        const availability = await apiClient.getAvailability(shopper.id, selectedDate, endOfDateRange(selectedDate));
        setSlots(availability.availableSlots);
        setSelectedSlotId(availability.availableSlots[0]?.id ?? null);
      } catch {
        setSlots([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      eyebrow="Booking"
      title={`Request ${shopper.name}`}
      subtitle="The backend owns booking status rules. This request starts as REQUESTED."
    >
      <Card>
        <Text style={screenStyles.cardTitle}>Choose a package</Text>
        {packages.length === 0 ? (
          <Text style={screenStyles.bodyText}>Standard two-hour session - {formatCents(fallbackTotal)}</Text>
        ) : null}
        {packages.map((pricingPackage) => (
          <ChoicePill
            key={pricingPackage.id}
            label={`${pricingPackage.title} - ${formatCents(pricingPackage.totalPriceCents)}`}
            onPress={() => setSelectedPackageId(pricingPackage.id)}
            selected={pricingPackage.id === selectedPackageId}
          />
        ))}
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Choose a date</Text>
        <View style={screenStyles.pillRow}>
          {dateOptions.map((date) => (
            <ChoicePill
              key={date}
              label={formatDateLabel(date)}
              onPress={() => setSelectedDate(date)}
              selected={date === selectedDate}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Choose a time</Text>
        {availabilityLoading ? <ActivityIndicator /> : null}
        {!availabilityLoading && slots.length === 0 ? (
          <Text style={screenStyles.bodyText}>No open times are available for this date.</Text>
        ) : null}
        <View style={screenStyles.pillRow}>
          {slots.map((slot) => (
            <ChoicePill
              key={slot.id}
              label={formatTimeRange(slot)}
              onPress={() => setSelectedSlotId(slot.id)}
              selected={slot.id === selectedSlotId}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={screenStyles.cardTitle}>Confirm session</Text>
        <Text style={screenStyles.bodyText}>{selectedPackage?.title ?? "Standard styling session"}</Text>
        <Text style={screenStyles.bodyText}>
          {selectedSlot ? `${formatDateLabel(selectedSlot.startsAt)} - ${formatTimeRange(selectedSlot)}` : "Choose a time"}
        </Text>
        <Text style={screenStyles.bodyText}>
          {formatCents(selectedPackage?.totalPriceCents ?? fallbackTotal)} estimated total
        </Text>
      </Card>
      <AppTextInput label="Meeting place" onChangeText={setLocationName} value={locationName} />
      <AppTextInput label="Session goal" multiline onChangeText={setGoal} value={goal} />
      <AppTextInput label="City" onChangeText={setCity} value={city} />
      <AppTextInput autoCapitalize="characters" label="State" onChangeText={setState} value={state} />
      <AppTextInput label="Notes for guide" multiline onChangeText={setNotes} value={notes} />
      {error ? <Text style={screenStyles.error}>{error}</Text> : null}
      <AppButton disabled={!selectedSlot} loading={loading} onPress={submit}>
        Send request
      </AppButton>
    </Screen>
  );
}
