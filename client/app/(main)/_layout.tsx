import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="car-detail" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
