import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Button, View, Modal, Picker, Alert, Platform, Text } from 'react-native';
import t from "tcomb-form-native";
import Constants from 'expo-constants';
import * as LocalAuthentication from "expo-local-authentication";
import PropTypes from 'prop-types';

import ConditionalView from "./ConditionalView";
import { options } from "../lib/util";

const Authenticate = props => {
    Authenticate.propsTypes = {
        onLogin: PropTypes.func,
        onSignUp: PropTypes.func,
        onBioLogin: PropTypes.func,
        visible: PropTypes.bool,
        logins: PropTypes.arrayOf(PropTypes.string),
        enableBio: PropTypes.bool,
        error: PropTypes.string
    };

    const [installationId, setInstallationId] = useState("");
    const [login, setLogin] = useState(props.logins[0]);
    const [checkBio, setCheckBio] = useState(false);
    const [loginPage, setLoginPage] = useState(true);
    const [signUpPage, setSignUpPage] = useState(false);
    const [bioPage, setBioPage] = useState(false);

    const signOrSignUp = () => {
        setSignUpPage(!signUpPage);
        setLoginPage(!loginPage);
    };

    const bioOrPassword = () => {
        setLoginPage(!loginPage);
        setBioPage(!bioPage);
    };

    useEffect(() => {
        setInstallationId(Constants.installationId);
        checkBioSupport()
    }, []);

    const checkBioSupport = async () => {
        const result = await LocalAuthentication.isEnrolledAsync();
        setCheckBio(result && props.enableBio && props.logins && props.logins.length);
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
        return pass === repeatPassword;
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
            installationId,
            login
        });
    };

    showAndroidAlert = () => {
        Alert.alert(
          "Fingerprint Scan",
          "Place your finger over the touch sensor and press scan.",
          [{ text: "Scan", onPress: () => scanFingerprint() },
           { text: "Cancel", onPress: () => console.log('Cancel'), style: 'cancel' }]
        );
      };

    return (
        <Modal visible={props.visible}>
            <View style={styles.container}>
                {props.error && (<Text style={styles.error}>{props.error}</Text>)}
                <ConditionalView visible={loginPage} style={styles.page}>
                    <Form 
                        type={Login} 
                        options={options}
                        ref={loginValueContainer}
                    />
                    <View style={styles.signInButton}>
                        <Button 
                            title="Sign In" 
                            onPress={submitLogin}
                        />
                    </View>
                    {checkBio && 
                        (<Button 
                            title="Or Unlock with Face" 
                            onPress={bioOrPassword}
                        />)}
                    <View style={styles.signUpButton}>
                        <Button 
                            title="Sign Up" 
                            onPress={signOrSignUp}
                        />
                    </View>
                </ConditionalView>
                <ConditionalView visible={signUpPage} style={styles.page}>
                    <Form
                        type={SignUp}
                        options={options}
                        ref={signUpValueContainer}
                    />
                    <Button 
                        title="Sign Up" 
                        onPress={submitSignUp}
                    />
                    <View style={styles.orSignInButton}>
                        <Button 
                            title="Or Sign In" 
                            onPress={signOrSignUp}
                        />
                    </View>
                </ConditionalView>
                <ConditionalView visible={bioPage} >
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
                    <View style={styles.orUsePasswordButton}>
                        <Button 
                            title="Or use password"
                            onPress={bioOrPassword}
                        />
                    </View>
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
    }, 
    error: {
        color: "red",
        fontSize: 20, 
        marginBottom: 10
    },
    signInButton: {
        margin: 10
    }, 
    signUpButton: {
        marginTop: 50
    }, 
    orSignInButton: {
        marginTop: 20
    }, 
    orUsePasswordButton: {
        marginTop: 20
    }
});

export default Authenticate;
