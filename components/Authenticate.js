import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Button, View, Modal } from 'react-native';
import t from "tcomb-form-native";
import Constants from 'expo-constants';
import * as LocalAuthentication from "expo-local-authentication";
import ConditionalView from "./ConditionalView";

const Authenticate = props => {
    const [installationId, setInstallationId] = useState("");

    useEffect(() => {
        setInstallationId(Constants.installationId);
    }, []);

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
                        style={styles.form}
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