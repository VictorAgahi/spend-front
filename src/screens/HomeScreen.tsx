import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
import { ScreenHeader, ActionButton, PingNotification, RoomManager } from "@/components";
import { SafeAreaView } from "react-native-safe-area-context";

export function HomeScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="spendApp" subtitle="Connect. Volunteer. Impact." />
        <View style={styles.content}>
          <PingNotification />
          <View style={styles.spacer} />
          <RoomManager />
          <View style={styles.spacerHuge} />
          <ActionButton label="Get Started" onPress={() => undefined} />
          <View style={styles.spacer} />
          <ActionButton
            label="Learn More"
            onPress={() => undefined}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: 'white',
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  spacer: {
    height: 12,
  },
  spacerHuge: {
    height: 40,
  },
});
