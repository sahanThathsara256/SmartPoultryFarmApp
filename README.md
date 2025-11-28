# Smart Poultry Farm Control (Expo)

Production-ready Expo (React Native) + TypeScript starter implementing the poultry farm UI/UX you provided. It ships with authentication flow, tab navigation, MQTT communication layer, automation rules editing, manual controls, device settings, alert feeds, and mock telemetry for local testing—all runnable inside Expo Go without opening Android Studio or Xcode.

## Getting started

```bash
# install deps
npm install

# start Expo dev server (scan QR with Expo Go)
npm run start

# helpers
npm run mock      # Expo dev server with MOCK_MODE=1
npm run android   # open Android emulator / Expo Go
npm run ios       # open iOS simulator / Expo Go (macOS only)
npm run web       # preview via Expo Web
```

> The `mock` script sets `MOCK_MODE=1` so the bridge uses the built-in mock device API that emits random but realistic telemetry every ~1.5s.

### Environment variables

1. Copy `.env.example` to `.env` and plug in your MQTT broker/device credentials.
2. Restart `npm run start` whenever `.env` changes so `app.config.ts` can reload the new values.
3. Toggle `MOCK_MODE` to `0` when pointing at real hardware.

## Architecture

```
src/
  components/        // Presentational widgets (cards, toggles, wrappers)
  screens/           // Feature screens grouped by domain
  navigation/        // Stack + tab navigators
  services/          // MQTT + device abstraction
  store/             // Zustand slices (auth, device, telemetry, events, rules)
  hooks/             // Reusable hooks (e.g., telemetry bridge)
  theme/             // Shared colors and spacing tokens
  utils/             // Config, formatting, storage helpers
  types/             // Data contracts for telemetry, rules, history, etc.
```

- **State management:** Zustand slices keep side-effects out of UI components.
- **Connectivity:** `src/services/mqttClient.ts` implements the MQTT-over-WebSocket transport. Swap in other transports by adding another `DeviceApi` implementation and returning it from `getDeviceClient`.
- **Mock mode:** Any saved device settings can flip `mockMode` on to stay productive without hardware.

## MQTT topics & payloads

| Topic | Direction | Payload |
| --- | --- | --- |
| `farm/{deviceId}/telemetry` | ESP32 → App | `{ temperature, humidity, waterLevel, feedLevel, lightOn, ... }` |
| `farm/{deviceId}/command` | App → ESP32 | `{ target: 'fan', action: 'on', timestamp }` |
| `farm/{deviceId}/rules` | App → ESP32 | `{ rules: AutomationRules, updatedAt }` |

These helpers live in `src/utils/config.ts` so the topic structure is defined once.

## Persisted settings

`AsyncStorage` keeps:
- Auth session (`@smart-poultry/auth`)
- MQTT/device settings (`@smart-poultry/device-settings`)
- Automation rules (`@smart-poultry/automation-rules`)

## Styling

Color and spacing tokens live in `src/theme`. Update them to match your final Figma design system; components reference those tokens instead of hard-coded values.

## Testing ideas

- `npm run typecheck` ensures the TypeScript surface stays sound.
- `npm run lint` enforces React Native lint rules.
- Extend `useEventsStore` to ingest real notification feeds or OTA events from your backend.

Enjoy building! 🐔
