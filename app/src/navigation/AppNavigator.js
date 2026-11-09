import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useAuth from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RoomDetailsScreen from '../screens/RoomDetailsScreen';
import RoomFormScreen from '../screens/RoomFormScreen';
import ShoppingListDetailsScreen from '../screens/ShoppingListDetailsScreen';
import ShoppingListFormScreen from '../screens/ShoppingListFormScreen';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" accessibilityLabel="Carregando" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="RoomDetails"
            component={RoomDetailsScreen}
            options={{ headerShown: true, title: 'Cômodo' }}
          />
          <Stack.Screen
            name="RoomForm"
            component={RoomFormScreen}
            options={({ route }) => ({
              headerShown: true,
              title: route.params?.roomId ? 'Editar cômodo' : 'Novo cômodo',
            })}
          />
          <Stack.Screen
            name="ProductDetails"
            component={ProductDetailsScreen}
            options={{ headerShown: true, title: 'Produto' }}
          />
          <Stack.Screen
            name="ProductForm"
            component={ProductFormScreen}
            options={({ route }) => ({
              headerShown: true,
              title: route.params?.productId ? 'Editar produto' : 'Novo produto',
            })}
          />
          <Stack.Screen
            name="ShoppingListDetails"
            component={ShoppingListDetailsScreen}
            options={{ headerShown: true, title: 'Lista' }}
          />
          <Stack.Screen
            name="ShoppingListForm"
            component={ShoppingListFormScreen}
            options={({ route }) => ({
              headerShown: true,
              title: route.params?.listId ? 'Renomear lista' : 'Nova lista',
            })}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});