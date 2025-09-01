import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { MainScreen } from './screens/MainScreen';
import { ListsScreen } from './screens/ListsScreen';
import { theme } from './styles/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Days') {
                iconName = 'calendar-today';
              } else if (route.name === 'Lists') {
                iconName = 'list';
              }

              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.jade.main,
            tabBarInactiveTintColor: theme.colors.text.tertiary,
            tabBarStyle: {
              backgroundColor: theme.colors.background.primary,
              borderTopColor: theme.colors.border.light,
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Days" component={MainScreen} />
          <Tab.Screen name="Lists" component={ListsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
