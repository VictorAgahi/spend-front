import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { WebSocketProvider } from "../src/infra/websocket/WebSocketProvider";

export default function RootLayout(): React.JSX.Element {
    return (
        <WebSocketProvider>
            <StatusBar style="auto" />
            <Slot />
        </WebSocketProvider>
    );
}
