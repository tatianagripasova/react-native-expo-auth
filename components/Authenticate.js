import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Button, View, Modal, Picker, Alert, Platform } from 'react-native';
import t from "tcomb-form-native";
import Constants from 'expo-constants';
import * as LocalAuthentication from "expo-local-authentication";
import ConditionalView from "./ConditionalView";

const Authenticate = props => {
    const [installationId, setInstallationId] = useState("");
    const [login, setLogin] = useState(props.logins[0]);
    const [checkBio, setCheckBio] = useState(false);

    useEffect(() => {
        setInstallationId(Constants.installationId);
        checkBioSupport()
    }, []);

    const checkBioSupport = async () => {
        const result = await LocalAuthentication.isEnrolledAsync();
        console.log(result);
    };

    const Form = t.form.Form;

    const validateEmail = (email) => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return true;
        }
        return false;
    };

    const validatePassword = (repeatPassword) => {
        const pass = signUpValueContainer.current.getComponent("password").props.value;
        if(pass === repeatPassword) {
            return true;
        }
        return false;
    };

    const Email = t.refinement(t.String, validateEmail);
    const Password = t.refinement(t.String, validatePassword);

    const Login = t.struct({
        email: Email, 
        password: t.String
    });

    const SignUp = t.struct({
        email: Email, 
        password: t.String,
        repeatPassword: Password
    });

    const loginValueContainer = useRef();

    const submitLogin = () => {
        const data = loginValueContainer.current.getValue();
        if(data) {
            props.onLogin({
                ...data,
                installationId
            });
        };
    };

    const signUpValueContainer = useRef();

    const submitSignUp = () => {
        const data = signUpValueContainer.current.getValue();
        if(data) {
            props.onSignUp({
                ...data, 
                installationId
            });
        };
    };

    const selectingLogin = selectedLogin => {
        setLogin(selectedLogin);
    };

    scanFingerprint = async () => {
        let result = await LocalAuthentication.authenticateAsync();
        if (result.success)
        props.onBioLogin({
            installationId
        });
    };

    showAndroidAlert = () => {
        Alert.alert(
          "Fingerprint Scan",
          "Place your finger over the touch sensor and press scan.",
          [
            {
              text: "Scan",
              onPress: () => {
                scanFingerprint();
              },
            },
            {
              text: "Cancel",
              onPress: () => console.log('Cancel'),
              style: 'cancel',
            }
          ]
        );
      };

    const options = {
        fields: {
          email: {
            error: "Insert a valid email"
          },
          password: {
              error: "Passwords should not be empty"
          },
          repeatPassword: {
            error: "Passwords should match"
            }
        }
      };

    return (
        <Modal visible={props.visible}>
            <View style={styles.container}>
                <ConditionalView visible={false} style={styles.page}>
                    <Form 
                        type={Login} 
                        options={options}
                        ref={loginValueContainer}
                    />
                    <Button 
                        title="Sign In" 
                        onPress={submitLogin}
                    />
                </ConditionalView>
                <ConditionalView visible={false} style={styles.page}>
                    <Form
                        type={SignUp}
                        options={options}
                        ref={signUpValueContainer}
                    />
                    <Button 
                        title="Sign Up" 
                        onPress={submitSignUp}
                    />
                </ConditionalView>
                <ConditionalView visible={true} >
                    <Picker
                        selectedValue={login}
                        onValueChange={selectingLogin}
                    >
                    {props.logins.map((login) => 
                        (<Picker.Item key={login} label={login} value={login} />))
                    }
                    </Picker>
                    <Button 
                        title="Unlock" 
                        onPress={
                            Platform.OS === 'android' ? this.showAndroidAlert: this.scanFingerprint
                        }
                    />
                </ConditionalView>
            </View>
        </Modal>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    page: {
        width: "80%"
    }
});

export default Authenticate;