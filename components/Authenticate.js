import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Modal, Picker, Alert, Platform, Text } from 'react-native';
import { Button } from "react-native-elements";
import t from "tcomb-form-native";
import Constants from "expo-constants";
import * as LocalAuthentication from "expo-local-authentication";
import PropTypes from "prop-types";

import ConditionalView from "./ConditionalView";
import { options, resetOptions } from "../lib/util";

const Authenticate = props => {
    Authenticate.propsTypes = {
        onLogin: PropTypes.func,
        onSignUp: PropTypes.func,
        onBioLogin: PropTypes.func,
        onPinCodeRequest: PropTypes.func, 
        onSubmitNewPassword: PropTypes.func,
        visible: PropTypes.bool,
        logins: PropTypes.arrayOf(PropTypes.string),
        enableBio: PropTypes.bool
    };

    const [installationId, setInstallationId] = useState("");
    const [login, setLogin] = useState(props.logins[0]);
    const [checkBio, setCheckBio] = useState(false);
    const [loginPage, setLoginPage] = useState(true);
    const [signUpPage, setSignUpPage] = useState(false);
    const [bioPage, setBioPage] = useState(false);
    const [email, setEmail] = useState(null);
    const [forgotPage, setForgotPage] = useState(false);
    const [error, setError] = useState(null);

    const signOrSignUp = () => {
        setSignUpPage(!signUpPage);
        setLoginPage(!loginPage);
        setError(null);
    };

    const bioOrPassword = () => {
        setLoginPage(!loginPage);
        setBioPage(!bioPage);
        setError(null);
    };

    const signOrForgot = () => {
        setForgotPage(!forgotPage);
        setLoginPage(!loginPage);
        setError(null);
    };

    useEffect(() => {
        setInstallationId(Constants.installationId);
        checkBioSupport()
    }, []);

    useEffect(() => {
        checkBioSupport();
        if (props.logins && props.logins.length) {
            setLogin(props.logins[0]);
        }
    }, [props.logins]);

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

    const PinCode = t.struct({
       email: Email
    });

    const emailValueContainer = useRef();

    const submitPinCodeRequest = async() => {
        const data = emailValueContainer.current.getValue();
        if(data) {
            const result = await props.onPinCodeRequest(data);
            if(result.error) {
                setError(result.error);
            } else {
                setEmail(data.email);
                setError(null);
            }
        };
    };

    const ResetPassword = t.struct({
        secretCode: t.Number,
        password: t.String
    });

    const resetPasswordContainer = useRef();

    const submitNewPassword = async () => {
        const data = resetPasswordContainer.current.getValue();
        if(data) {
            const result = await props.onSubmitNewPassword({
                ...data, 
                email
            });
            if(result.error) {
                setError(result.error);
            } else {
                setEmail(null);
                signOrForgot();
                setError(null);
            }
        };
    };
    
    const loginValueContainer = useRef();

    const submitLogin = async () => {
        const data = loginValueContainer.current.getValue();
        if(data) {
            const result = await props.onLogin({
                ...data,
                installationId
            });
            setError(result.error);
        };
    };

    const signUpValueContainer = useRef();

    const submitSignUp = async () => {
        const data = signUpValueContainer.current.getValue();
        if(data) {
            const result = await props.onSignUp({
                ...data, 
                installationId
            });
            if (result.error) {
                setError(result.error);
            }
        };
    };

    const selectingLogin = selectedLogin => {
        setLogin(selectedLogin);
    };

    scanFingerprint = async () => {
        let result = await LocalAuthentication.authenticateAsync();
        if (result.success) {
            const res = await props.onBioLogin({
                installationId,
                email: login
            });
            if (res.error) {
                setError(res.error);
            }
        };
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
                {props.children}
                {error && (<Text style={styles.error}>{error}</Text>)}
                <ConditionalView visible={loginPage} style={styles.page}>
                    <Form
                        type={Login} 
                        options={options}
                        ref={loginValueContainer}
                    />
                    <View>
                        <View style={styles.signInButton}>
                            <Button 
                                title="Sign In" 
                                onPress={submitLogin}
                            />
                        </View>
                        <View style={styles.forgotPasswordButton}>
                            <Button
                                title="Forgot password?"
                                onPress={signOrForgot}
                                type="clear"
                            />
                        </View>
                    </View>
                    {!!checkBio && 
                        (<Button
                            title="Or Unlock with Face" 
                            onPress={bioOrPassword}
                            type="clear"
                        />)}
                    <View style={styles.signUpButton}>
                        <Button
                            title="Sign Up" 
                            onPress={signOrSignUp}
                            type="clear"
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
                            type="clear"
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
                            type="clear"
                        />
                    </View>
                </ConditionalView>
                <ConditionalView visible={forgotPage&&!email} style={styles.page}>
                    <Form
                        type={PinCode}
                        options={resetOptions}
                        ref={emailValueContainer}
                    />
                    <Button
                        title="Submit"
                        onPress={submitPinCodeRequest}
                    />
                    <View style={styles.cancelButton}>
                        <Button
                            title="Cancel"
                            onPress={signOrForgot}
                            type="clear"
                        />
                    </View>
                </ConditionalView>
                <ConditionalView visible={forgotPage&&email} style={styles.page}>
                    <View style={styles.emailText}>
                        <Text style={{ fontSize: 20 }}>{email}</Text>
                    </View>
                    <Form
                        type={ResetPassword}
                        options={options}
                        ref={resetPasswordContainer}
                    />
                    <Button 
                        title="Submit"
                        onPress={submitNewPassword}
                    />
                    <View style={styles.cancelButton}>
                        <Button
                            title="Cancel"
                            onPress={signOrForgot}
                            type="clear"
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
    forgotPasswordButton: {
        marginTop: 7
    },
    cancelButton: {
        marginTop: 10
    },
    signUpButton: {
        marginTop: 50
    }, 
    orSignInButton: {
        marginTop: 20
    }, 
    orUsePasswordButton: {
        marginTop: 20
    }, 
    emailText: {
        marginBottom: 20
    }
});

export default Authenticate;
