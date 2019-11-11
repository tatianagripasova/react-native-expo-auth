import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Authenticate from "./components/Authenticate";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!!</Text>
      <Authenticate 
        onLogin={console.log} 
        onSignUp={console.log}
        onBioLogin={console.log}
        visible={true}
        logins={["egor", "tatiana"]}
        enableBio={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
