import { Tabs } from "expo-router";
import "react-native-reanimated";
import { icons } from "./../../constants/icons";
import TabBarIcon from "./../../components/TabBarIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import useFirebaseNotifications from "@/hooks/useFirebaseNotifications";
import { db, auth } from "@/firebaseConfig";
import { useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const fcmToken = useFirebaseNotifications();
  const router = useRouter();

  useEffect(() => {
    const saveToken = async () => {
      // Only try if user and token exist
      const user = auth.currentUser;
      if (!user || !fcmToken) return;

      try {
        await setDoc(doc(db, "users", user.uid), { fcmToken }, { merge: true });
        // You can also handle arrays or subcollections for multiple tokens
      } catch (error) {
        console.error("Failed to save FCM token:", error);
      }
    };

    saveToken();
  }, [fcmToken]);

  // Handle notification taps
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        // Always navigate to the root tab (main screen)
        router.replace("/"); // Replace with "/" or your actual home screen route
      }
    );
    return () => subscription.remove();
  }, [router]);

  return (
    <View className="flex-1 bg-transparent">
      <Tabs
        screenOptions={{
          tabBarStyle: {
            height: 60, // ⬅️ Increase height here
            paddingBottom: 10, // ⬅️ Adjust padding inside the tab bar
            paddingTop: 10,
            marginHorizontal: 10, // ⬅️ Add horizontal margin
            marginVertical: 10, // ⬅️ Add vertical margin
            borderRadius: 20, // ⬅️ Add rounded corners
            backgroundColor: "#2C2C2E", // ⬅️ Set background color
            position: "absolute", // ⬅️ Ensure it stays at the bottom
            bottom: 0, // ⬅️ Position at the bottom
            borderTopWidth: 0,
            elevation: 0, // For Android
            shadowOpacity: 0, // For iOS
          },
          tabBarItemStyle: {
            flex: 1, // ⬅️ Ensure each tab takes equal space
            alignItems: "center", // ⬅️ Center items horizontally
            justifyContent: "center", // ⬅️ Center items vertically
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarLabel: () => null, // hide label (we handle it in the component)
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon focused={focused} icon={icons.home} title="Home" />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarLabel: () => null,
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                icon={icons.search}
                title="Search"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bookmark"
          options={{
            title: "Bookmark",
            tabBarLabel: () => null,
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                icon={icons.save}
                title="Bookmark"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarLabel: () => null,
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                icon={icons.person}
                title="Profile"
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
