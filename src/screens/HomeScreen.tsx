import { View, StyleSheet } from "react-native";
import { ScreenHeader, ActionButton, PingNotification } from "@/components";

export function HomeScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ScreenHeader title="spendApp" subtitle="Connect. Volunteer. Impact." />
      <View style={styles.content}>
        <PingNotification />
        <View style={styles.spacer} />
        <ActionButton label="Get Started" onPress={() => undefined} />
        <View style={styles.spacer} />
        <ActionButton
          label="Learn More"
          onPress={() => undefined}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  spacer: {
    height: 12,
  },
});
