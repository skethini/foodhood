// Navigation.js

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from '../screens/SignUp.jsx';  // Adjust the actual path
import HomeScreen from '../screens/home.screen.jsx';      // Adjust the actual path

const Stack = createStackNavigator();

function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        {/* Add more screens as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigation;
