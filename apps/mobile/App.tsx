import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { AccountScreen } from "./src/screens/AccountScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { BookingRequestScreen } from "./src/screens/BookingRequestScreen";
import { BookingStatusScreen } from "./src/screens/BookingStatusScreen";
import { ChatPlaceholderScreen } from "./src/screens/ChatPlaceholderScreen";
import { CustomerProfileScreen } from "./src/screens/CustomerProfileScreen";
import { CustomerStyleQuizScreen } from "./src/screens/CustomerStyleQuizScreen";
import { ReviewScreen } from "./src/screens/ReviewScreen";
import { RoleSelectionScreen } from "./src/screens/RoleSelectionScreen";
import { ShopperDetailScreen } from "./src/screens/ShopperDetailScreen";
import { ShopperProfileEditScreen } from "./src/screens/ShopperProfileEditScreen";
import { ShopperMatchListScreen } from "./src/screens/ShopperMatchListScreen";
import { ShopperProfileCreationScreen } from "./src/screens/ShopperProfileCreationScreen";
import { ShopperPublicPreviewScreen } from "./src/screens/ShopperPublicPreviewScreen";
import { WardrobeGalleryScreen } from "./src/screens/WardrobeGalleryScreen";
import { WardrobePhotoFormScreen } from "./src/screens/WardrobePhotoFormScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import type { RootStackParamList } from "./src/navigation/types";
import { theme } from "./src/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.primaryDark,
          headerTitleStyle: { color: theme.colors.text, fontWeight: "800" }
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: "Sign up or log in" }} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ title: "Choose role" }} />
        <Stack.Screen name="CustomerStyleQuiz" component={CustomerStyleQuizScreen} options={{ title: "Style quiz" }} />
        <Stack.Screen name="CustomerProfile" component={CustomerProfileScreen} options={{ title: "Customer profile" }} />
        <Stack.Screen name="ShopperProfileCreation" component={ShopperProfileCreationScreen} options={{ title: "Shopper profile" }} />
        <Stack.Screen name="ShopperProfileEdit" component={ShopperProfileEditScreen} options={{ title: "Edit shopper profile" }} />
        <Stack.Screen name="ShopperMatchList" component={ShopperMatchListScreen} options={{ title: "Style guides" }} />
        <Stack.Screen name="ShopperDetail" component={ShopperDetailScreen} options={{ title: "Guide details" }} />
        <Stack.Screen name="ShopperPublicPreview" component={ShopperPublicPreviewScreen} options={{ title: "Public preview" }} />
        <Stack.Screen name="BookingRequest" component={BookingRequestScreen} options={{ title: "Request booking" }} />
        <Stack.Screen name="BookingStatus" component={BookingStatusScreen} options={{ title: "Booking status" }} />
        <Stack.Screen name="ChatPlaceholder" component={ChatPlaceholderScreen} options={{ title: "Chat" }} />
        <Stack.Screen name="WardrobeGallery" component={WardrobeGalleryScreen} options={{ title: "Wardrobe" }} />
        <Stack.Screen name="WardrobePhotoForm" component={WardrobePhotoFormScreen} options={{ title: "Add photo" }} />
        <Stack.Screen name="Review" component={ReviewScreen} options={{ title: "Review" }} />
        <Stack.Screen name="Account" component={AccountScreen} options={{ title: "Account" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
